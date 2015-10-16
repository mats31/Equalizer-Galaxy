'use strict';

import domready from 'domready';
import Webgl from './Webgl';
import raf from 'raf';
import Stats from 'stats-js';
import dat from 'dat-gui';
import 'gsap';

let webgl;
let gui;
let stats;

domready(() => {
  window.AudioContext = window.AudioContext // Default
      || window.webkitAudioContext // Safari and old versions of Chrome
      || false; 

  // webgl settings
  webgl = new Webgl(window.innerWidth, window.innerHeight);
  document.body.appendChild(webgl.renderer.domElement);

  // GUI settings
  gui = new dat.GUI();
  gui.add(webgl, 'usePostprocessing');
  gui.add(webgl, 'disableMusic');

  // Stats
  stats = new Stats();
  stats.setMode(0);
  // Align top-left 
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild( stats.domElement );

  // handle resize
  window.onresize = resizeHandler;

  // let's play !
  animate();
});

function resizeHandler() {
  webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
  raf(animate);
  stats.begin();
  webgl.render();
  stats.end();
}