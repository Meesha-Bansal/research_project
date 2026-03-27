# Brain.glb — Click Highlight & Explode (Three.js)

Pure HTML + Three.js viewer that loads `Brain.glb` and lets you:
- Click a labeled component to highlight it and move it outward
- Click again to restore original color/materials and position

## Run on localhost
1. Make sure Node.js is installed.
2. In this folder, run:
   - `node server.mjs`
3. Open:
   - `http://127.0.0.1:5173`

## Files
- `index.html` UI + import map for Three.js modules
- `main.js` Three.js scene, GLB loading, raycast click logic, highlight + explode toggle
- `style.css` basic styling
- `server.mjs` tiny static file server (serves `Brain.glb` correctly)

## Labels / object names
The click-to-toggle only applies when the clicked object (or one of its parents) has a name matching one of these labels:
- Cerebrum
- CorpusCallosum
- Thalamus
- Hypothalamus
- Pons
- Midbrain
- Medulla
- Cerebellum
- CerebralAqueduct

Edit the list at the top of `main.js` if your imported GLB uses different names.

## Notes
- This uses CDN imports for Three.js (`unpkg.com`). If you want it fully offline, tell me and I’ll switch it to local vendor files.

