// Generated by CoffeeScript 2.3.2
(function() {
  var AnalyticBrowser, gtag;

  window.dataLayer = window.dataLayer || [];

  gtag = function() {
    return window.dataLayer.push(arguments);
  };

  window.o.Analytic = AnalyticBrowser = class AnalyticBrowser {
    init() {
      $('<script>').attr({
        src: `https://www.googletagmanager.com/gtag/js?id=${App.config.google_analytics}`,
        async: true
      }).appendTo(document.body);
      gtag('js', new Date());
      return this.config();
    }

    config(params = {}) {
      params['app_name'] = document.title;
      params['page_title'] = document.title;
      params['page_path'] = window.location.pathname;
      return gtag('config', App.config.google_analytics, params);
    }

    screen(screen_name) {
      return gtag('event', 'screen_view', {
        screen_name: `${screen_name} ${App.lang}`,
        app_version: App.version,
        app_installer_id: window.location.pathname.split('/')[2] || 'standalone'
      });
    }

    // app_id: ''
    exception(description) {
      return gtag('event', 'exception', {
        'description': description,
        'fatal': false
      });
    }

    buy_start(params) {
      return gtag('event', 'begin_checkout', {
        'items': [
          {
            'id': params.service,
            'name': App.config.buy[params.service]
          }
        ]
      });
    }

    buy_complete(params) {
      return gtag('event', 'purchase', {
        'transaction_id': params.transaction_id,
        'affiliation': params.platform,
        'items': [
          {
            'id': params.service,
            'name': App.config.buy[params.service]
          }
        ]
      });
    }

  };

}).call(this);
