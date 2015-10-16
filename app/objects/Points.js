'use strict';

import THREE from 'three';
import clone from 'clone';
import TWEEN from 'tween.js'

let start = Date.now();

export default class Points extends THREE.Object3D {
  constructor(audio) {
    super();
    this.numPoints = 15000;
    this.audioAnalyser = audio;
    this.step = 50;
    this.speedTimerX = 0.0001;
    this.speedTimerY = 0.0001;
    this.speedTimerZ = 0.0001;
    this.speedReload = 1;
    this.timerX = 0;
    this.timerY = 0;
    this.timerZ = 0;

    this.generatePoints();
  }

  generatePoints() {

    // Geomtry
    this.geometry = new THREE.BufferGeometry();

    let positions = new Float32Array( this.numPoints * 3 );
    let colors = new Float32Array( this.numPoints * 3 );
    let sizes = new Float32Array( this.numPoints );
    let velocities = new Float32Array( this.numPoints );
    let gaps = new Float32Array( this.numPoints );
    let color = new THREE.Color();
    const radius = 300;

    for ( let i = 0, i3 = 0; i < this.numPoints; i ++, i3 += 3 ) {

      positions[ i3 + 0 ] = ( Math.random() * 2 - 1 ) * radius;
      positions[ i3 + 1 ] = ( Math.random() * 2 - 1 ) * radius;
      positions[ i3 + 2 ] = ( Math.random() * 2 - 1 ) * 20;

      color.setHSL( 0, 0, 0 );

      colors[ i3 + 0 ] = color.r;
      colors[ i3 + 1 ] = color.g;
      colors[ i3 + 2 ] = color.b;
      velocities[ i ] = Math.random()*2;
      sizes[ i ] = 10;
      gaps[ i ] = 1;

    }

    this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
    this.geometry.addAttribute( 'velocity', new THREE.BufferAttribute( velocities, 1 ) );
    this.geometry.addAttribute( 'gap', new THREE.BufferAttribute( gaps, 1 ) );

    this.uniforms = {
      color:     { type: "c", value: new THREE.Color( 0xffffff ) },
      texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "assets/textures/particle.png" ) }
    };

    // Material
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader:   document.getElementById( 'vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
      blending:       THREE.AdditiveBlending,
      depthTest:      false,
      transparent:    true
    });

    // Mesh
    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.radius = clone(this.particleSystem.geometry.attributes.position.array); // Clone initial positions
    this.add(this.particleSystem);
  }

  intersectPoint(mouse) {

  }

  update(mouse) {
    let timer;
    if (this.anim){
      this.toSpeedTimerX = 0.002
      this.toSpeedTimerY = 0.002
      this.toSpeedTimerZ = 0.002
      if (mouse.x < 0) this.toSpeedTimerX = -0.002
      if (mouse.y < 0) this.toSpeedTimerY = -0.002
    }
    else{
      this.toSpeedTimerX = 0.0002;
      this.toSpeedTimerY = 0.0002;
      this.toSpeedTimerZ = 0.0002;
      if (mouse.x < 0) this.toSpeedTimerX = -0.0002;
      if (mouse.y < 0) this.toSpeedTimerY = -0.0002;
    }
    // Pour une transition smooth (valeur ou on est actuellement = (valeur ou on veut aller - valeur ou on est actuellment) * valeur de easing
    this.speedTimerX += ( this.toSpeedTimerX - this.speedTimerX ) * .04
    this.speedTimerY += ( this.toSpeedTimerY - this.speedTimerY ) * .04
    this.speedTimerZ += ( this.toSpeedTimerZ - this.speedTimerZ ) * .04
    this.timerX += this.speedTimerX;
    this.timerY += this.speedTimerY;
    this.timerZ += this.speedTimerZ;
    // timer = Date.now() * this.speedTimer;
    // console.log( this.speedTimer, timer, Date.now() )

    let positions = this.geometry.attributes.position.array;
    let colors = this.geometry.attributes.customColor.array;
    let audioAverage = this.audioAnalyser.audioData;
    //console.log(audioAverage);
    let color = new THREE.Color();
    // console.log(audioAverage);

    for ( let i = 0, i3 = 0; i < this.numPoints; i ++, i3 += 3 ) {

      if (this.anim) {
        const normalizeValue = audioAverage/25;
        color.setHSL( normalizeValue, normalizeValue, normalizeValue );

        colors[ i3 + 0 ] += (color.r - colors[ i3 + 0 ]) * this.speedReload;
        colors[ i3 + 1 ] += (color.g - colors[ i3 + 1 ]) * this.speedReload;
        colors[ i3 + 2 ] += (color.b - colors[ i3 + 2 ]) * this.speedReload;
        if (this.speedReload <= 0.999)
          this.speedReload += 0.000001;
      } else {
        colors[ i3 + 0 ] += (1 - colors[ i3 + 0 ]) * 0.01;
        colors[ i3 + 1 ] += (1 - colors[ i3 + 1 ]) * 0.01;
        colors[ i3 + 2 ] += (1 - colors[ i3 + 2 ]) * 0.01;
        
        this.speedReload = 0.01;
      }

      positions[ i3 + 0] = Math.cos(this.timerX) * this.step + this.radius[i3 + 0];
      positions[ i3 + 1] = Math.sin(this.timerY) * this.step + this.radius[i3 + 1];
      positions[ i3 + 2] = Math.sin(this.timerZ) * this.step + this.radius[i3 + 2];
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.customColor.needsUpdate = true;
  }
}