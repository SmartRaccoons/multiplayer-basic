// Generated by CoffeeScript 2.3.2
(function() {
  var Cordova, PopupCode;

  PopupCode = (function() {
    class PopupCode extends window.o.ViewPopup {};

    PopupCode.prototype.className = window.o.ViewPopupAuthorize.prototype.className;

    return PopupCode;

  }).call(this);

  window.o.PlatformCordova = Cordova = (function() {
    class Cordova extends window.o.PlatformCommon {
      constructor(options) {
        var connect_fresh, fn;
        super();
        this.options = options;
        this._login_code_params = {};
        this.router = new window.o.Router();
        this.router.$el.appendTo('body');
        connect_fresh = () => {
          this._login_code_params.random = null;
          if (!this.auth()) {
            if (!this.options.language_check) {
              return this.auth_popup();
            }
            return this.language_check(() => {
              return this.auth_popup();
            });
          }
        };
        fn = (event, data) => {
          var platform, results, value;
          if (event === 'authenticate:error') {
            this._login_code_params.random = null;
            this.router.message(_l('Authorize.standalone login error')).bind('login', () => {
              return this.auth_popup();
            });
          }
          if (event === 'authenticate:code_error') {
            return connect_fresh();
          }
          if (event === 'authenticate:success') {
            this.router.unbind('request', fn);
          }
          if (event === 'authenticate:code') {
            this._login_code_params.random = data.random;
            this.auth_popup_device(this._login_code_params);
          }
          if (event === 'authenticate:params') {
            results = [];
            for (platform in data) {
              value = data[platform];
              results.push(Cookies.set(platform, value));
            }
            return results;
          }
        };
        this.router.bind('request', fn);
        this.router.bind('connect', () => {
          if (this._login_code_params.random) {
            return this.router.send('authenticate:code_check', {
              random: this._login_code_params.random
            });
          }
          return connect_fresh();
        });
        this.router.bind(`request:coins:buy:${this._name}`, ({service, id}) => {});
        // {App.config.server}/d/og/service-#{service}-#{App.lang}
        this.router.bind('logout', () => {
          this._auth_clear();
          return window.location.reload(true);
        });
      }

      connect() {
        return super.connect({
          mobile: true,
          version_callback: ({actual}) => {
            var is_prev, redirect, to_int, version_diff;
            to_int = function(v) {
              return v.split('.').map(function(v) {
                return parseInt(v);
              });
            };
            version_diff = ((v1, v2) => {
              var i, j;
              for (i = j = 0; j <= 1; i = ++j) {
                if (v1[i] !== v2[i]) {
                  return v1[i] - v2[i];
                }
              }
              return 0;
            })(to_int(App.version), to_int(actual));
            is_prev = () => {
              return window.location.href.indexOf('prev.html') >= 0;
            };
            redirect = (url) => {
              return window.location = url;
            };
            if (version_diff > 0 && !is_prev()) {
              return redirect('prev.html');
            }
            if (version_diff < 0 && is_prev()) {
              return redirect('index.html');
            }
            return this.router.message(_l('Authorize.version error cordova')).bind('open', () => {
              return window.open(App.config[this.options.platform].market, '_system');
            });
          }
        });
      }

      auth_popup_device({random, platform}) {
        var link, link_text;
        link = [App.config.server, App.config.login[platform], '/', random].join('');
        link_text = link.replace('https://', '').replace('http://', '');
        return this.router.subview_append(new PopupCode({
          head: _l('Authorize.head') + ' ' + platform,
          body: _l('Authorize.Authorize link', {
            link: `<a target='_blank' href='${link}'>${link_text}</a>`
          })
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
        var j, len, params, platform, ref;
        params = {};
        ref = Object.keys(App.config.login);
        for (j = 0, len = ref.length; j < len; j++) {
          platform = ref[j];
          if (Cookies.get(platform)) {
            params[platform] = Cookies.get(platform);
            this.auth_send(params);
            return true;
          }
        }
        return false;
      }

    };

    Cordova.prototype._name = 'cordova';

    Cordova.prototype._authorize = {
      draugiem: 'dr_auth_code',
      facebook: 'access_token',
      google: 'code'
    };

    return Cordova;

  }).call(this);

}).call(this);
