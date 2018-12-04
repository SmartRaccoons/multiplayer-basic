// Generated by CoffeeScript 2.3.2
(function() {
  var Cookies, Cordova, PopupCode;

  Cookies = {
    set: function(key, value) {
      var e;
      try {
        return window.localStorage.setItem(key, value);
      } catch (error) {
        e = error;
        return null;
      }
    },
    get: function(key) {
      var e;
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        e = error;
        return null;
      }
    }
  };

  PopupCode = (function() {
    class PopupCode extends window.o.ViewPopup {};

    PopupCode.prototype.className = window.o.ViewPopupAuthorize.prototype.className;

    return PopupCode;

  }).call(this);

  window.o.PlatformCordova = Cordova = (function() {
    class Cordova extends window.o.PlatformCommon {
      constructor(options) {
        var fn;
        super();
        this.options = options;
        this._login_code_params = {};
        this.router = new window.o.Router();
        this.router.$el.appendTo('body');
        fn = (event, data) => {
          if (event === 'authenticate:error') {
            this.router.message(_l('standalone login error')).bind('login', () => {
              return this.auth_popup();
            });
          }
          if (event === 'authenticate:success') {
            this.router.unbind('request', fn);
          }
          if (event === 'authenticate:code') {
            this._login_code_params.random = data.random;
            return this.auth_popup_device(this._login_code_params);
          }
        };
        this.router.bind('request', fn);
        this.router.bind('connect', () => {
          this._login_code_params.random = null;
          if (!this.auth()) {
            if (!this.options.language_check) {
              return this.auth_popup();
            }
            return this.language_check(() => {
              return this.auth_popup();
            });
          }
        });
        this.router.bind('logout', () => {
          this._auth_clear();
          return window.location.reload(true);
        });
      }

      connect() {
        return super.connect({
          mobile: true
        });
      }

      auth_popup_device({random, platform}) {
        var link, link_text;
        link = [App.config.server, App.config.login[platform], '/', random].join('');
        link_text = link.replace('https://', '').replace('http://', '');
        return this.router.subview_append(new PopupCode({
          head: _l('Authorize') + ' ' + platform,
          body: _l('Authorize link', {link, link_text})
        })).bind('remove', () => {
          return this.auth_popup();
        }).render().$el.appendTo(this.router.$el);
      }

      auth_popup() {
        var authorize;
        authorize = this.router.subview_append(new window.o.ViewPopupAuthorize({
          platforms: Object.keys(App.config.login)
        }));
        authorize.bind('authorize', (platform) => {
          this._login_code_params.platform = platform;
          if (!this._login_code_params.random) {
            return this.router.send('authenticate:code', {
              language: App.lang
            });
          }
          return this.auth_popup_device(this._login_code_params);
        });
        return authorize.render().$el.appendTo(this.router.$el);
      }

      _auth_clear() {
        return Object.keys(App.config.login).forEach(function(c) {
          return Cookies.set(c, '');
        });
      }

      auth() {
        var i, len, params, platform, ref;
        params = {};
        ref = Object.keys(App.config.login);
        for (i = 0, len = ref.length; i < len; i++) {
          platform = ref[i];
          if (Cookies.get(platform)) {
            params[platform] = Cookies.get(platform);
            this.auth_send(params);
            return true;
          }
        }
        return false;
      }

    };

    Cordova.prototype._authorize = {
      draugiem: 'dr_auth_code',
      facebook: 'access_token',
      google: 'code'
    };

    return Cordova;

  }).call(this);

}).call(this);
