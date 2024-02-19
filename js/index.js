/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import {GUI} from 'https://cdn.jsdelivr.net/npm/lil-gui@0.16.1/dist/lil-gui.esm.min.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { STLExporter } from './STLExporter.js';

let depthData;
let camera, scene, renderer;
let depthMaterial;
let mesh;
let backgroundMesh;
let INVALID_DEPTH_THRES = 0.1;
let INVALID_DEPTH = 10000;
let RENDERER_WIDTH = 192, RENDERER_HEIGHT = 256;

const geometry = new THREE.BufferGeometry();

let IMAGE_WIDTH = 192, IMAGE_HEIGHT = 256;
const vertices = [];

setTimeout(function () {
  init();
  animate();
}, 1000);

function getDepth(depthData, vid) {
  // vid: vertex id.
  const depth0 = depthData[vid * 4 + 0];
  const depth1 = depthData[vid * 4 + 1];
  const depth2 = depthData[vid * 4 + 2];

  const lastDepth0 = depthData[vid * 4 - 4];
  const lastDepth1 = depthData[vid * 4 - 3];
  const lastDepth2 = depthData[vid * 4 - 2];

  const nextDepth0 = depthData[vid * 4 + 4];
  const nextDepth1 = depthData[vid * 4 + 5];
  const nextDepth2 = depthData[vid * 4 + 6];

  const aboveDepth0 = depthData[(vid - IMAGE_WIDTH) * 4 + 0];
  const aboveDepth1 = depthData[(vid - IMAGE_WIDTH) * 4 + 1];
  const aboveDepth2 = depthData[(vid - IMAGE_WIDTH) * 4 + 2];

  const belowDepth0 = depthData[(vid + IMAGE_WIDTH) * 4 + 0];
  const belowDepth1 = depthData[(vid + IMAGE_WIDTH) * 4 + 1];
  const belowDepth2 = depthData[(vid + IMAGE_WIDTH) * 4 + 2];

  const leftAboveDiagonalDepth0 = depthData[(vid - IMAGE_WIDTH) * 4 - 4];
  const leftAboveDiagonalDepth1 = depthData[(vid - IMAGE_WIDTH) * 4 - 3];
  const leftAboveDiagonalDepth2 = depthData[(vid - IMAGE_WIDTH) * 4 - 2];

  const rightAboveDiagonalDepth0 = depthData[(vid - IMAGE_WIDTH) * 4 + 4];
  const rightAboveDiagonalDepth1 = depthData[(vid - IMAGE_WIDTH) * 4 + 5];
  const rightAboveDiagonalDepth2 = depthData[(vid - IMAGE_WIDTH) * 4 + 6];

  const leftBelowDiagonalDepth0 = depthData[(vid + IMAGE_WIDTH) * 4 - 4];
  const leftBelowDiagonalDepth1 = depthData[(vid + IMAGE_WIDTH) * 4 - 3];
  const leftBelowDiagonalDepth2 = depthData[(vid + IMAGE_WIDTH) * 4 - 2];

  const rightBelowDiagonalDepth0 = depthData[(vid + IMAGE_WIDTH) * 4 + 4];
  const rightBelowDiagonalDepth1 = depthData[(vid + IMAGE_WIDTH) * 4 + 5];
  const rightBelowDiagonalDepth2 = depthData[(vid + IMAGE_WIDTH) * 4 + 6];
  

  let depth = depth0 * 255 * 255 + depth1 * 255 + depth2;
  depth = depth / 255 / 255 / 255;

  //tiefe des letzten Pixels
  let lastDepth = lastDepth0 * 255 * 255 + lastDepth1 * 255 + lastDepth2;
  lastDepth = lastDepth / 255 / 255 / 255;

  //tiefe des nächsten Pixels
  let nextDepth = nextDepth0 * 255 * 255 + nextDepth1 * 255 + nextDepth2;
  nextDepth = nextDepth / 255 / 255 / 255;

  //tiefe des oberen Pixels
  let aboveDepth = aboveDepth0 * 255 * 255 + aboveDepth1 * 255 + aboveDepth2;
  aboveDepth = aboveDepth / 255 / 255 / 255;

  //tiefe des unteren Pixels
  let belowDepth = belowDepth0 * 255 * 255 + belowDepth1 * 255 + belowDepth2;
  belowDepth = belowDepth / 255 / 255 / 255;

  let leftAboveDiagonalDepth = leftAboveDiagonalDepth0 * 255 * 255 + leftAboveDiagonalDepth1 * 255 + leftAboveDiagonalDepth2;
  leftAboveDiagonalDepth = leftAboveDiagonalDepth / 255 / 255 / 255;

  let rightAboveDiagonalDepth = rightAboveDiagonalDepth0 * 255 * 255 + rightAboveDiagonalDepth1 * 255 + rightAboveDiagonalDepth2;
  rightAboveDiagonalDepth = rightAboveDiagonalDepth / 255 / 255 / 255;

  let leftBelowDiagonalDepth = leftBelowDiagonalDepth0 * 255 * 255 + leftBelowDiagonalDepth1 * 255 + leftBelowDiagonalDepth2;
  leftBelowDiagonalDepth = leftBelowDiagonalDepth / 255 / 255 / 255;

  let rightBelowDiagonalDepth = rightBelowDiagonalDepth0 * 255 * 255 + rightBelowDiagonalDepth1 * 255 + rightBelowDiagonalDepth2;
  rightBelowDiagonalDepth = rightBelowDiagonalDepth / 255 / 255 / 255;

  if (isNaN(depth)) {
    depth = 0;
  }
  if (isNaN(nextDepth)) {
    nextDepth = 0;
  }
  if (isNaN(lastDepth)) {
    lastDepth = 0;
  }
  if (isNaN(aboveDepth)) {
    aboveDepth = 0;
  }
  if (isNaN(belowDepth)) {
    belowDepth = 0;
  }
  if (isNaN(leftAboveDiagonalDepth)) {
    leftAboveDiagonalDepth = 0;
  }
  if (isNaN(rightAboveDiagonalDepth)) {
    rightAboveDiagonalDepth = 0;
  }
  if (isNaN(leftBelowDiagonalDepth)) {
    leftBelowDiagonalDepth = 0;
  }
  if (isNaN(rightBelowDiagonalDepth)) {
    rightBelowDiagonalDepth = 0;
  }


  
  if (depth <= INVALID_DEPTH_THRES) depth = INVALID_DEPTH;
  if (lastDepth <= INVALID_DEPTH_THRES) lastDepth = INVALID_DEPTH;
  if (nextDepth <= INVALID_DEPTH_THRES) nextDepth = INVALID_DEPTH;
  if (aboveDepth <= INVALID_DEPTH_THRES) aboveDepth = INVALID_DEPTH;
  if (belowDepth <= INVALID_DEPTH_THRES) belowDepth = INVALID_DEPTH;
  if (leftAboveDiagonalDepth <= INVALID_DEPTH_THRES) leftAboveDiagonalDepth = INVALID_DEPTH;
  if (rightAboveDiagonalDepth <= INVALID_DEPTH_THRES) rightAboveDiagonalDepth = INVALID_DEPTH;
  if (leftBelowDiagonalDepth <= INVALID_DEPTH_THRES) leftBelowDiagonalDepth = INVALID_DEPTH;
  if (rightBelowDiagonalDepth <= INVALID_DEPTH_THRES) rightBelowDiagonalDepth = INVALID_DEPTH;


  if(((lastDepth == INVALID_DEPTH) || (nextDepth == INVALID_DEPTH) || (aboveDepth == INVALID_DEPTH) || (belowDepth == INVALID_DEPTH) || (leftAboveDiagonalDepth == INVALID_DEPTH) || (rightAboveDiagonalDepth == INVALID_DEPTH) || (leftBelowDiagonalDepth == INVALID_DEPTH) || (rightBelowDiagonalDepth == INVALID_DEPTH)) && (depth != INVALID_DEPTH)){
    depth = config.borderDepth;
  }

  if(depth > config.borderDepth){
    depth = config.borderDepth;
  }

  return depth;
}

function getIndices(depthData) {
  let indices = [];
  for (let i = 0; i < IMAGE_HEIGHT; i++) {
    for (let j = 0; j < IMAGE_WIDTH; j++) {
      const a = i * (IMAGE_WIDTH + 1) + (j + 1);
      const b = i * (IMAGE_WIDTH + 1) + j;
      const c = (i + 1) * (IMAGE_WIDTH + 1) + j;
      const d = (i + 1) * (IMAGE_WIDTH + 1) + (j + 1);

      let aDepth = getDepth(depthData, i * IMAGE_WIDTH + j + 1);
      let bDepth = getDepth(depthData, i * IMAGE_WIDTH + j);
      let cDepth = getDepth(depthData, (i + 1) * IMAGE_WIDTH + j);
      let dDepth = getDepth(depthData, (i + 1) * IMAGE_WIDTH + j + 1);
      // generate two faces (triangles) per iteration

      if (aDepth != INVALID_DEPTH && bDepth != INVALID_DEPTH &&
        dDepth != INVALID_DEPTH) {
        indices.push(a, b, d);  // face one
      }

      if (bDepth != INVALID_DEPTH && cDepth != INVALID_DEPTH &&
        dDepth != INVALID_DEPTH) {
        indices.push(b, c, d);  // face two
      }
    }
  }

  return indices;
}

updateDepthCallback = () => {
  depthData = document.getElementById('result')
    .getContext('2d')
    .getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)
    .data;

  for (let i = 0; i <= IMAGE_HEIGHT; ++i) {
    //const y = i - IMAGE_HEIGHT * 0.5;
    for (let j = 0; j <= IMAGE_WIDTH; ++j) {
      //const x = j - IMAGE_WIDTH * 0.5;
      const vid = i * IMAGE_WIDTH + j;
      let depth = getDepth(depthData, vid);
      // check ob Bild seitlich abgeschnitten wird 
      if(j == 0 || j == (IMAGE_WIDTH - 1) && depth != INVALID_DEPTH ){
        // tiefe wird angepasst 
        depth = config.borderDepth;
      }
      const vid2 = i * (IMAGE_WIDTH + 1) + j;
      vertices[vid2 * 3 + 2] = depth * config.depthScale;
    }
  }

  const indices = getIndices(depthData);
  /* console.log(depthData);
  console.log(vertices);
  console.log(indices); */
  geometry.setIndex(indices);
  
  geometry.setAttribute(
    'position', new THREE.Float32BufferAttribute(vertices, 3));
  
  depthMaterial.uniforms.iChannel0.value.needsUpdate = true;
  depthMaterial.uniforms.iChannel1.value.needsUpdate = true;
  geometry.attributes.position.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
};

function init() {
  const FOV = 27;
  camera = new THREE.PerspectiveCamera(
    FOV, RENDERER_WIDTH / RENDERER_HEIGHT, 0.001, 3500);
  camera.position.z = 7;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(config.backgroundColor);

  const normals = [];
  const uvs = [];

  let depth_texture = new THREE.CanvasTexture(document.getElementById('result'));
  let image_texture = new THREE.CanvasTexture(document.getElementById('im1'));

  depthData = document.getElementById('result')
    .getContext('2d')
    .getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)
    .data;

  for (let i = 0; i <= IMAGE_HEIGHT; ++i) {
    const y = i - IMAGE_HEIGHT * 0.5;
    for (let j = 0; j <= IMAGE_WIDTH; ++j) {
      const x = j - IMAGE_WIDTH * 0.5;

      const vid = i * IMAGE_WIDTH + j;
      let depth = getDepth(depthData, vid);

      vertices.push(
          x * config.imageScale, -y * config.imageScale,
          depth * config.depthScale);
      normals.push(0, 0, 1);

      uvs.push(j / IMAGE_WIDTH, 1.0 - i / IMAGE_HEIGHT);
    }
  }

  const indices = getIndices(depthData);
  geometry.setIndex(indices);
  geometry.setAttribute(
    'position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  camera.aspect = RENDERER_WIDTH / RENDERER_HEIGHT;
  camera.updateProjectionMatrix();

  let uniforms = {
    iChannel0: { type: 't', value: depth_texture },
    iChannel1: { type: 't', value: image_texture },
    iResolution:
      { type: 'v3', value: new THREE.Vector3(IMAGE_WIDTH, IMAGE_HEIGHT, 0) },
    iChannelResolution0:
      { type: 'v3', value: new THREE.Vector3(512.0 * 2, 512.0 * 2, 0.0) },
    iMouse: { type: 'v4', value: new THREE.Vector4() },
    uTextureProjectionMatrix: { type: 'm4', value: camera.projectionMatrix }
  };

  depthMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    overdraw: true,
    vertexShader: VERTEX_SHADER_3D_PHOTO,
    fragmentShader: FRAGMENT_SHADER_3D_PHOTO,
    transparent: false,
    wireframe: false,
    wireframeLinewidth: 2,
    glslVersion: THREE.GLSL3,
  });
  
  const PLANE_SIZE = 0.025;
  let planeGeometry = new THREE.PlaneGeometry(IMAGE_WIDTH * PLANE_SIZE, IMAGE_HEIGHT * PLANE_SIZE, 10, 10);
    
  mesh = new THREE.Mesh(geometry, depthMaterial);
  backgroundMesh = new THREE.Mesh(planeGeometry, depthMaterial);
  scene.add(mesh);
  scene.add(backgroundMesh);

  renderer =
    // Ensure buffer is preserved for CCapture.js.
    new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(RENDERER_WIDTH, RENDERER_HEIGHT);
  
  const gui = new GUI();

  let vis = gui.addFolder('Visualization');
  vis.add(depthMaterial, 'wireframe');
  const minDepthController = vis.add(config, 'minDepth', 0, 1);
  minDepthController.onChange(predict);
  const maxDepthController = vis.add(config, 'maxDepth', 0, 1);
  maxDepthController.onChange(predict);
  vis.closed = false;

  gui.close();
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  scene.background = new THREE.Color(config.backgroundColor);
  backgroundMesh.position.set(0, 0, config.backgroundDepth);
  backgroundMesh.scale.set(
    config.backgroundScale, config.backgroundScale, config.backgroundScale);
  backgroundMesh.visible = config.showBackgroundPic;

  renderer.render(scene, camera);
}

function saveString(text, filename) {
  save(new Blob([text], { type: 'text/plain' }), filename);
}

const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

const stlDownloadButton = document.getElementById('stl-download');

//wird ausgeführt, wenn der download button gedrückt wird
stlDownloadButton.addEventListener('click', function () {

  let boxGeometry = new THREE.BoxGeometry(6,7,0.1);
  boxGeometry.translate(0,-0.2,-2.55);
  //Gemotry vom Gesicht und der Backplane werden kombiniert
  let tacGeometry = BufferGeometryUtils.mergeGeometries([geometry, boxGeometry]);

  let genericMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  let tacMesh = new THREE.Mesh(tacGeometry, genericMaterial);
  //console.log(tacGeometry.index);

  const exporter = new STLExporter();
  const result = exporter.parse(tacMesh);
  saveString(result, 'tactile.stl');
});