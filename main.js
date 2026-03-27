import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const LANGUAGE_CONFIG = {
  en: {
    htmlLang: "en",
    modelUrl: "./neuron.glb",
    buttonLabel: "English",
    title: "Structure of a neuron",
    hint: "Click a model part or a label to toggle highlight. Drag to orbit. Scroll to zoom.",
    viewerTitle: "3D Model",
    labelsTitle: "Labels",
    lastClickTitle: "Last Click",
    resetButton: "Reset All",
    loadingText: "Loading English model...",
    resetState: "reset",
    modelState: "model",
    onState: "on",
    offState: "off",
    missingState: "missing in GLB",
    loadFailed: "Failed to load English model",
  },
  hi: {
    htmlLang: "hi",
    modelUrl: "./neuron1.glb",
    buttonLabel: "हिंदी",
    title: "न्यूरॉन की संरचना",
    hint: "हाइलाइट बदलने के लिए मॉडल के भाग या लेबल पर क्लिक करें। घुमाने के लिए ड्रैग करें। ज़ूम करने के लिए स्क्रॉल करें।",
    viewerTitle: "3D मॉडल",
    labelsTitle: "लेबल",
    lastClickTitle: "अंतिम क्लिक",
    resetButton: "रीसेट करें",
    loadingText: "हिंदी मॉडल लोड हो रहा है...",
    resetState: "रीसेट",
    modelState: "मॉडल",
    onState: "चालू",
    offState: "बंद",
    missingState: "GLB में नहीं मिला",
    loadFailed: "हिंदी मॉडल लोड नहीं हुआ",
  },
  pa: {
    htmlLang: "pa",
    modelUrl: "./neuron2.glb",
    buttonLabel: "ਪੰਜਾਬੀ",
    title: "ਨਿਊਰੋਨ ਦੀ ਬਣਤਰ",
    hint: "ਹਾਈਲਾਈਟ ਬਦਲਣ ਲਈ ਮਾਡਲ ਦੇ ਹਿੱਸੇ ਜਾਂ ਲੇਬਲ ਉੱਤੇ ਕਲਿਕ ਕਰੋ। ਘੁਮਾਉਣ ਲਈ ਡ੍ਰੈਗ ਕਰੋ। ਜ਼ੂਮ ਕਰਨ ਲਈ ਸਕ੍ਰੋਲ ਕਰੋ।",
    viewerTitle: "3D ਮਾਡਲ",
    labelsTitle: "ਲੇਬਲ",
    lastClickTitle: "ਆਖਰੀ ਕਲਿਕ",
    resetButton: "ਰੀਸੈਟ ਕਰੋ",
    loadingText: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    resetState: "ਰੀਸੈਟ",
    modelState: "ਮਾਡਲ",
    onState: "ਚਾਲੂ",
    offState: "ਬੰਦ",
    missingState: "GLB ਵਿੱਚ ਨਹੀਂ ਮਿਲਿਆ",
    loadFailed: "ਪੰਜਾਬੀ ਮਾਡਲ ਲੋਡ ਨਹੀਂ ਹੋਇਆ",
  },
};

const COLORS = [
  0xff6b6b,
  0xffd84d,
  0x4dd0ff,
  0x6bff95,
  0xb56bff,
  0xff8fd8,
  0xffa24d,
  0x3de0c6,
  0x6f7cff,
  0xff5fd1,
];

const LABEL_DEFS = [
  {
    key: "dendrites",
    names: { en: "Dendrites", hi: "डेंड्राइट्स", pa: "ਡੈਂਡਰਾਈਟਸ" },
    aliases: ["dendrites"],
  },
  {
    key: "nissl",
    names: { en: "Nissl's granules", hi: "निस्ल कणिकाएं", pa: "ਨਿਸਲ ਦਾਣੇ" },
    aliases: ["Nissl's granules", "Nissl's granlues", "Nissls granules"],
  },
  {
    key: "cell_body",
    names: { en: "Cell body", hi: "कोशिका देह", pa: "ਕੋਸ਼ਿਕਾ ਦੇਹ" },
    aliases: ["Cell body", "cellbody"],
  },
  {
    key: "nucleus",
    names: { en: "Nucleus", hi: "केंद्रक", pa: "ਕੇਂਦਰਕ" },
    aliases: ["Nucleus"],
  },
  {
    key: "schwan",
    names: { en: "Schwan cell", hi: "श्वान कोशिका", pa: "ਸ਼ਵਾਨ ਕੋਸ਼ਿਕਾ" },
    aliases: ["Schwan cell", "Schwan Cell", "Schwann cell", "Schwann Cell"],
  },
  {
    key: "axon",
    names: { en: "Axon", hi: "ऐक्सॉन", pa: "ਐਕਸਾਨ" },
    aliases: ["Axon"],
  },
  {
    key: "myelin",
    names: { en: "Myelin sheath", hi: "मायलिन आवरण", pa: "ਮਾਇਲਿਨ ਪਰਤ" },
    aliases: ["Myelin sheath", "myelin sheath", "Myelin Sheath"],
  },
  {
    key: "node_ranvier",
    names: { en: "Node of Ranvier", hi: "रैनवीयर का नोड", pa: "ਰੈਨਵੀਅਰ ਦਾ ਨੋਡ" },
    aliases: ["Node of Ranvier", "Node of Ranveir", "Node of ranveir"],
  },
  {
    key: "axon_terminal",
    names: { en: "Axon terminal", hi: "ऐक्सॉन टर्मिनल", pa: "ਐਕਸਾਨ ਟਰਮੀਨਲ" },
    aliases: ["Axon terminal", "Axin terminal", "Axon Terminal"],
  },
  {
    key: "synaptic_knob",
    names: { en: "Synaptic knob", hi: "सिनेप्टिक नॉब", pa: "ਸਿਨੈਪਟਿਕ ਨੱਬ" },
    aliases: ["Synaptic knob", "SynapticKnob", "Synaptic Knob"],
  },
];

const LABEL_COLORS = {
  dendrites: 0x2d9cdb,
  nissl: 0xbb6bd9,
  cell_body: 0xf2994a,
  nucleus: 0x27ae60,
  schwan: 0x56ccf2,
  axon: 0xeb5757,
  myelin: 0xf2c94c,
  node_ranvier: 0x6fcf97,
  axon_terminal: 0x9b51e0,
  synaptic_knob: 0xff5fd1,
};

const LABEL_DEF_BY_KEY = new Map(LABEL_DEFS.map((def) => [def.key, def]));
const PLACEHOLDER_TEXT = "—";

const canvas = document.querySelector("#c");
const resetBtn = document.querySelector("#resetBtn");
const labelsEl = document.querySelector("#labels");
const lastClickEl = document.querySelector("#lastClick");
const pageTitleEl = document.querySelector("#pageTitle");
const pageHintEl = document.querySelector("#pageHint");
const viewerTitleEl = document.querySelector("#viewerTitle");
const labelsTitleEl = document.querySelector("#labelsTitle");
const lastClickTitleEl = document.querySelector("#lastClickTitle");
const languageButtons = Array.from(document.querySelectorAll(".langBtn"));

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
camera.position.set(1.2, 0.8, 2.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.2, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(2, 3, 1);
scene.add(dir);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const loader = new GLTFLoader();

let currentLanguage = "en";
let gltfRoot = null;
let labels = [];
let loadRequestId = 0;

const selected = new Set();
const labelKeyByRootUuid = new Map();

let highlightOrderCounter = 0;
const meshBaseMaterialByUuid = new Map();
const meshHighlightsByUuid = new Map();
const highlightMaterialsByHex = new Map();

function getLanguageConfig(language = currentLanguage) {
  return LANGUAGE_CONFIG[language] ?? LANGUAGE_CONFIG.en;
}

function getLabelName(labelKey, language = currentLanguage) {
  const def = LABEL_DEF_BY_KEY.get(labelKey);
  if (!def) return labelKey;
  return def.names.en ?? labelKey;
}

function formatLastClick(labelKey, state) {
  return `${getLabelName(labelKey)} (${state})`;
}

function isGlbMarkerName(name) {
  const s = String(name || "");
  return s.startsWith("Text") || s.startsWith("Cylinder");
}

function normalizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function highlightMaterialForColor(colorHex) {
  if (highlightMaterialsByHex.has(colorHex)) return highlightMaterialsByHex.get(colorHex);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.9,
    roughness: 0.25,
    metalness: 0.0,
  });
  highlightMaterialsByHex.set(colorHex, mat);
  return mat;
}

function applyMeshHighlight(mesh) {
  const ownerMap = meshHighlightsByUuid.get(mesh.uuid);
  if (!ownerMap || ownerMap.size === 0) {
    const base = meshBaseMaterialByUuid.get(mesh.uuid);
    if (base) mesh.material = base;
    return;
  }

  let best = null;
  for (const value of ownerMap.values()) {
    if (!best || value.order > best.order) best = value;
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

function clearAllHighlights() {
  if (gltfRoot) {
    gltfRoot.traverse((obj) => {
      if (!obj.isMesh) return;
      const base = meshBaseMaterialByUuid.get(obj.uuid);
      if (base) obj.material = base;
    });
  }
  meshHighlightsByUuid.clear();
  highlightOrderCounter = 0;
}

function resetModelState() {
  selected.clear();
  clearAllHighlights();
  labelKeyByRootUuid.clear();
  meshBaseMaterialByUuid.clear();
  meshHighlightsByUuid.clear();
  highlightOrderCounter = 0;
  labels = [];
}

function removeCurrentModel() {
  if (gltfRoot) {
    clearAllHighlights();
    scene.remove(gltfRoot);
    gltfRoot = null;
  }
  resetModelState();
}

function collectMeshes(root) {
  const out = [];
  root.traverse((obj) => {
    if (obj.isMesh && !isGlbMarkerName(obj.name)) out.push(obj);
  });
  return out;
}

function setHighlighted(root, on, colorHex, ownerKey) {
  const mat = highlightMaterialForColor(colorHex);
  for (const mesh of collectMeshes(root)) {
    if (on) setMeshHighlight(mesh, ownerKey, mat);
    else setMeshHighlight(mesh, ownerKey, null);
  }
}

function rebuildPanel() {
  labelsEl.innerHTML = "";

  for (const label of labels) {
    const row = document.createElement("div");
    row.className = "labelRow";
    row.style.setProperty("--labelColor", `#${label.colorHex.toString(16).padStart(6, "0")}`);
    row.title = label.roots.length
      ? `GLB match: ${label.roots.map((root) => root.name || "(unnamed)").join(", ")}`
      : "GLB match: none";

    const left = document.createElement("div");
    left.className = "labelName";

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.setAttribute("aria-hidden", "true");

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = getLabelName(label.key);
    left.appendChild(name);

    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = selected.has(label.key) ? getLanguageConfig().onState : getLanguageConfig().offState;

    row.classList.toggle("active", selected.has(label.key));
    if (!label.foundMeshesCount) row.classList.add("disabled");
    row.appendChild(dot);
    row.appendChild(left);
    row.appendChild(pill);
    labelsEl.appendChild(row);

    row.addEventListener("click", () => {
      if (!label.foundMeshesCount) {
        lastClickEl.textContent = formatLastClick(label.key, getLanguageConfig().missingState);
        return;
      }
      toggleLabel(label.key);
    });
  }
}

function toggleLabel(labelKey) {
  const label = labels.find((item) => item.key === labelKey);
  if (!label || !label.foundMeshesCount) return;

  if (selected.has(labelKey)) {
    selected.delete(labelKey);
    for (const root of label.roots) setHighlighted(root, false, label.colorHex, labelKey);
    lastClickEl.textContent = formatLastClick(labelKey, getLanguageConfig().offState);
  } else {
    selected.add(labelKey);
    for (const root of label.roots) setHighlighted(root, true, label.colorHex, labelKey);
    lastClickEl.textContent = formatLastClick(labelKey, getLanguageConfig().onState);
  }

  rebuildPanel();
}

function pickLabelKeyFromHit(obj) {
  let cur = obj;
  while (cur) {
    const key = labelKeyByRootUuid.get(cur.uuid);
    if (key) return key;
    cur = cur.parent;
  }
  return null;
}

function onPointerDown(ev) {
  if (!gltfRoot) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObject(gltfRoot, true);
  if (!hits.length) return;

  const labelKey = pickLabelKeyFromHit(hits[0].object);
  if (!labelKey) return;

  lastClickEl.textContent = formatLastClick(labelKey, getLanguageConfig().modelState);
  toggleLabel(labelKey);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function hasNonMarkerMeshDescendant(root) {
  let ok = false;
  root.traverse((obj) => {
    if (ok) return;
    if (obj.isMesh && !isGlbMarkerName(obj.name)) ok = true;
  });
  return ok;
}

function buildLabelsForCurrentModel() {
  labelKeyByRootUuid.clear();

  const aliasesByLabelKey = new Map(
    LABEL_DEFS.map((def) => [
      def.key,
      Array.from(new Set([...(def.aliases || []), def.names.en].map(normalizeName))).filter(Boolean),
    ])
  );

  const rootsByLabelKey = new Map(LABEL_DEFS.map((def) => [def.key, []]));
  gltfRoot.traverse((obj) => {
    if (!obj.name || isGlbMarkerName(obj.name)) return;
    const normalized = normalizeName(obj.name);
    for (const [key, names] of aliasesByLabelKey.entries()) {
      if (names.includes(normalized)) rootsByLabelKey.get(key).push(obj);
    }
  });

  labels = LABEL_DEFS.map((def, index) => ({
    key: def.key,
    colorHex: LABEL_COLORS[def.key] ?? COLORS[index % COLORS.length],
    roots: (rootsByLabelKey.get(def.key) || []).filter((root) => hasNonMarkerMeshDescendant(root)),
    foundMeshesCount: 0,
  }));

  for (const label of labels) {
    let meshes = 0;
    for (const root of label.roots) meshes += collectMeshes(root).length;
    label.foundMeshesCount = meshes;

    for (const root of label.roots) {
      root.traverse((obj) => {
        if (isGlbMarkerName(obj.name)) return;
        if (!labelKeyByRootUuid.has(obj.uuid)) labelKeyByRootUuid.set(obj.uuid, label.key);
      });
    }
  }
}

function frameModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  controls.target.copy(center);
  controls.update();

  camera.position.copy(center).add(new THREE.Vector3(0, maxDim * 0.25, maxDim * 1.5));
  camera.near = Math.max(0.01, maxDim / 100);
  camera.far = maxDim * 50;
  camera.updateProjectionMatrix();
}

function applyLanguageUI() {
  const config = getLanguageConfig();

  document.documentElement.lang = config.htmlLang;
  document.title = config.title;
  pageTitleEl.textContent = config.title;
  pageHintEl.textContent = config.hint;
  viewerTitleEl.textContent = config.viewerTitle;
  labelsTitleEl.textContent = config.labelsTitle;
  lastClickTitleEl.textContent = config.lastClickTitle;
  resetBtn.textContent = config.resetButton;

  for (const button of languageButtons) {
    const language = button.dataset.language;
    button.textContent = LANGUAGE_CONFIG[language]?.buttonLabel ?? language;
    button.classList.toggle("active", language === currentLanguage);
  }

  rebuildPanel();
}

function setControlsDisabled(disabled) {
  resetBtn.disabled = disabled;
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

      gltfRoot.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.frustumCulled = true;
        if (isGlbMarkerName(obj.name)) obj.raycast = () => {};
      });

      scene.add(gltfRoot);
      buildLabelsForCurrentModel();
      frameModel(gltfRoot);
      rebuildPanel();
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

window.addEventListener("resize", resize);
canvas.addEventListener("pointerdown", onPointerDown);
resetBtn.addEventListener("click", () => {
  selected.clear();
  clearAllHighlights();
  lastClickEl.textContent = getLanguageConfig().resetState;
  rebuildPanel();
});

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    const language = button.dataset.language;
    switchLanguage(language);
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
