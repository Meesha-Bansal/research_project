import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Vite serves files from `public/` at the site root.
// Pick the correct GLB here (these exist in `public/`).
const MODEL_URL = '/labelledheart.glb';
let scene, camera, renderer, controls;
let mixer;
let actions = [];
let currentActionIndex = 0;
let currentAction = null;
let clock = new THREE.Clock();

// Blood-flow spheres along curves (found in the GLB by name).
let blueCurve = null;
let redCurve = null;
let blueSphere = null;
let redSphere = null;
let flowStartTime = 0;
let flowPhase = 'blue'; // 'blue' -> 'red' -> loops
const FLOW_BLUE_SECONDS = 6;
const FLOW_RED_SECONDS = 6;
const FLOW_SPHERE_RADIUS = 0.05;

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

function findNamedObject(root, includesLower) {
    let found = null;
    root.traverse((obj) => {
        if (found) return;
        const name = (obj.name || '').toLowerCase();
        if (name.includes(includesLower)) found = obj;
    });
    return found;
}

function buildCurveFromObject(obj) {
    // Works best if the curve is exported as a Line/Curve with ordered vertices.
    if (!obj || !obj.geometry) return null;
    const posAttr = obj.geometry.getAttribute?.('position');
    if (!posAttr || posAttr.count < 2) return null;

    const worldMatrix = obj.matrixWorld;
    const pts = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(worldMatrix);
        pts.push(v.clone());
    }

    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
}

function makeFlowSphere(colorHex) {
    const geom = new THREE.SphereGeometry(FLOW_SPHERE_RADIUS, 24, 18);
    const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.25,
        roughness: 0.25,
        metalness: 0.0,
    });
    return new THREE.Mesh(geom, mat);
}

function init() {

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 6);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    // Support both newer and older Three.js builds.
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
        renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Camera-attached key light so the heart stays lit as you orbit.
    const cameraKeyLight = new THREE.PointLight(0xffffff, 2.0, 0, 2);
    cameraKeyLight.position.set(0.8, 0.8, 1.2);
    camera.add(cameraKeyLight);
    scene.add(camera);

    // Load GLB
    const loader = new GLTFLoader();

    loader.load(
        MODEL_URL,

        (gltf) => {

            const model = gltf.scene;
            scene.add(model);

            console.log("Animations detected:", gltf.animations);

            mixer = new THREE.AnimationMixer(model);

            // Sort clips by name for predictable "sequence" playback.
            // (Blender often exports Action, Action.001, Action.002...)
            const clips = [...gltf.animations].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
            );

            clips.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.clampWhenFinished = true;
                action.loop = THREE.LoopOnce;

                actions.push(action);
            });

            // Frame the model and set controls target to its center.
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            controls.target.copy(center);
            controls.update();

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = THREE.MathUtils.degToRad(camera.fov);
            const fitDistance = (maxDim / 2) / Math.tan(fov / 2);
            camera.position.copy(center).add(new THREE.Vector3(0, maxDim * 0.15, fitDistance * 1.6));
            camera.near = Math.max(0.01, fitDistance / 100);
            camera.far = fitDistance * 100;
            camera.updateProjectionMatrix();

            // Advance to the next clip whenever the current one finishes.
            mixer.addEventListener('finished', () => {
                if (actions.length === 0) return;
                currentActionIndex = (currentActionIndex + 1) % actions.length;
                playAnimation(currentActionIndex);
            });

            // Blood-flow: find curve objects by name (customize names in Blender if needed).
            // Expected naming examples: "blue_curve", "BluePath", "red_curve", "RedPath"
            const blueObj = findNamedObject(model, 'blue');
            const redObj = findNamedObject(model, 'red');

            blueCurve = buildCurveFromObject(blueObj);
            redCurve = buildCurveFromObject(redObj);

            if (blueCurve && redCurve) {
                blueSphere = makeFlowSphere(0x1e6bff);
                redSphere = makeFlowSphere(0xff2a2a);
                scene.add(blueSphere);
                scene.add(redSphere);
                redSphere.visible = false;

                flowStartTime = clock.getElapsedTime();
                flowPhase = 'blue';
            } else {
                const names = [];
                model.traverse((o) => {
                    if (o.name) names.push(o.name);
                });
                console.warn('Could not build curves from GLB objects.', { blueObj, redObj, names });
                setOverlay(
                    'Model loaded, but blood-flow paths were not found.\n' +
                    'In Blender: name your curve objects to include "blue" and "red", and export them as a Line/Curve with vertices.\n' +
                    `Found object names: ${names.slice(0, 40).join(', ')}${names.length > 40 ? '…' : ''}`
                );
            }

            if (actions.length > 0) {
                playAnimation(0);
            } else {
                console.warn("No animations exported from Blender.");
            }

            hideOverlay();
        },

        (xhr) => {
            if (xhr.total) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                setOverlay(`Loading 3D model… ${pct}%`);
            } else {
                setOverlay('Loading 3D model…');
            }
        },

        (error) => {
            console.error("GLB loading error:", error);
            setOverlay(`Failed to load model: ${MODEL_URL}`);
        }
    );

    window.addEventListener("resize", onWindowResize);
}

function playAnimation(index){

    if (!actions[index]) return;

    if (currentAction) {
        currentAction.stop();
    }

    currentAction = actions[index];
    currentAction.reset();
    currentAction.play();

    currentActionIndex = index;
}

function animate(){

    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const t = clock.getElapsedTime();

    if (mixer){
        mixer.update(delta);
    }

    // Blood-flow spheres: blue path then red path, looping.
    if (blueCurve && redCurve && blueSphere && redSphere) {
        if (flowPhase === 'blue') {
            const u = THREE.MathUtils.clamp((t - flowStartTime) / FLOW_BLUE_SECONDS, 0, 1);
            blueSphere.position.copy(blueCurve.getPointAt(u));
            blueSphere.visible = true;
            redSphere.visible = false;
            if (u >= 1) {
                flowPhase = 'red';
                flowStartTime = t;
            }
        } else {
            const u = THREE.MathUtils.clamp((t - flowStartTime) / FLOW_RED_SECONDS, 0, 1);
            redSphere.position.copy(redCurve.getPointAt(u));
            redSphere.visible = true;
            blueSphere.visible = false;
            if (u >= 1) {
                flowPhase = 'blue';
                flowStartTime = t;
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}