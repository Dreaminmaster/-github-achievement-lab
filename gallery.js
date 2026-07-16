const grid = document.querySelector('#scene-grid');
const sceneCount = document.querySelector('#scene-count');
const siteDescription = document.querySelector('#site-description');

const galleryArtStyles = document.createElement('style');
galleryArtStyles.textContent = `
.last-supper-mini{position:absolute;inset:0;overflow:hidden;background:linear-gradient(#4a382c 0 16%,#8b7d69 16% 71%,#765f47 71%)}
.last-supper-mini .ls-ceiling{position:absolute;left:10%;right:10%;top:0;height:28%;background:repeating-linear-gradient(90deg,transparent 0 10%,#493326 10% 12%),repeating-linear-gradient(180deg,transparent 0 28%,#493326 28% 34%);clip-path:polygon(0 0,100% 0,82% 100%,18% 100%)}
.last-supper-mini .ls-window{position:absolute;top:28%;width:12%;height:25%;background:linear-gradient(#a8b2a8,#6f7862);border:4px solid #695c4c}.last-supper-mini .ls-window-a{left:32%}.last-supper-mini .ls-window-b{left:44%}.last-supper-mini .ls-window-c{left:56%}
.last-supper-mini .ls-table{position:absolute;left:9%;right:9%;top:59%;height:15%;background:#c7bda6;box-shadow:0 8px #68452e;transform:perspective(500px) rotateX(13deg)}
.last-supper-mini .ls-figures{position:absolute;left:13%;right:13%;top:44%;height:22%;background:radial-gradient(circle at 50% 8%,#bf9274 0 2.3%,transparent 2.5%),repeating-linear-gradient(90deg,#536779 0 4%,#8b5f3d 4% 8%,#716548 8% 12%,#7a3d37 12% 16%);clip-path:polygon(0 28%,4% 0,8% 30%,12% 4%,16% 30%,20% 0,24% 30%,28% 5%,32% 30%,36% 0,40% 30%,44% 6%,48% 30%,50% 0,52% 30%,56% 6%,60% 30%,64% 0,68% 30%,72% 5%,76% 30%,80% 0,84% 30%,88% 4%,92% 30%,96% 0,100% 28%,100% 100%,0 100%)}
.subway-mini{position:absolute;inset:0;overflow:hidden;background:linear-gradient(#aaa99d 0 14%,#c4c2b3 14% 74%,#89877a 74%)}
.subway-mini .sw-columns{position:absolute;inset:9% 4% 0;background:repeating-linear-gradient(90deg,transparent 0 12%,#bdbbad 12% 17%,transparent 17% 27%);transform:perspective(500px) rotateX(3deg)}
.subway-mini .sw-gate{position:absolute;right:11%;top:20%;width:31%;height:53%;border:4px solid #28302d;background:repeating-linear-gradient(90deg,transparent 0 9%,#28302d 9% 11%),repeating-linear-gradient(180deg,transparent 0 20%,#28302d 20% 22%)}
.subway-mini .sw-passage{position:absolute;left:4%;top:24%;width:38%;height:34%;background:#d0cdbd;clip-path:polygon(0 0,100% 15%,100% 85%,0 100%);box-shadow:inset -18px 0 #596c58}
.subway-mini .sw-woman{position:absolute;left:47%;top:36%;width:7%;height:34%;border-radius:44% 44% 16% 16%;background:linear-gradient(90deg,#3c4c56 0 22%,#934737 22% 78%,#3c4c56 78%);box-shadow:0 -18px 0 -7px #cba086}
.subway-mini .sw-crowd{position:absolute;left:22%;right:15%;top:39%;height:28%;background:repeating-linear-gradient(90deg,#8a4c34 0 7%,transparent 7% 13%,#9a744a 13% 20%,transparent 20% 27%);opacity:.95}
`;
document.head.appendChild(galleryArtStyles);

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
    return `<div class="nighthawks-mini" aria-hidden="true"><span class="mini-city-block"></span><span class="mini-building"></span><span class="mini-window"></span><span class="mini-counter"></span><span class="mini-person mini-person-a"></span><span class="mini-person mini-person-b"></span><span class="mini-person mini-person-c"></span><span class="mini-street"></span></div>`;
  }
  if (scene.id === 'rooms-by-the-sea') {
    return `<div class="rooms-mini" aria-hidden="true"><span class="rooms-wall"></span><span class="rooms-shadow"></span><span class="rooms-door"></span><span class="rooms-ocean"></span><span class="rooms-floor"></span><span class="rooms-side-room"></span></div>`;
  }
  if (scene.id === 'last-supper') {
    return `<div class="last-supper-mini" aria-hidden="true"><span class="ls-ceiling"></span><span class="ls-window ls-window-a"></span><span class="ls-window ls-window-b"></span><span class="ls-window ls-window-c"></span><span class="ls-figures"></span><span class="ls-table"></span></div>`;
  }
  if (scene.id === 'the-subway') {
    return `<div class="subway-mini" aria-hidden="true"><span class="sw-columns"></span><span class="sw-passage"></span><span class="sw-gate"></span><span class="sw-crowd"></span><span class="sw-woman"></span></div>`;
  }
  return `<div class="generic-mini" aria-hidden="true"><span></span><span></span><span></span></div>`;
}

function sceneCard(scene, index) {
  const palette = Array.isArray(scene.palette) ? scene.palette : [];
  const colors = [palette[0] || '#101719', palette[1] || '#e8dfb4', palette[2] || '#8d3a31', palette[3] || '#426b61'];
  const href = new URL(scene.path, document.baseURI).href;
  const featureText = Array.isArray(scene.features) ? scene.features.slice(0, 4).join(' · ') : '';
  return `
    <a class="scene-card" href="${href}" style="--scene-dark:${colors[0]};--scene-light:${colors[1]};--scene-accent:${colors[2]};--scene-secondary:${colors[3]}">
      <div class="scene-visual">${sceneArtwork(scene)}<span class="scene-index">${String(index + 1).padStart(2, '0')}</span><span class="enter-mark" aria-hidden="true">↗</span></div>
      <div class="scene-copy">
        <div class="scene-heading"><div><h2>${escapeHtml(scene.titleZh)}</h2><p class="english-title">${escapeHtml(scene.titleEn)}</p></div><p class="artist">${escapeHtml(scene.artistZh)}<br><span>${escapeHtml(scene.artistEn)} · ${escapeHtml(scene.year)}</span></p></div>
        <p class="scene-description">${escapeHtml(scene.description)}</p>
        <p class="scene-features">${escapeHtml(featureText)}</p>
      </div>
    </a>`;
}

async function loadGallery() {
  try {
    const response = await fetch('./scenes/manifest.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    const data = await response.json();
    const scenes = Array.isArray(data.scenes) ? data.scenes.filter((scene) => scene.status === 'available') : [];
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
