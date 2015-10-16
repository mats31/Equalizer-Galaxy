'use strict';

export default class AudioAnalyser {
  constructor(width, height) {
     this.ctx = new AudioContext();
     this.audio = document.getElementById('myAudio');
     this.audioSrc = this.ctx.createMediaElementSource(this.audio);
     this.analyser = this.ctx.createAnalyser();
     this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
     this.averagesArray = [];
     this.audioData = [];

     this.init();
  }

  init() {
    if (AudioContext) {
      // we have to connect the MediaElementSource with the analyser and the audio context
      this.audioSrc.connect(this.analyser);
      this.audioSrc.connect(this.ctx.destination);

      // document.body.addEventListener('touchend', () => {
      //   console.log('clicked');
      //   console.log(this.audio);
      //   this.audio.play();
      // })
    } else {
      alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
    }
  }
}