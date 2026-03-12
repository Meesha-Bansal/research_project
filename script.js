import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';

// import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
// import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// Assets served from Vite/public at site root.
// Add these files under `public/`:
// - english.glb / english.mkv
// - hindi.glb / hindi.mkv
// - punjabi.glb / punjabi.mkv
const ASSETS = {
  en: { modelUrl: '/english.glb', videoUrl: '/english.mkv', htmlLang: 'en' },
  hi: { modelUrl: '/hindi.glb', videoUrl: '/hindi.mkv', htmlLang: 'hi' },
  pa: { modelUrl: '/punjabi.glb', videoUrl: '/punjabi.mkv', htmlLang: 'pa' },
};

const LANG_STORAGE_KEY = 'bloodflow_lang';

let scene, camera, renderer, controls;
let mixer;
let actions = [];
let currentActionIndex = 0;
let currentAction = null;
let clock = new THREE.Clock();
let frontLight = null;
let gltfLoader = null;
let currentModelRoot = null;
let currentLang = 'en'; 

init();
animate();

function setOverlay(text) {
  const el = document.getElementById('overlayText');
  if (el) el.textContent = text;
}

function showOverlay(text) {
  if (typeof text === 'string') setOverlay(text);
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.style.display = 'grid';
}

function hideOverlay() {
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.style.display = 'none';
}

function showVideoOverlay() {
  const overlay = document.getElementById('videoOverlay');
  const video = document.getElementById('heartVideo');
  if (overlay) {
    overlay.style.display = 'flex';
  }
  if (video) {
    try {
      video.currentTime = 0;
      video.play();
    } catch (_) {
      // ignore autoplay errors; user can press play
    }
  }
}

function hideVideoOverlay() {
  const overlay = document.getElementById('videoOverlay');
  const video = document.getElementById('heartVideo');
  if (overlay) {
    overlay.style.display = 'none';
  }
  if (video) {
    video.pause();
  }
}

function getInitialLanguage() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang && ASSETS[urlLang]) return urlLang;

  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && ASSETS[saved]) return saved;
  } catch (_) {
    // ignore storage errors
  }

  return 'en';
}

function setUrlLanguage(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url);
}

function updateLanguageButtons(lang) {
  const buttons = document.querySelectorAll('#languageSwitcher .lang-btn');
  buttons.forEach((btn) => {
    const isActive = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('lang-btn-active', isActive);
  });
}

function setVideoSource(videoUrl) {
  const video = document.getElementById('heartVideo');
  if (!video) return;
  if (video.getAttribute('src') === videoUrl) return;

  // If overlay is open, close it to avoid playing the old language audio/video.
  hideVideoOverlay();
  video.pause();
  video.setAttribute('src', videoUrl);
  video.load();

  // Reset speed UI to 1x for new language.
  video.playbackRate = 1;
  const speedButtons = document.querySelectorAll('.videoSpeedBtn');
  speedButtons.forEach((b) => b.classList.remove('videoSpeedBtn-active'));
  const normalSpeedBtn = document.querySelector('.videoSpeedBtn[data-rate="1"]');
  if (normalSpeedBtn) normalSpeedBtn.classList.add('videoSpeedBtn-active');
}

function disposeMaterial(material) {
  if (!material) return;
  // Dispose any textures attached to known material props.
  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && value.isTexture) value.dispose();
  }
  if (typeof material.dispose === 'function') material.dispose();
}

function disposeObject3D(root) {
  if (!root) return;
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    if (obj.geometry) obj.geometry.dispose();

    const { material } = obj;
    if (Array.isArray(material)) material.forEach(disposeMaterial);
    else disposeMaterial(material);
  });
}

function clearCurrentModel() {
  if (mixer) {
    try {
      mixer.stopAllAction();
      if (currentModelRoot) mixer.uncacheRoot(currentModelRoot);
    } catch (_) {
      // ignore disposal errors
    }
  }

  mixer = null;
  actions = [];
  currentActionIndex = 0;
  currentAction = null;

  if (currentModelRoot) {
    scene.remove(currentModelRoot);
    disposeObject3D(currentModelRoot);
    currentModelRoot = null;
  }
}

function loadModel(modelUrl) {
  if (!gltfLoader) return;

  showOverlay('Loading 3D model...');
  clearCurrentModel();

  gltfLoader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;
      currentModelRoot = model;
      scene.add(model);

      // Center and frame the model
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      controls.target.copy(center);
      controls.update();

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const fitDistance = (maxDim / 2) / Math.tan(fov / 2);
      camera.position.copy(center).add(
        new THREE.Vector3(0, maxDim * 0.1, fitDistance * 1.4)
      );
      camera.near = Math.max(0.01, fitDistance / 100);
      camera.far = fitDistance * 100;
      camera.updateProjectionMatrix();

      // Animation sequencing: always loop through all clips in order.
      mixer = new THREE.AnimationMixer(model);

      const clips = [...gltf.animations].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      );

      clips.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
        actions.push(action);
      });

      if (actions.length > 0) {
        mixer.addEventListener('finished', () => {
          currentActionIndex = (currentActionIndex + 1) % actions.length;
          playAnimation(currentActionIndex);
        });

        playAnimation(0);
      } else {
        console.warn('No animations exported from GLB.');
        setOverlay('Model loaded, but no animations were found.');
      }

      hideOverlay();
    },
    (xhr) => {
      if (xhr.total) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        setOverlay(`Loading heart model... ${pct}%`);
      } else {
        setOverlay('Loading heart model...');
      }
    },
    (error) => {
      console.error('GLB loading error:', error);
      showOverlay(`Failed to load model: ${modelUrl}`);
    }
  );
}

function setLanguage(lang, { persist = true, updateUrl = true } = {}) {
  if (!ASSETS[lang]) return;

  currentLang = lang;
  updateLanguageButtons(lang);

  const assets = ASSETS[lang];
  document.documentElement.setAttribute('lang', assets.htmlLang || 'en');

  if (persist) {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (_) {
      // ignore storage errors
    }
  }

  if (updateUrl) setUrlLanguage(lang);

  setVideoSource(assets.videoUrl);
  loadModel(assets.modelUrl);
}

function initLanguageSwitcher() {
  const switcher = document.getElementById('languageSwitcher');
  if (!switcher) return;

  switcher.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const btn = target.closest('.lang-btn');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang') || 'en';
    setLanguage(lang);
  });
}

function init() {
  scene = new THREE.Scene();
  // White background for the whole viewport
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
  if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lighting: soft ambient + rim + camera key light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x202030, 0.5);
  scene.add(hemiLight);

  const rimLight = new THREE.DirectionalLight(0xff8888, 1.2);
  rimLight.position.set(-4, 4, -4);
  scene.add(rimLight);

  const cameraKeyLight = new THREE.PointLight(0xffffff, 1.5, 0, 2);
  cameraKeyLight.position.set(0.8, 0.8, 1.2);
  camera.add(cameraKeyLight);
  scene.add(camera);

  // Strong front light aimed at the heart (updates each frame).
  frontLight = new THREE.DirectionalLight(0xffffff, 1.6);
  frontLight.position.copy(camera.position);
  scene.add(frontLight);
  scene.add(frontLight.target);

  gltfLoader = new GLTFLoader();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);

  window.addEventListener('resize', onWindowResize);

  initLanguageSwitcher();
  currentLang = getInitialLanguage();
  setLanguage(currentLang, { persist: false, updateUrl: true });

  // Video UI: open/close and speed controls
  const closeBtn = document.getElementById('videoCloseButton');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideVideoOverlay);
  }

  const openBtn = document.getElementById('videoOpenButton');
  if (openBtn) {
    openBtn.addEventListener('click', showVideoOverlay);
  }

  // Custom playback controls
  const playPauseBtn = document.getElementById('videoPlayPauseBtn');
  const rewindBtn = document.getElementById('videoRewindBtn');
  const forwardBtn = document.getElementById('videoForwardBtn');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      const video = document.getElementById('heartVideo');
      if (!video) return;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  }

  if (rewindBtn) {
    rewindBtn.addEventListener('click', () => {
      const video = document.getElementById('heartVideo');
      if (!video) return;
      video.currentTime = Math.max(0, video.currentTime - 10);
    });
  }

  if (forwardBtn) {
    forwardBtn.addEventListener('click', () => {
      const video = document.getElementById('heartVideo');
      if (!video) return;
      video.currentTime = Math.min(video.duration || video.currentTime + 10, video.currentTime + 10);
    });
  }

  const speedButtons = document.querySelectorAll('.videoSpeedBtn');
  speedButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const rate = parseFloat(btn.getAttribute('data-rate') || '1');
      const video = document.getElementById('heartVideo');
      if (video && !Number.isNaN(rate)) {
        video.playbackRate = rate;
      }

      // Visually highlight the active speed button
      speedButtons.forEach((b) => b.classList.remove('videoSpeedBtn-active'));
      btn.classList.add('videoSpeedBtn-active');
    });
  });
}

function playAnimation(index) {
  if (!actions[index]) return;

  if (currentAction) {
    currentAction.stop();
  }

  currentAction = actions[index];
  currentAction.reset();
  currentAction.play();

  currentActionIndex = index;
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  // Keep the front light shining from the camera toward the heart.
  if (frontLight && controls) {
    frontLight.position.copy(camera.position);
    frontLight.target.position.copy(controls.target);
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
