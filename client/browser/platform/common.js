// Generated by CoffeeScript 2.3.2
(function() {
  var Common;

  window.o.PlatformCommon = Common = class Common {
    language_check(callback) {
      if (!window._locales_default) {
        return callback();
      }
      return this.router.subview_append(new window.o.ViewPopupLanguage()).bind('language', (language) => {
        return App.lang = language;
      }).bind('remove', () => {
        return callback();
      }).render().$el.appendTo(this.router.$el);
    }

    connect(params) {
      return window.o.Connector(Object.assign({
        router: this.router,
        address: App.config.server,
        version: App.version,
        version_callback: () => {
          return this.router.message(_l('Authorize.version error'));
        }
      }, params));
    }

    buy(service) {
      return this.router.send(`coins:buy:${this._name}`, service);
    }

    auth_send(p) {
      this.router.message(_l('Authorize.Authorizing'));
      return this.router.send('authenticate:try', p);
    }

  };

}).call(this);
