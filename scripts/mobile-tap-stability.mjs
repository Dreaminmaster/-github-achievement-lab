import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

const chrome = process.argv[2];
if (!chrome) throw new Error('Usage: node scripts/mobile-tap-stability.mjs /path/to/chrome');
if (typeof WebSocket === 'undefined') throw new Error('This test requires the Node.js WebSocket global.');

const port = 9333 + Math.floor(Math.random() * 300);
const profile = `/tmp/painted-worlds-cdp-${process.pid}`;
const outputDir = '/tmp/tap-stability';
await mkdir(outputDir, { recursive: true });

const browser = spawn(chrome, [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--enable-webgl',
  '--ignore-gpu-blocklist',
  '--hide-scrollbars',
  '--force-prefers-reduced-motion',
  '--window-size=390,844',
  'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

let browserErrors = '';
browser.stderr.on('data', (chunk) => { browserErrors += chunk.toString(); });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForJson(url, attempts = 80) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await sleep(100);
  }
  throw new Error(`Chrome debugging endpoint did not start: ${url}\n${browserErrors}`);
}

class CDP {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
  }
  async ready() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`${waiter.method}: ${message.error.message}`));
      else waiter.resolve(message.result ?? {});
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  return result.result?.value;
}

async function waitFor(cdp, expression, label, attempts = 160) {
  for (let i = 0; i < attempts; i++) {
    if (await evaluate(cdp, expression)) return;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function capture(cdp, file, clip) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, clip });
  const bytes = Buffer.from(result.data, 'base64');
  await writeFile(file, bytes);
  return bytes;
}

try {
  await waitForJson(`http://127.0.0.1:${port}/json/version`);
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((response) => response.json());
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.ready();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  const slugs = ['nighthawks', 'rooms-by-the-sea', 'last-supper', 'the-subway'];
  for (const slug of slugs) {
    const url = `http://127.0.0.1:4173/scenes/${slug}/?tapTest=1`;
    await cdp.send('Page.navigate', { url });
    await waitFor(cdp, `document.readyState === 'complete'`, `${slug} document`);
    await waitFor(cdp, `document.querySelector('#loading')?.classList.contains('done')`, `${slug} loading`);
    await waitFor(cdp, `document.documentElement.dataset.compositionReady === 'true'`, `${slug} initial composition`);

    const stateBefore = await evaluate(cdp, `(() => {
      const canvas = document.querySelector('canvas');
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.left,
        y: Math.max(rect.top + 240, 245),
        width: Math.min(rect.width, 390),
        height: Math.min(330, Math.max(180, rect.bottom - Math.max(rect.top + 240, 245) - 150)),
        ready: document.documentElement.dataset.compositionReady,
        strategy: document.documentElement.dataset.compositionStrategy,
        adjusted: document.documentElement.dataset.compositionAdjusted
      };
    })()`);
    if (stateBefore.strategy !== 'anchored' || stateBefore.adjusted !== '0') {
      throw new Error(`${slug}: composition is not using an exact anchored camera (${JSON.stringify(stateBefore)})`);
    }

    const clip = { x: stateBefore.x, y: stateBefore.y, width: stateBefore.width, height: stateBefore.height, scale: 1 };
    const before = await capture(cdp, `${outputDir}/${slug}-before.png`, clip);
    const x = Math.round(clip.x + clip.width * .5);
    const y = Math.round(clip.y + clip.height * .5);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, radiusX: 1, radiusY: 1, force: 1, id: 1 }] });
    await sleep(90);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(500);
    const after = await capture(cdp, `${outputDir}/${slug}-after.png`, clip);
    const stateAfter = await evaluate(cdp, `({ ready: document.documentElement.dataset.compositionReady, strategy: document.documentElement.dataset.compositionStrategy })`);

    if (stateAfter.ready !== 'true') throw new Error(`${slug}: a stationary touch exited composition mode`);
    if (!before.equals(after)) throw new Error(`${slug}: canvas changed after a stationary touch; see tap-stability artifact`);

    // Exercise the exact controls used by the user instead of relying on a timed DOM dump.
    await evaluate(cdp, `document.querySelector('#explore').click()`);
    await sleep(350);
    await evaluate(cdp, `document.querySelector('#composition').click()`);
    await waitFor(cdp, `document.documentElement.dataset.compositionReady === 'true'`, `${slug} returned composition`);
    await sleep(120);
    const returned = await capture(cdp, `${outputDir}/${slug}-returned.png`, clip);
    const returnedState = await evaluate(cdp, `({
      strategy: document.documentElement.dataset.compositionStrategy,
      adjusted: document.documentElement.dataset.compositionAdjusted,
      ready: document.documentElement.dataset.compositionReady
    })`);
    if (returnedState.strategy !== 'anchored' || returnedState.adjusted !== '0' || returnedState.ready !== 'true') {
      throw new Error(`${slug}: returned composition is not anchored (${JSON.stringify(returnedState)})`);
    }
    if (!before.equals(returned)) throw new Error(`${slug}: returning from exploration did not reproduce the initial composition`);
    console.log(`${slug}: stationary touch and explore-to-composition return are stable`);
  }

  cdp.close();
} finally {
  browser.kill('SIGTERM');
  await sleep(200);
  if (!browser.killed) browser.kill('SIGKILL');
}
