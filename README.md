# GitHub Workflow Lab · Nighthawks 3D

This repository now hosts a mobile-first, interactive 3D spatial study inspired by Edward Hopper's *Nighthawks* (1942).

## Experience

- Procedurally modelled diner, curved glass facade, counter, stools, street, storefronts, four figures, coffee urns, cups, signage, and night lighting.
- Mobile-first one-finger orbit, two-finger pan/zoom, double-tap composition reset, and responsive camera framing.
- Painterly materials, subtle grain, fog, shadows, reflective glass, and an optional slow orbit.
- No build step and no downloaded 3D assets: the complete scene is generated in the browser with Three.js.

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Validation

```bash
node scripts/validate.mjs
```

## Deployment

`.github/workflows/pages.yml` validates pull requests and deploys the repository root to GitHub Pages after changes reach `main`.

## Earlier lab documents

The original workflow-practice notes remain under `docs/`.
