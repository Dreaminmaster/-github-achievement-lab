# Scene structure

Each painting uses a stable subpath under `scenes/` and is registered in `manifest.json`.

- `nighthawks/` uses the shared rebuilt runtime in the repository root `src/` directory.
- `rooms-by-the-sea/` has its own standalone environment in `src/app.js`.
- Both scenes load the vendored Three.js modules, the shared scene selector, persistent mobile pinch zoom and pan, and a visible startup-error fallback.

New scenes must update the manifest, root gallery, root README, and `scripts/validate.mjs`.
