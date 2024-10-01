// Generated by CoffeeScript 2.7.0
(function() {
  var FacebookInstant;

  window.o.PlatformFacebookInstant = FacebookInstant = (function() {
    class FacebookInstant extends window.o.PlatformCommon {
      constructor(options) {
        var fn;
        super(...arguments);
        this.options = options;
        fn = (event, data) => {
          if (event === 'authenticate:error') {
            this.auth_error();
          }
          if (event === 'authenticate:success') {
            return this.router.unbind('request', fn);
          }
        };
        this.router.bind('request', fn);
        this.router.bind('connect', () => {
          return FBInstant.player.getSignedPlayerInfoAsync([FBInstant.getLocale(), FBInstant.player.getName() || '', FBInstant.player.getPhoto() || ''].join(';')).then((result) => {
            return this.auth_send({
              'facebook': 'fbinstant:' + result.getSignature()
            });
          });
        });
        // @router.bind "request:buy:#{@_name}", ({service, id})=>
        // subscription = App.config.buy.subscription and service in Object.keys(App.config.buy.subscription)
        // window.FB.ui {
        //   method: 'pay'
        //   action: if subscription then 'create_subscription' else 'purchaseitem'
        //   product: "#{App.config.server}/d/og/service-#{service}-#{App.lang}.html"
        //   request_id: id
        // }, ->
        // {subscription_id: 348322315297870, status: "active"}
        this;
      }

      // subscription_action: ({action, subscription_id})->
      // action: 'reactivate_subscription', 'cancel_subscription', 'modify_subscription'
      // window.FB.ui {
      //   method: 'pay'
      //   action
      //   subscription_id
      // }, ->
      notification_enable(callback) {
        return FBInstant.player.canSubscribeBotAsync().then((can_subscribe) => {
          return callback(can_subscribe);
        }).catch(() => {
          return callback(false);
        });
      }

      notification_ask(callback) {
        return FBInstant.player.subscribeBotAsync().then(() => {
          return callback(true);
        }).catch(() => {
          return callback(false);
        });
      }

      init(assets, callback) {
        var loaded, start;
        loaded = 0;
        start = () => {
          if (loaded < assets.length) {
            FBInstant.setLoadingProgress(loaded * 100 / assets.length);
            return;
          }
          return FBInstant.startGameAsync().then(() => {
            return callback();
          });
        };
        return FBInstant.initializeAsync().then(() => {
          return assets.forEach(function(src) {
            var i;
            i = new Image();
            i.onload = function() {
              loaded++;
              return start();
            };
            i.src = src;
            return start();
          });
        });
      }

      invite(params = {}, callback = function() {}) {
        return FBInstant.shareAsync(Object.assign({
          intent: 'INVITE',
          image: '',
          text: ''
        }, params)).then(() => {
          return callback();
        });
      }

      share(params = {}, callback = function() {}) {
        return FBInstant.shareAsync(Object.assign({
          intent: 'SHARE',
          image: '',
          text: ''
        }, params)).then(() => {
          return callback();
        });
      }

      auth_error() {
        return this.router.message({
          body: _l('Authorize.integrated login error'),
          actions: [
            {
              'reload': _l('Authorize.button.reload')
            }
          ]
        });
      }

    };

    FacebookInstant.prototype._name = 'facebook';

    return FacebookInstant;

  }).call(this);

}).call(this);
