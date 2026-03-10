import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// GLB path (served from Vite/public at site root)
const MODEL_URL = '/bloodflow5.glb';

let scene, camera, renderer, controls;
let mixer;
let actions = [];
let currentActionIndex = 0;
let currentAction = null;
let clock = new THREE.Clock();
let frontLight = null;

init();
animate();

function setOverlay(text) {
  const el = document.getElementById('overlayText');
  if (el) el.textContent = text;
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

  const loader = new GLTFLoader();

  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
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
        setOverlay(`Loading heart model… ${pct}%`);
      } else {
        setOverlay('Loading heart model…');
      }
    },
    (error) => {
      console.error('GLB loading error:', error);
      setOverlay(`Failed to load model: ${MODEL_URL}`);
    }
  );

  window.addEventListener('resize', onWindowResize);

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