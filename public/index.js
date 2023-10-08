import * as THREE from "/node_modules/three/build/three.module.js";
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js";

// Global declaration
let scene;
let camera;
let renderer;
const fov = 60;
const near = 0.1;
const far = 1000;
scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const canvas = document.getElementsByTagName("canvas")[0];

// Camera
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 50);
scene.add(camera);

// Default Renderer
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.setClearColor(0x000000, 0.0);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.minPolarAngle = 0.1;
controls.maxPolarAngle = Math.PI / 2 - 0.1;

// Bloom renderer
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.strength = 1.0;
bloomPass.radius = 0.5;
bloomPass.threshold = 0.8;
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(bloomPass);
bloomComposer.addPass(renderScene);

// Sun object
const sunGeometry = new THREE.IcosahedronGeometry(8, 20);

const sunMaterial = new THREE.MeshPhongMaterial({
  roughness: 1,
  metalness: 0,
  map: THREE.ImageUtils.loadTexture("texture/sunmap.jpg"),
  bumpMap: THREE.ImageUtils.loadTexture("texture/sunbump.jpeg"),
});

const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(-50, 0, 5);
sunMesh.layers.set(0);

scene.add(sunMesh);

// Galaxy
const starGeometry = new THREE.SphereGeometry(150, 64, 64);

const starMaterial = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture("texture/new-galaxy.jpg"),
  side: THREE.BackSide,
  transparent: true,
});

const starMesh = new THREE.Mesh(starGeometry, starMaterial);
starMesh.layers.set(0);

scene.add(starMesh);

// Earth
const earthGeometry = new THREE.SphereGeometry(4, 32, 32);

const earthMaterial = new THREE.MeshPhongMaterial({
  roughness: 1,
  metalness: 0,
  map: THREE.ImageUtils.loadTexture("texture/earthmap.jpg"),
  bumpMap: THREE.ImageUtils.loadTexture("texture/earthbump.jpg"),
  bumpScale: 0.3,
});

const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.receiveShadow = true;
earthMesh.castShadow = true;
earthMesh.layers.set(0);
earthMesh.position.set(40, 0, 5);
scene.add(earthMesh);

// Moon
const moonGeometry = new THREE.SphereGeometry(2, 32, 32);

const moonMaterial = new THREE.MeshPhongMaterial({
  roughness: 5,
  metalness: 0,
  map: THREE.ImageUtils.loadTexture("texture/moonmap.jpg"),
  bumpMap: THREE.ImageUtils.loadTexture("texture/moonbump.jpg"),
  bumpScale: 0.02,
});

const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.receiveShadow = true;
moonMesh.castShadow = true;
moonMesh.position.x = 10;
// moonMesh.position.y = 0;
moonMesh.layers.set(0);

scene.add(moonMesh);

//Pivot
var moonPivot = new THREE.Object3D();
earthMesh.add(moonPivot);
moonPivot.add(moonMesh);

var cameraPivot = new THREE.Object3D();
earthMesh.add(cameraPivot);
cameraPivot.add(camera);

var earthPivot = new THREE.Object3D();
sunMesh.add(earthPivot);
earthPivot.add(earthMesh);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Point Light
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.castShadow = true;
pointLight.decay = 1;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.shadow.camera.near = 1;
pointLight.shadow.camera.far = 1000;
pointLight.shadowBias = 0.00001;
pointLight.shadowDarkness = 1;
pointLight.position.set(-50, 0, 5);
scene.add(pointLight);

const moonOrbit = {
  radius: 10,
  speed: 0.005,
  angle: 0,
  destinationAngle: Math.PI,
  isAnimating: false,
};

const updateMoonPosition = () => {
  moonOrbit.angle += moonOrbit.speed;
  const x = moonOrbit.radius * Math.cos(moonOrbit.angle);
  const y = moonOrbit.radius * Math.sin(moonOrbit.angle);
  moonMesh.position.set(x, y, 0);
};

const animateMoonToDestination = () => {
  moonOrbit.angle += moonOrbit.speed;
  if (moonOrbit.angle < moonOrbit.destinationAngle) {
    updateMoonPosition();
    requestAnimationFrame(animateMoonToDestination);
  } else {
    moonOrbit.isAnimating = false;
  }
};

const animateSolarEclipse = () => {
  if (!moonOrbit.isAnimating) {
    moonOrbit.angle = 0;
    moonOrbit.destinationAngle = Math.PI;
    moonOrbit.isAnimating = true;
    animateMoonToDestination();
    $('#lunarEclipseAlert').fadeOut();
    $('#solarEclipseAlert').fadeIn('slow');
  }
};

document
  .getElementById("solarEclipseBtn")
  .addEventListener("click", animateSolarEclipse);

const animateLunarEclipse = () => {
  if (!moonOrbit.isAnimating) {
    moonOrbit.destinationAngle = Math.PI * 2;
    moonOrbit.isAnimating = true;
    animateMoonToDestination();
    $('#solarEclipseAlert').fadeOut();
    $('#lunarEclipseAlert').fadeIn('slow');
  }
};

document
  .getElementById("lunarEclipseBtn")
  .addEventListener("click", animateLunarEclipse);

//resize listner
window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

const animate = () => {
  requestAnimationFrame(animate);

  // moonPivot.rotation.y -= 0.005;
  // moonPivot.rotation.x = 0.5;

  // sunMesh.rotation.y -= 0.002;
  // sunMesh.rotation.x = 0.2;

  controls.target.copy(sunMesh.position);
  controls.update();

  bloomComposer.render();

  camera.layers.set(1);
  renderer.clearDepth();

  camera.layers.set(0);
  renderer.render(scene, camera);

  camera.layers.set(1);
  renderer.clearDepth();
  renderer.render(scene, camera);
};

animate();

var closeIcons=document.getElementsByClassName('closeAlert');  

function CloseAlerts()
{
  $('#solarEclipseAlert').fadeOut();
  $('#lunarEclipseAlert').fadeOut();
};

for (var i = 0; i < closeIcons.length; i++) {
  closeIcons[i].addEventListener("click", CloseAlerts);
}