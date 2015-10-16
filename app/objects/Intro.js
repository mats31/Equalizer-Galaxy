'use strict';

import THREE from 'three';
import clone from 'clone';

let start = Date.now();

export default class Points extends THREE.Object3D {
  constructor(canvas, context) {
    super();
    this.canvas = canvas;
    this.context = context;
    this.density = 4;
    this.timer = 0;
    this.height = 0;
    this.launchExperiment = false;
    this.randomLeave = new Float32Array(1842 * 3);
    this.createParticles();
  }

  createParticles() {
    this.geometry = new THREE.BufferGeometry();

    const WIDTH = this.canvas.width;
    const HEIGHT = this.canvas.height;

    let pixels = this.context.getImageData(0,0,WIDTH,HEIGHT);
    let step = this.density * 4;
    let i = 0;
    let i3 = 0;
    let positions = new Float32Array(1842 * 3);
    let colors = new Float32Array(1842 * 3);
    let sizes = new Float32Array(1842);
    let startPositions = new Float32Array(1842);
    let color = new THREE.Color();

    //console.log(pixels);
    // Pour le Y, test pourcentage de la hauteur. Pour le z cos d'un timer.
    for(let x = 0; x < WIDTH * 4; x+= step) {
      for(let y = HEIGHT; y >= 0 ; y -= this.density)
      {
        let p = ((y * WIDTH * 4) + x);
        
        // grab the actual data from the
        // pixel, ignoring any transparent ones
        if(pixels.data[p] == 255 && pixels.data[p+1] == 255 && pixels.data[p+2] == 255)
        {
          // push on the particle
          positions[ i3 + 0 ] = x/4;
          positions[ i3 + 1 ] = -y;
          positions[ i3 + 2 ] = -500;

          if (this.height < Math.abs(positions[ i3 + 1 ])) this.height = Math.abs(positions[ i3 + 1 ]);

          color.setHSL( 1, 1, 1 );

          colors[ i3 + 0 ] = color.r;
          colors[ i3 + 1 ] = color.g;
          colors[ i3 + 2 ] = color.b;
          sizes[ i ] = 100;
          startPositions[ i ] = Math.floor(Math.random() * 401) - 200;

          i += 1;
          i3 += 3;
        }
      }
    }

    this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
    this.geometry.addAttribute( 'startPosition', new THREE.BufferAttribute( startPositions, 1 ) );

    // Autre méthode : passer un yvalue en uniform, qui se modifie constamment,
    // si le vertice est en dessous, il a cette couleur sinon il a cette couleur
    this.uniforms = {
      color:     { type: "c", value: new THREE.Color( 0xffffff ) },
      texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "assets/textures/particle.png" ) }
    };

    // Material
    this.material = new THREE.ShaderMaterial({
      uniforms:       this.uniforms,
      vertexShader:   document.getElementById( 'vertexshader2' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader2' ).textContent,
      blending:       THREE.AdditiveBlending,
      depthTest:      true,
      transparent:    true
    });

    // Mesh
    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.cloneInitialPositions = clone(this.geometry.attributes.position.array);
    this.cloneInitialSizes = clone(this.geometry.attributes.size.array);
    this.add(this.particleSystem);
  }

  update() {
    this.geometry.attributes.customColor.needsUpdate = true;
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.startPosition.needsUpdate = true;

    if (this.timer >= 100) this.timer = 0;

    this.timer += 0.45;

    let positions = this.geometry.attributes.position.array;
    let colors = this.geometry.attributes.customColor.array;
    let sizes = this.geometry.attributes.size.array;
    let color = new THREE.Color();
    let startPosition = this.geometry.attributes.startPosition.array;

    for (let i = 0, i3 = 0; i < positions.length; i++, i3 += 3) {
      startPosition[ i ] += (1 - startPosition[ i ]) * 0.1;

      if (Math.round(((Math.abs(positions[i3 + 1]) * 100)/this.height)) > Math.round(this.timer) - 3 && Math.round(((Math.abs(positions[i3 + 1]) * 100)/this.height)) < Math.round(this.timer) + 3) {
        color.setHSL( 0.54, 1, 0.61 );

        colors[ i3 + 0 ] += ( color.r - colors[ i3 + 0 ] ) * 0.9;
        colors[ i3 + 1 ] += ( color.g - colors[ i3 + 1 ] ) * 0.9;
        colors[ i3 + 2 ] += ( color.b - colors[ i3 + 2 ] ) * 0.9;

        //sizes[i] = sizes[i] + 5;
        positions[ i3 + 2 ] += ( (positions[ i3 + 2 ] + 5) - positions[ i3 + 2 ] ) * 0.9;
      } else {
        color.setHSL( 1, 1, 1 );

        colors[ i3 + 0 ] += ( color.r - colors[ i3 + 0 ] ) * 0.9;
        colors[ i3 + 1 ] += ( color.g - colors[ i3 + 1 ] ) * 0.9;
        colors[ i3 + 2 ] += ( color.b - colors[ i3 + 2 ] ) * 0.9;

        //sizes[i] = this.cloneInitialSizes[ i ];
        positions[ i3 + 2 ] += ( this.cloneInitialPositions[ i3 + 2] - positions[ i3 + 2 ] ) * 0.1;
      }

      if (this.launchExperiment) {
        if (this.randomLeave[this.randomLeave.length - 1] == 0) {
          let randomX =  Math.random() * 1500;
          randomX = (Math.floor(Math.random() * 2) == 0) ? 0 - randomX : randomX;
          let randomY =  Math.random() * 1500;
          randomY = (Math.floor(Math.random() * 2) == 0) ? 0 - randomY : randomY;
          let randomZ =  Math.random() * (2000 - 1950) + 1950;
          this.randomLeave[ i3 + 0 ] = randomX;
          this.randomLeave[ i3 + 1 ] = randomY;
          this.randomLeave[ i3 + 2 ] = randomZ;
        } else {
          positions[ i3 + 0 ] += (this.randomLeave[ i3 + 0 ] - positions[ i3 + 0 ]) * 0.03;
          positions[ i3 + 1 ] += (this.randomLeave[ i3 + 1 ] - positions[ i3 + 1 ]) * 0.03;
          positions[ i3 + 2 ] += (this.randomLeave[ i3 + 2 ] - positions[ i3 + 2 ]) * 0.03;
        }        
      }
    };
  }
}