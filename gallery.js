const grid = document.querySelector('#scene-grid');
const sceneCount = document.querySelector('#scene-count');
const siteDescription = document.querySelector('#site-description');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sceneArtwork(scene) {
  if (scene.id === 'nighthawks') {
    return `
      <div class="nighthawks-mini" aria-hidden="true">
        <span class="mini-city-block"></span>
        <span class="mini-building"></span>
        <span class="mini-window"></span>
        <span class="mini-counter"></span>
        <span class="mini-person mini-person-a"></span>
        <span class="mini-person mini-person-b"></span>
        <span class="mini-person mini-person-c"></span>
        <span class="mini-street"></span>
      </div>
    `;
  }

  if (scene.id === 'rooms-by-the-sea') {
    return `
      <div class="rooms-mini" aria-hidden="true">
        <span class="rooms-wall"></span>
        <span class="rooms-shadow"></span>
        <span class="rooms-door"></span>
        <span class="rooms-ocean"></span>
        <span class="rooms-floor"></span>
        <span class="rooms-side-room"></span>
      </div>
    `;
  }

  return `
    <div class="generic-mini" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
  `;
}

function sceneCard(scene, index) {
  const palette = Array.isArray(scene.palette) ? scene.palette : [];
  const colors = [
    palette[0] || '#101719',
    palette[1] || '#e8dfb4',
    palette[2] || '#8d3a31',
    palette[3] || '#426b61'
  ];
  const href = new URL(scene.path, document.baseURI).href;
  const featureText = Array.isArray(scene.features) ? scene.features.slice(0, 4).join(' · ') : '';

  return `
    <a class="scene-card" href="${href}" style="--scene-dark:${colors[0]};--scene-light:${colors[1]};--scene-accent:${colors[2]};--scene-secondary:${colors[3]}">
      <div class="scene-visual">
        ${sceneArtwork(scene)}
        <span class="scene-index">${String(index + 1).padStart(2, '0')}</span>
        <span class="enter-mark" aria-hidden="true">↗</span>
      </div>
      <div class="scene-copy">
        <div class="scene-heading">
          <div>
            <h2>${escapeHtml(scene.titleZh)}</h2>
            <p class="english-title">${escapeHtml(scene.titleEn)}</p>
          </div>
          <p class="artist">${escapeHtml(scene.artistZh)}<br><span>${escapeHtml(scene.artistEn)} · ${escapeHtml(scene.year)}</span></p>
        </div>
        <p class="scene-description">${escapeHtml(scene.description)}</p>
        <p class="scene-features">${escapeHtml(featureText)}</p>
      </div>
    </a>
  `;
}

async function loadGallery() {
  try {
    const response = await fetch('./scenes/manifest.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    const data = await response.json();
    const scenes = Array.isArray(data.scenes)
      ? data.scenes.filter((scene) => scene.status === 'available')
      : [];

    document.title = `${data.siteTitleZh || '名画空间'} · ${data.siteTitleEn || 'Painted Worlds'}`;
    if (siteDescription && data.description) siteDescription.textContent = data.description;
    if (sceneCount) sceneCount.textContent = String(scenes.length).padStart(2, '0');

    if (!scenes.length) {
      grid.innerHTML = '<p class="empty-state">场景正在搭建中。</p>';
      return;
    }

    grid.innerHTML = scenes.map(sceneCard).join('');
  } catch (error) {
    console.error(error);
    grid.classList.add('manifest-failed');
  }
}

loadGallery();
