class SceneSelector extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          position: fixed;
          z-index: 14;
          top: max(14px, env(safe-area-inset-top));
          right: max(14px, env(safe-area-inset-right));
          color: #f4edcf;
          font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        * { box-sizing: border-box; }

        button, a { font: inherit; }

        .trigger {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid rgba(240, 230, 186, .18);
          border-radius: 999px;
          color: #fff7d3;
          background: rgba(7, 17, 17, .76);
          box-shadow: 0 14px 38px rgba(0, 0, 0, .28);
          backdrop-filter: blur(18px) saturate(120%);
          -webkit-backdrop-filter: blur(18px) saturate(120%);
          cursor: pointer;
        }

        .trigger:active { transform: scale(.96); }
        .trigger:focus-visible { outline: 2px solid rgba(242, 232, 180, .78); outline-offset: 2px; }

        .label {
          max-width: 132px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 650;
          letter-spacing: .04em;
        }

        .chevron {
          width: 7px;
          height: 7px;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          transform: rotate(45deg) translateY(-2px);
          transition: transform .2s ease;
        }

        .trigger[aria-expanded="true"] .chevron {
          transform: rotate(225deg) translate(-1px, -1px);
        }

        .panel {
          position: absolute;
          top: calc(100% + 9px);
          right: 0;
          width: min(310px, calc(100vw - 28px));
          padding: 8px;
          border: 1px solid rgba(240, 230, 186, .16);
          border-radius: 20px;
          background: rgba(6, 15, 16, .94);
          box-shadow: 0 24px 70px rgba(0, 0, 0, .46);
          backdrop-filter: blur(24px) saturate(125%);
          -webkit-backdrop-filter: blur(24px) saturate(125%);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-5px) scale(.985);
          transform-origin: top right;
          transition: opacity .18s ease, visibility .18s ease, transform .18s ease;
        }

        .panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .home,
        .scene {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px 14px;
          align-items: center;
          width: 100%;
          padding: 12px 13px;
          border-radius: 13px;
          color: rgba(247, 240, 211, .84);
          text-decoration: none;
          transition: background .18s ease, color .18s ease;
        }

        .home:hover,
        .scene:hover,
        .home:focus-visible,
        .scene:focus-visible {
          color: #fff8d5;
          background: rgba(238, 229, 183, .09);
          outline: none;
        }

        .home {
          margin-bottom: 5px;
          border-bottom: 1px solid rgba(240, 230, 186, .1);
          border-radius: 13px 13px 5px 5px;
          font-size: 12px;
          font-weight: 650;
        }

        .scene.current { background: rgba(238, 229, 183, .1); }

        .title { font-size: 13px; font-weight: 670; letter-spacing: .02em; }
        .meta { grid-column: 1; color: rgba(235, 232, 202, .55); font-size: 10px; letter-spacing: .04em; }
        .mark { grid-row: 1 / 3; grid-column: 2; color: rgba(244, 235, 190, .68); font-size: 12px; }
        .empty { padding: 16px 13px; color: rgba(235, 232, 202, .58); font-size: 12px; }

        @media (max-width: 520px) {
          :host { top: max(12px, env(safe-area-inset-top)); right: 12px; }
          .trigger { min-height: 40px; padding: 0 12px; }
          .label { max-width: 92px; font-size: 11px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition-duration: .001ms !important; }
        }
      </style>
      <button class="trigger" type="button" aria-expanded="false" aria-haspopup="menu">
        <span class="label">场景</span>
        <span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="panel" role="menu" aria-label="切换名画场景">
        <div class="empty">正在读取场景…</div>
      </div>
    `;

    this.trigger = root.querySelector('.trigger');
    this.label = root.querySelector('.label');
    this.panel = root.querySelector('.panel');

    this.trigger.addEventListener('click', () => this.toggle());
    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });
    document.addEventListener('pointerdown', (event) => {
      if (!event.composedPath().includes(this)) this.close();
    }, { passive: true });

    this.loadScenes();
  }

  async loadScenes() {
    const manifestPath = this.getAttribute('manifest') || '../manifest.json';
    const homePath = this.getAttribute('home') || '../../';
    const currentId = this.getAttribute('current') || '';

    try {
      const response = await fetch(manifestPath, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
      const data = await response.json();
      const siteRoot = new URL(homePath, document.baseURI);
      const scenes = Array.isArray(data.scenes) ? data.scenes : [];
      const current = scenes.find((scene) => scene.id === currentId);
      if (current) this.label.textContent = current.titleZh;

      const sceneLinks = scenes.map((scene) => {
        const href = new URL(scene.path, siteRoot).href;
        const currentClass = scene.id === currentId ? ' current' : '';
        const currentMark = scene.id === currentId ? '<span class="mark" aria-label="当前场景">●</span>' : '<span class="mark">›</span>';
        return `
          <a class="scene${currentClass}" href="${href}" role="menuitem">
            <span class="title">${this.escape(scene.titleZh)} · ${this.escape(scene.titleEn)}</span>
            <span class="meta">${this.escape(scene.artistZh)} · ${this.escape(String(scene.year))}</span>
            ${currentMark}
          </a>
        `;
      }).join('');

      this.panel.innerHTML = `
        <a class="home" href="${siteRoot.href}" role="menuitem">
          <span>全部名画场景</span><span aria-hidden="true">⌂</span>
        </a>
        ${sceneLinks || '<div class="empty">暂无可用场景</div>'}
      `;
    } catch (error) {
      console.error(error);
      this.panel.innerHTML = '<div class="empty">场景列表暂时无法读取</div>';
    }
  }

  toggle() {
    const open = !this.panel.classList.contains('open');
    this.panel.classList.toggle('open', open);
    this.trigger.setAttribute('aria-expanded', String(open));
  }

  close() {
    this.panel.classList.remove('open');
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  escape(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}

if (!customElements.get('scene-selector')) {
  customElements.define('scene-selector', SceneSelector);
}
