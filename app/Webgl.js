'use strict';

import AudioAnalyser from './AudioAnalyser';
import Cube from './objects/Cube';
import Intro from './objects/Intro';
import Points from './objects/Points';
import THREE from 'three';
window.THREE = THREE;

export default class Webgl {
  constructor(width, height) {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
    this.camera.position.z = 100;

    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000);

    // PostProcessing
    this.usePostprocessing = true;
    this.composer = new WAGNER.Composer(this.renderer);
    this.composer.setSize(width, height);
    this.initPostprocessing();

    // Audio Analyser
    this.audioAnalyser = new AudioAnalyser();
    this.disableMusic = false;

    // Canvas for intro picture
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.loadImage();

    // Prepare the particle system in the Points Class
    this.points = new Points(this.audioAnalyser);
    this.points.position.set(0, 0, 0);
    this.points.anim = true;

    // Create a Vector2 for the mouse position
    this.mouse = new THREE.Vector2();

    this.startButton = document.getElementById('start');
    this.blocs = document.getElementsByTagName('p');
    this.introLeft = false;

    this.init();
  }

  init() {
    // Create event for mousemove and get mouse position
    this.renderer.domElement.addEventListener('mousemove', (event) => {
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });
  }

  /**
   * Launch experiment when user click on start button
   */
  launchExperiment() {
    this.intro.launchExperiment = true;
    this.startButton.className = 'button--wayra start hide';
    for (var i = 0; i < this.blocs.length; i++) {
      this.blocs[i].className = this.blocs[i].classList[0];
    };
    this.disableMusic = false;
    this.scene.add(this.points);
    this.introLeft = true;
    setTimeout(() => {
      this.scene.remove(this.intro);
    }, 3000);
  }

  /**
   * Load image then add Intro Class to scene
   * @constructor
   */
  loadImage() {

    return new Promise((resolve, reject) => {
      this.img = new Image();
      this.img.src = 'assets/textures/gobelins.png';

      this.img.onload = () => {
        if (this.img.complete) {
          this.canvas.width = this.img.width;
          this.canvas.height = this.img.height;

          this.context.clearRect(0, 0, 9999, 9999);
          this.context.drawImage(this.img,0,0,this.img.width,this.img.height);
          this.intro = new Intro(this.canvas, this.context);
          this.intro.position.set(0,0,0);
          //this.intro.position.set(0,0,600);
          this.scene.add(this.intro);

          this.startButton.className = 'button--wayra start';
          for (var i = 0; i < this.blocs.length; i++) {
            this.blocs[i].className += ' active';
          };
          this.startButton.addEventListener('click', () => {
            this.launchExperiment();
          })

        } else {
          console.log(Error('Image not loaded :( !'));
        }
      }
    })
  }

  initPostprocessing() {
    if (!this.usePostprocessing) return;

    this.vignette2Pass = new WAGNER.Vignette2Pass();
  }

  resize(width, height) {
    this.composer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  render() {

    this.camera.updateMatrixWorld();

    if (typeof this.intro != 'undefined' && this.intro.geometry.boundingSphere != null) {
      this.intro.position.x = -this.intro.geometry.boundingSphere.radius/2;
      this.intro.position.y = this.intro.geometry.boundingSphere.radius + 50;
      //if (this.intro.position.z >= 1) this.intro.position.z += -this.intro.position.z * 0.02 
      this.intro.update();
    }

    if (this.usePostprocessing) {
      this.composer.reset();
      this.composer.renderer.clear();
      this.composer.render(this.scene, this.camera);
      this.composer.pass(this.vignette2Pass);
      this.composer.toScreen();
    } else {
      this.renderer.autoClear = false;
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }

    // play/pause the music
    if (this.disableMusic) {
      this.audioAnalyser.audio.pause();
      this.points.anim = false;
    } else if (this.introLeft) {
      this.audioAnalyser.audio.play();
      this.points.anim = true;
    }

    let average = 0;

    this.audioAnalyser.analyser.getByteFrequencyData(this.audioAnalyser.frequencyData);
    for (let i = 0; i < this.audioAnalyser.frequencyData.length; i++) {
      average += this.audioAnalyser.frequencyData[i];
      if (i == this.audioAnalyser.frequencyData.length - 1){
        average = average/this.audioAnalyser.frequencyData.length;
        this.audioAnalyser.audioData = average;
        //console.log(this.audioAnalyser.audioData);
      }
    };

    this.points.update(this.mouse);
  }
}