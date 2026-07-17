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

async function sampleCanvas(cdp) {
  return evaluate(cdp, `(() => {
    const source = document.querySelector('canvas');
    const sample = document.createElement('canvas');
    sample.width = 98;
    sample.height = 83;
    const context = sample.getContext('2d', { willReadFrequently: true });
    context.drawImage(source, 0, 0, sample.width, sample.height);
    return Array.from(context.getImageData(0, 0, sample.width, sample.height).data);
  })()`);
}

function pixelDifference(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return { mean: Infinity, changedFraction: 1, max: 255 };
  }
  let total = 0;
  let changed = 0;
  let max = 0;
  for (let i = 0; i < a.length; i++) {
    const delta = Math.abs(a[i] - b[i]);
    total += delta;
    if (delta > 2) changed++;
    if (delta > max) max = delta;
  }
  return { mean: total / a.length, changedFraction: changed / a.length, max };
}

async function saveState(slug, phase, value) {
  await writeFile(`${outputDir}/${slug}-${phase}.json`, JSON.stringify(value, null, 2));
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
        adjusted: document.documentElement.dataset.compositionAdjusted,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
      };
    })()`);
    await saveState(slug, 'initial', stateBefore);
    if (stateBefore.strategy !== 'anchored' || stateBefore.adjusted !== '0') {
      throw new Error(`${slug}: composition is not using an exact anchored camera (${JSON.stringify(stateBefore)})`);
    }

    const clip = { x: stateBefore.x, y: stateBefore.y, width: stateBefore.width, height: stateBefore.height, scale: 1 };
    await capture(cdp, `${outputDir}/${slug}-before.png`, clip);
    const beforePixels = await sampleCanvas(cdp);
    const x = Math.round(clip.x + clip.width * .5);
    const y = Math.round(clip.y + clip.height * .5);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, radiusX: 1, radiusY: 1, force: 1, id: 1 }] });
    await sleep(90);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(500);
    await capture(cdp, `${outputDir}/${slug}-after.png`, clip);
    const afterPixels = await sampleCanvas(cdp);
    const stateAfter = await evaluate(cdp, `({ ready: document.documentElement.dataset.compositionReady, strategy: document.documentElement.dataset.compositionStrategy })`);
    const touchDiff = pixelDifference(beforePixels, afterPixels);
    await saveState(slug, 'after-touch', { ...stateAfter, pixelDifference: touchDiff });

    if (stateAfter.ready !== 'true') throw new Error(`${slug}: a stationary touch exited composition mode`);
    if (touchDiff.mean > .02 || touchDiff.changedFraction > .002) {
      throw new Error(`${slug}: canvas visibly changed after a stationary touch (${JSON.stringify(touchDiff)})`);
    }

    await evaluate(cdp, `document.querySelector('#explore').click()`);
    await sleep(500);
    const exploredState = await evaluate(cdp, `({
      ready: document.documentElement.dataset.compositionReady,
      strategy: document.documentElement.dataset.compositionStrategy,
      explorePressed: document.querySelector('#explore').getAttribute('aria-pressed'),
      compositionPrimary: document.querySelector('#composition').classList.contains('primary')
    })`);
    await saveState(slug, 'explored', exploredState);

    await evaluate(cdp, `document.querySelector('#composition').click()`);
    await sleep(900);
    const returnedState = await evaluate(cdp, `({
      strategy: document.documentElement.dataset.compositionStrategy,
      adjusted: document.documentElement.dataset.compositionAdjusted,
      ready: document.documentElement.dataset.compositionReady,
      explorePressed: document.querySelector('#explore').getAttribute('aria-pressed'),
      compositionPrimary: document.querySelector('#composition').classList.contains('primary')
    })`);
    await capture(cdp, `${outputDir}/${slug}-returned.png`, clip);
    const returnedPixels = await sampleCanvas(cdp);
    const returnDiff = pixelDifference(beforePixels, returnedPixels);
    await saveState(slug, 'returned', { ...returnedState, pixelDifference: returnDiff });

    if (returnedState.strategy !== 'anchored' || returnedState.adjusted !== '0' || returnedState.ready !== 'true') {
      throw new Error(`${slug}: returned composition is not anchored (${JSON.stringify(returnedState)})`);
    }
    if (returnDiff.mean > .35 || returnDiff.changedFraction > .03) {
      throw new Error(`${slug}: returning from exploration produced a visibly different composition (${JSON.stringify(returnDiff)})`);
    }
    console.log(`${slug}: stationary touch and explore-to-composition return are visually stable (${JSON.stringify(returnDiff)})`);
  }

  cdp.close();
} finally {
  browser.kill('SIGTERM');
  await sleep(200);
  if (!browser.killed) browser.kill('SIGKILL');
}
