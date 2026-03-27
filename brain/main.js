import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

const LABELS = [
  "Cerebrum",
  "CorpusCallosum",
  "Thalamus",
  "Hypothalamus",
  "Pons",
  "Midbrain",
  "Medulla",
  "Cerebellum",
  "CerebralAqueduct",
];

const LANGUAGE_CONFIG = {
  en: {
    htmlLang: "en",
    modelUrl: new URL("./Brain.glb", import.meta.url).href,
    buttonLabel: "English",
    title: "Sagital section of the human brain",
    hint: "Click a labeled component (or a label row) to toggle highlight + offset.",
    resetButton: "Reset All",
    explodeLabel: "Explode",
    loadingText: "Loading English model...",
    loadFailed: "Failed to load English model",
  },
  hi: {
    htmlLang: "hi",
    modelUrl: new URL("./Brain1.glb", import.meta.url).href,
    buttonLabel: "हिंदी",
    title: "मानव मस्तिष्क का सैजिटल सेक्शन",
    hint: "हाइलाइट और अलग करने के लिए किसी लेबल या भाग पर क्लिक करें।",
    resetButton: "रीसेट करें",
    explodeLabel: "अलग करें",
    loadingText: "हिंदी मॉडल लोड हो रहा है...",
    loadFailed: "हिंदी मॉडल लोड नहीं हुआ",
  },
  pa: {
    htmlLang: "pa",
    modelUrl: new URL("./Brain2.glb", import.meta.url).href,
    buttonLabel: "ਪੰਜਾਬੀ",
    title: "ਮਨੁੱਖੀ ਦਿਮਾਗ ਦਾ ਸੈਜਿਟਲ ਸੈਕਸ਼ਨ",
    hint: "ਹਾਈਲਾਈਟ ਅਤੇ ਵੱਖ ਕਰਨ ਲਈ ਕਿਸੇ ਲੇਬਲ ਜਾਂ ਹਿੱਸੇ ਉੱਤੇ ਕਲਿਕ ਕਰੋ।",
    resetButton: "ਰੀਸੈਟ ਕਰੋ",
    explodeLabel: "ਵੱਖ ਕਰੋ",
    loadingText: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    loadFailed: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਨਹੀਂ ਹੋਇਆ",
  },
};

const PANEL_ON_TEXT = "on";
const PANEL_OFF_TEXT = "off";
const PANEL_MISSING_TEXT = "not found in GLB";
const PANEL_RESET_TEXT = "reset";
const PANEL_PANEL_TEXT = "panel";
const PANEL_MODEL_TEXT = "model";
const PLACEHOLDER_TEXT = "—";

const canvas = document.querySelector("#c");
const resetBtn = document.querySelector("#resetBtn");
const labelsEl = document.querySelector("#labels");
const lastClickEl = document.querySelector("#lastClick");
const explodeFactorEl = document.querySelector("#explodeFactor");
const explodeFactorValEl = document.querySelector("#explodeFactorVal");
const pageTitleEl = document.querySelector("#pageTitle");
const pageHintEl = document.querySelector("#pageHint");
const explodeLabelEl = document.querySelector("#explodeLabel");
const languageButtons = Array.from(document.querySelectorAll(".langBtn"));

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = null;

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
camera.position.set(0.9, 0.5, 1.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.1, 0);

const transform = new TransformControls(camera, renderer.domElement);
transform.setMode("translate");
transform.enabled = false;
scene.add(transform);
transform.addEventListener("dragging-changed", (ev) => {
  controls.enabled = !ev.value;
});

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(2, 3, 1);
scene.add(dir);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const highlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd84d,
  emissive: 0xffc200,
  emissiveIntensity: 0.9,
  roughness: 0.25,
  metalness: 0.0,
});

const HIGHLIGHT_COLORS = [
  0xff6b6b,
  0xffd84d,
  0x4dd0ff,
  0x6bff95,
  0xb56bff,
  0xff8fd8,
  0x7cfc00,
  0xffa24d,
  0x4d7dff,
];

const highlightMaterials = new Map(); // label -> MeshStandardMaterial
function highlightMaterialForLabel(label) {
  if (highlightMaterials.has(label)) return highlightMaterials.get(label);
  const idx = Math.max(0, LABELS.indexOf(label));
  const color = HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.0,
  });
  highlightMaterials.set(label, mat);
  return mat;
}

function hexCssColor(hex) {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

function colorHexForLabel(label) {
  const idx = LABELS.indexOf(label);
  if (idx < 0) return 0xffd84d;
  return HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
}

let highlightOrderCounter = 0;
const meshBaseMaterialByUuid = new Map(); // mesh.uuid -> original material (first seen)
const meshHighlightsByUuid = new Map(); // mesh.uuid -> Map(ownerUuid -> { material, order })

function applyMeshHighlight(mesh) {
  const ownerMap = meshHighlightsByUuid.get(mesh.uuid);
  if (!ownerMap || ownerMap.size === 0) {
    const base = meshBaseMaterialByUuid.get(mesh.uuid);
    if (base) mesh.material = base;
    return;
  }

  let best = null;
  for (const v of ownerMap.values()) {
    if (!best || v.order > best.order) best = v;
  }
  if (best) mesh.material = best.material;
}

function setMeshHighlight(mesh, ownerUuid, materialOrNull) {
  if (!meshBaseMaterialByUuid.has(mesh.uuid)) meshBaseMaterialByUuid.set(mesh.uuid, mesh.material);

  let ownerMap = meshHighlightsByUuid.get(mesh.uuid);
  if (!ownerMap) {
    ownerMap = new Map();
    meshHighlightsByUuid.set(mesh.uuid, ownerMap);
  }

  if (materialOrNull) {
    ownerMap.set(ownerUuid, { material: materialOrNull, order: ++highlightOrderCounter });
  } else {
    ownerMap.delete(ownerUuid);
    if (ownerMap.size === 0) meshHighlightsByUuid.delete(mesh.uuid);
  }

  applyMeshHighlight(mesh);
}

function clearAllMeshHighlights() {
  if (gltfRoot) {
    gltfRoot.traverse((o) => {
      if (!o.isMesh) return;
      const base = meshBaseMaterialByUuid.get(o.uuid);
      if (base) o.material = base;
    });
  }
  meshHighlightsByUuid.clear();
  highlightOrderCounter = 0;
}

function normalizeName(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const labelNorms = LABELS.map(normalizeName);
const labelSet = new Set(labelNorms);

let currentLanguage = "en";
let gltfRoot = null;
let brainCenterWorld = new THREE.Vector3();
let lastSelected = null; // Object3D currently attached to TransformControls
let loadRequestId = 0;

const componentState = new Map();
// root.uuid -> { exploded:boolean, origPos:Vector3, origQuat:Quaternion, origScale:Vector3, origMatrix:Matrix4, origMAU:boolean, meshMats: Map(mesh.uuid, originalMaterial|originalMaterial[]) }
const selectedRoots = new Set(); // Set<Object3D.uuid>
const selectedObjectsByUuid = new Map(); // uuid -> Object3D (for lastSelected switching)

function getLanguageConfig(language = currentLanguage) {
  return LANGUAGE_CONFIG[language] ?? LANGUAGE_CONFIG.en;
}

function panelText(label, state) {
  return `${label} (${state})`;
}

function findByNameRecursive(root, exactName) {
  let found = null;
  root.traverse((o) => {
    if (found) return;
    if (o.name === exactName) found = o;
  });
  return found;
}

function findByUUIDRecursive(root, uuid) {
  let found = null;
  root.traverse((o) => {
    if (found) return;
    if (o.uuid === uuid) found = o;
  });
  return found;
}

function findBestLabelRoot(root, label) {
  const labelNorm = normalizeName(label);
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  root.traverse((o) => {
    if (bestScore === 0) return;
    if (!o.name) return;

    const n = normalizeName(o.name);
    if (!n) return;

    if (n === labelNorm) {
      best = o;
      bestScore = 0;
      return;
    }

    if (n.startsWith(labelNorm)) {
      const score = 1 + (n.length - labelNorm.length);
      if (score < bestScore) {
        best = o;
        bestScore = score;
      }
    }
  });

  return best;
}

function computeBrainCenter(root) {
  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  box.getCenter(center);
  return center;
}

function componentRootForHit(obj) {
  let cur = obj;
  while (cur) {
    const n = normalizeName(cur.name);
    for (const labelNorm of labelNorms) {
      if (n === labelNorm || n.startsWith(labelNorm)) return cur;
    }
    cur = cur.parent;
  }
  return null;
}

function nearestNamedRootForHit(obj) {
  let cur = obj;
  while (cur) {
    const name = cur.name || "";
    if (name && !isGlbMarkerName(name)) return cur;
    cur = cur.parent;
  }
  return null;
}

function canonicalComponentRootFromHit(obj) {
  const hitRoot = componentRootForHit(obj);
  if (!hitRoot || !gltfRoot) return nearestNamedRootForHit(obj) ?? hitRoot;

  const label = labelForComponentRoot(hitRoot);
  if (!label) return hitRoot;
  if (label === "Cerebrum") return hitRoot;

  return findBestLabelRoot(gltfRoot, label) ?? hitRoot;
}

function labelForComponentRoot(root) {
  const n = normalizeName(root?.name || "");
  if (!n) return null;
  for (const label of LABELS) {
    const ln = normalizeName(label);
    if (n === ln || n.startsWith(ln)) return label;
  }
  return null;
}

function cerebrumTargets(root) {
  const targets = [];
  root.traverse((o) => {
    if (!o.name) return;
    if (isCerebrumLikeName(o.name)) {
      targets.push(o);
    }
  });
  return targets;
}

function isCerebrumLikeName(name) {
  const n = String(name || "").toLowerCase();
  if (!n) return false;
  return (
    n.includes("gyrus") ||
    n.includes("sulcus") ||
    n.includes("lobule") ||
    n.includes("pole") ||
    n.includes("cuneus") ||
    n.includes("precuneus") ||
    n.includes("insula") ||
    n.includes("occipital") ||
    n.includes("temporal") ||
    n.includes("parietal") ||
    n.includes("frontal")
  );
}

function targetsForLabel(label) {
  if (!gltfRoot) return [];
  if (label === "Cerebrum") return cerebrumTargets(gltfRoot);
  const obj = findBestLabelRoot(gltfRoot, label);
  return obj ? [obj] : [];
}

function isGlbMarkerName(name) {
  const s = String(name || "");
  return s.startsWith("Text") || s.startsWith("Cylinder");
}

function collectMeshes(root) {
  const meshes = [];
  root.traverse((o) => {
    if (o.isMesh && !isGlbMarkerName(o.name)) meshes.push(o);
  });
  return meshes;
}

function maxDimensionWorld(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  return Math.max(size.x, size.y, size.z);
}

function setHighlighted(root, on, labelForColor = null) {
  const state = componentState.get(root.uuid) ?? {
    exploded: false,
    origPos: root.position.clone(),
    origQuat: root.quaternion.clone(),
    origScale: root.scale.clone(),
    origMatrix: root.matrix.clone(),
    origMAU: root.matrixAutoUpdate,
    meshMats: new Map(),
  };

  const mat = labelForColor ? highlightMaterialForLabel(labelForColor) : highlightMaterial;
  const meshes = collectMeshes(root);
  for (const mesh of meshes) {
    if (on) setMeshHighlight(mesh, root.uuid, mat);
    else setMeshHighlight(mesh, root.uuid, null);
  }

  componentState.set(root.uuid, state);
}

function ensureEditableTransform(root, state) {
  if (!root) return;

  // If the node came in with a baked matrix (common in glTF), Three sets matrixAutoUpdate=false.
  // TransformControls (and our explode) manipulates TRS, so switch to TRS mode while preserving pose.
  if (root.matrixAutoUpdate === false) {
    // Preserve the current world/local pose encoded in the matrix.
    root.matrix.decompose(root.position, root.quaternion, root.scale);
    root.matrixAutoUpdate = true;
    root.updateMatrix();
    root.updateMatrixWorld(true);
  }

  // Ensure we can restore exactly later.
  if (state && state.origMAU === undefined) state.origMAU = root.matrixAutoUpdate;
  if (state && !state.origMatrix) state.origMatrix = root.matrix.clone();
}

function restoreOriginalTransform(root, state) {
  if (!root || !state) return;

  if (state.origMAU === false && state.origMatrix) {
    root.matrixAutoUpdate = false;
    root.matrix.copy(state.origMatrix);
    root.matrixWorldNeedsUpdate = true;
    root.updateMatrixWorld(true);
    return;
  }

  if (state.origPos) root.position.copy(state.origPos);
  if (state.origQuat) root.quaternion.copy(state.origQuat);
  if (state.origScale) root.scale.copy(state.origScale);
  root.matrixAutoUpdate = true;
  root.updateMatrix();
  root.updateMatrixWorld(true);
}

function moveOutward(root, factor) {
  const state = componentState.get(root.uuid) ?? {
    exploded: false,
    origPos: root.position.clone(),
    origQuat: root.quaternion.clone(),
    origScale: root.scale.clone(),
    origMatrix: root.matrix.clone(),
    origMAU: root.matrixAutoUpdate,
    meshMats: new Map(),
  };

  if (!state.exploded) {
    state.origPos = root.position.clone();
    state.origQuat = root.quaternion.clone();
    state.origScale = root.scale.clone();
    state.origMatrix = root.matrix.clone();
    state.origMAU = root.matrixAutoUpdate;
    ensureEditableTransform(root, state);

    const rootWorldPos = new THREE.Vector3();
    root.getWorldPosition(rootWorldPos);

    const dirWorld = rootWorldPos.clone().sub(brainCenterWorld);
    if (dirWorld.lengthSq() < 1e-10) dirWorld.set(0, 0, 1);
    dirWorld.normalize();

    const dim = maxDimensionWorld(root);
    const dist = Math.max(0.02, dim * factor);

    const targetWorld = rootWorldPos.clone().add(dirWorld.multiplyScalar(dist));
    const targetLocal = targetWorld.clone();
    if (root.parent) root.parent.worldToLocal(targetLocal);

    root.position.copy(targetLocal);
    state.exploded = true;
  } else {
    restoreOriginalTransform(root, state);
    state.exploded = false;
  }

  componentState.set(root.uuid, state);
}

function attachTransformTo(root) {
  if (!root) return;
  const state = componentState.get(root.uuid);
  ensureEditableTransform(root, state);
  lastSelected = root;
  transform.enabled = true;
  transform.attach(root);
}

function detachTransformIfAttached(root) {
  if (!transform.object) return;
  if (!root || transform.object === root) {
    transform.detach();
    transform.enabled = false;
    if (lastSelected === root) lastSelected = null;
  }
}

function selectComponent(root, { label = null } = {}) {
  const state = componentState.get(root.uuid) ?? {
    exploded: false,
    origPos: root.position.clone(),
    origQuat: root.quaternion.clone(),
    origScale: root.scale.clone(),
    origMatrix: root.matrix.clone(),
    origMAU: root.matrixAutoUpdate,
    meshMats: new Map(),
  };

  if (state.exploded) return;

  const factor = Number(explodeFactorEl.value);
  const resolvedLabel = label || labelForComponentRoot(root) || (isCerebrumLikeName(root.name) ? "Cerebrum" : null);
  setHighlighted(root, true, resolvedLabel);
  moveOutward(root, factor);
  selectedRoots.add(root.uuid);
  selectedObjectsByUuid.set(root.uuid, root);
  lastSelected = root;
}

function deselectComponent(root, { label = null } = {}) {
  const state = componentState.get(root.uuid);
  if (!state?.exploded) return;

  const factor = Number(explodeFactorEl.value);
  moveOutward(root, factor);
  setHighlighted(root, false);
  detachTransformIfAttached(root);

  selectedRoots.delete(root.uuid);
  selectedObjectsByUuid.delete(root.uuid);
  if (lastSelected === root) {
    lastSelected = selectedObjectsByUuid.values().next().value ?? null;
  }
}

function toggleComponent(root, opts) {
  const state = componentState.get(root.uuid);
  if (state?.exploded) deselectComponent(root, opts);
  else selectComponent(root, opts);
}

function resetAll() {
  if (!gltfRoot) return;
  for (const [uuid, state] of componentState.entries()) {
    const obj = findByUUIDRecursive(gltfRoot, uuid);
    if (!obj) continue;
    restoreOriginalTransform(obj, state);
    setHighlighted(obj, false);
    state.exploded = false;
  }
  clearAllMeshHighlights();
  selectedRoots.clear();
  selectedObjectsByUuid.clear();
  transform.detach();
  transform.enabled = false;
  lastSelected = null;
}

function resetModelState() {
  selectedRoots.clear();
  selectedObjectsByUuid.clear();
  componentState.clear();
  clearAllMeshHighlights();
  transform.detach();
  transform.enabled = false;
  lastSelected = null;
}

function removeCurrentModel() {
  if (gltfRoot) {
    scene.remove(gltfRoot);
    gltfRoot = null;
  }
  resetModelState();
  brainCenterWorld.set(0, 0, 0);
}

function updateLabelPanel() {
  labelsEl.innerHTML = "";

  for (const label of LABELS) {
    const row = document.createElement("div");
    row.className = "labelRow";
    row.style.cursor = "pointer";

    const left = document.createElement("div");
    left.className = "labelName";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = label;
    left.appendChild(name);

    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = PANEL_OFF_TEXT;

    row.appendChild(left);
    row.appendChild(pill);
    labelsEl.appendChild(row);

    row._brain = { label, pillEl: pill };

    row.addEventListener("click", () => {
      if (!gltfRoot) return;

      const targets = targetsForLabel(label);
      if (!targets.length) {
        lastClickEl.textContent = panelText(label, PANEL_MISSING_TEXT);
        refreshLabelStatuses();
        return;
      }

      lastClickEl.textContent = panelText(label, PANEL_PANEL_TEXT);
      for (const obj of targets) {
        if (selectedRoots.has(obj.uuid)) deselectComponent(obj, { label });
        else selectComponent(obj, { label });
      }
      refreshLabelStatuses();
    });
  }
}

function refreshLabelStatuses() {
  const rows = Array.from(labelsEl.children);
  for (const row of rows) {
    const { label, pillEl } = row._brain ?? {};
    if (!label) continue;

    const targets = gltfRoot ? targetsForLabel(label) : [];
    if (!targets.length) {
      pillEl.textContent = PLACEHOLDER_TEXT;
      row.classList.remove("active");
      continue;
    }

    const onCount = targets.reduce((acc, o) => acc + (componentState.get(o.uuid)?.exploded ? 1 : 0), 0);
    pillEl.textContent = onCount ? PANEL_ON_TEXT : PANEL_OFF_TEXT;

    const idx = Math.max(0, LABELS.indexOf(label));
    const color = HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
    row.style.setProperty("--labelColor", hexCssColor(color));
    row.classList.toggle("active", onCount > 0);
  }
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);

function onPointerDown(ev) {
  if (!gltfRoot) return;
  if (transform.dragging) return;
  // TransformControls runs before this handler; if user clicked a gizmo axis, avoid toggling selection.
  if (transform.enabled && transform.axis) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObject(gltfRoot, true);
  if (!hits.length) return;

  const hit = hits[0].object;
  const root = canonicalComponentRootFromHit(hit);
  lastClickEl.textContent = root ? panelText(root.name, `${PANEL_MODEL_TEXT}: ${hit.name || hit.type}`) : `${hit.name || hit.type}`;

  if (!root) return;

  // Toggle selection on single click; allows multi-select.
  if (selectedRoots.has(root.uuid)) deselectComponent(root);
  else selectComponent(root);
  refreshLabelStatuses();
}

canvas.addEventListener("pointerdown", onPointerDown);
resetBtn.addEventListener("click", () => {
  resetAll();
  refreshLabelStatuses();
  lastClickEl.textContent = PANEL_RESET_TEXT;
});
explodeFactorEl.addEventListener("input", () => {
  explodeFactorValEl.textContent = String(explodeFactorEl.value);
  if (!gltfRoot) return;

  const factor = Number(explodeFactorEl.value);
  for (const uuid of selectedRoots) {
    const obj = findByUUIDRecursive(gltfRoot, uuid);
    const state = obj ? componentState.get(uuid) : null;
    if (!obj || !state?.exploded) continue;

    // Recompute the exploded offset at the new factor without changing selection/highlight.
    restoreOriginalTransform(obj, state);
    state.exploded = false;
    componentState.set(uuid, state);
    moveOutward(obj, factor);
  }
  refreshLabelStatuses();
});

window.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    transform.detach();
    transform.enabled = false;
    lastSelected = null;
    return;
  }

  if (ev.key === "t" || ev.key === "T") {
    if (!lastSelected) return;
    attachTransformTo(lastSelected);
    transform.setMode("translate");
  }
  if (ev.key === "r" || ev.key === "R") {
    if (!lastSelected) return;
    attachTransformTo(lastSelected);
    transform.setMode("rotate");
  }
});

updateLabelPanel();
explodeFactorValEl.textContent = String(explodeFactorEl.value);

const loader = new GLTFLoader();

function applyLanguageUI() {
  const config = getLanguageConfig();
  document.documentElement.lang = config.htmlLang;
  document.title = config.title;
  pageTitleEl.textContent = config.title;
  pageHintEl.textContent = config.hint;
  explodeLabelEl.textContent = config.explodeLabel;
  resetBtn.textContent = config.resetButton;

  for (const button of languageButtons) {
    const language = button.dataset.language;
    button.textContent = LANGUAGE_CONFIG[language]?.buttonLabel ?? language;
    button.classList.toggle("active", language === currentLanguage);
  }
}

function setControlsDisabled(disabled) {
  resetBtn.disabled = disabled;
  explodeFactorEl.disabled = disabled;
  for (const button of languageButtons) button.disabled = disabled;
}

function loadCurrentLanguageModel() {
  const requestId = ++loadRequestId;
  const config = getLanguageConfig();

  setControlsDisabled(true);
  lastClickEl.textContent = config.loadingText;

  loader.load(
    config.modelUrl,
    (gltf) => {
      if (requestId !== loadRequestId) return;

      removeCurrentModel();
      gltfRoot = gltf.scene;

      gltfRoot.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = false;
          o.receiveShadow = false;
          o.frustumCulled = true;
          if (isGlbMarkerName(o.name)) o.raycast = () => {};
        }
      });

      scene.add(gltfRoot);

      brainCenterWorld = computeBrainCenter(gltfRoot);
      controls.target.copy(brainCenterWorld);
      controls.update();

      refreshLabelStatuses();
      lastClickEl.textContent = PLACEHOLDER_TEXT;
      setControlsDisabled(false);
    },
    undefined,
    (err) => {
      if (requestId !== loadRequestId) return;
      console.error(err);
      lastClickEl.textContent = config.loadFailed;
      setControlsDisabled(false);
    }
  );
}

function switchLanguage(language) {
  if (!LANGUAGE_CONFIG[language] || language === currentLanguage) return;
  currentLanguage = language;
  applyLanguageUI();
  loadCurrentLanguageModel();
}

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    switchLanguage(button.dataset.language);
  });
}

applyLanguageUI();
loadCurrentLanguageModel();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

resize();
animate();
