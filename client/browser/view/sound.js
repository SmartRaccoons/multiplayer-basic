// Generated by CoffeeScript 2.3.2
(function() {
  var Sound, cordova;

  cordova = function() {
    return !!window.cordova;
  };

  this.o.Sound = Sound = (function() {
    class Sound {
      constructor(options) {
        var fn;
        this.options = options;
        this._media_last = null;
        this.__muted = false;
        fn = () => {
          this.__enable = true;
          document.body.removeEventListener('click', fn);
          return document.body.removeEventListener('touchstart', fn);
        };
        document.body.addEventListener('click', fn);
        document.body.addEventListener('touchstart', fn);
      }

      play(sound) {
        if (!this.__enable) {
          return;
        }
        if (this.__muted) {
          return;
        }
        try {
          if (cordova()) {
            if (this._media_last) {
              this._media_last.release();
            }
            this._media_last = new Media(`${this.options.path}${sound}.wav`);
            this._media_last.setVolume(`${this._volume}`);
          } else {
            this._media_last = new Audio(`${this.options.path}${sound}.wav`);
            this._media_last.volume = this._volume;
          }
          return this._media_last.play();
        } catch (error) {

        }
      }

      stop() {
        if (!this._media_last) {
          return;
        }
        if (cordova()) {
          return this._media_last.setVolume('0');
        } else {
          return this._media_last.volume = 0;
        }
      }

      is_mute() {
        return this.__muted;
      }

      mute(__muted) {
        this.__muted = __muted;
        return this.stop();
      }

    };

    Sound.prototype._volume = 0.3;

    return Sound;

  }).call(this);

}).call(this);
