// Generated by CoffeeScript 2.7.0
(function() {
  var Yandex;

  window.o.PlatformYandex = Yandex = (function() {
    class Yandex extends window.o.PlatformCommon {
      constructor() {
        var fn;
        super(...arguments);
        fn = (event, data) => {
          if (event === 'authenticate:error') {
            this.auth_error();
          }
          if (event === 'authenticate:success') {
            this.router.unbind('request', fn);
            if (this.options.payments) {
              return this.__init_payments();
            }
          }
        };
        this.router.bind('request', fn);
        this.router.bind('connect', () => {});
        this.router.bind(`request:buy:${this._name}`, ({service, transaction_id}) => {
          return this._payments.purchase({
            id: this.options.payments[service],
            developerPayload: `${transaction_id}`
          }).then((purchase) => {
            return this._payment_validate(purchase);
          }).catch(function(err) {});
        });
        this.router.bind(`request:buy:${this._name}:validate`, ({id_local}) => {
          return this._payments.consumePurchase(id_local);
        });
        this;
      }

      _payment_validate(purchase) {
        return this.router.send(`buy:${this._name}:validate`, {
          signature: purchase.signature,
          id_local: purchase.purchaseToken
        });
      }

      _get_user(callback = function() {}, callback_error = function() {}) {
        return ysdk.getPlayer({
          signed: true,
          scope: true
        }).then((player) => {
          this.auth_send({
            yandex: player.signature
          });
          return callback();
        }).catch(() => {
          return callback_error();
        });
      }

      auth() {
        return this._get_user(function() {}, () => {
          return ysdk.auth.openAuthDialog().then(() => {
            return this.auth();
          }).catch(() => {});
        });
      }

      __init(callback) {
        var script;
        script = document.createElement('script');
        script.async = true;
        script.onload = () => {
          return YaGames.init().then((ysdk) => {
            window.ysdk = ysdk;
            callback();
            return this._get_user(function() {}, () => {
              return this.router.trigger('anonymous');
            });
          });
        };
        script.src = 'https://yandex.ru/games/sdk/v2';
        return document.head.appendChild(script);
      }

      __init_payments() {
        return ysdk.getPayments({
          signed: true
        }).then((payments) => {
          this._payments = payments;
          this._get_catalog();
          return this._get_payments();
        // @trigger 'payments'
        }).catch(function(err) {});
      }

      _get_catalog() {
        var _invert, id, ref, service;
        _invert = {};
        ref = this.options.payments;
        for (service in ref) {
          id = ref[service];
          _invert[id] = service;
        }
        return this._payments.getCatalog().then((products) => {
          return this.options.payments_ready(products.map((product) => {
            return {
              service: _invert[product.id],
              price_str: product.price,
              price: parseInt(product.priceValue),
              currency: product.priceCurrencyCode
            };
          }));
        });
      }

      //       {
      //     "id": "chips1",
      //     "title": "1 000 фишек",
      //     "description": "Фишки для игры",
      //     "imageURI": "https://avatars.mds.yandex.net/get-games/1881371/2a0000017aed1e7a0014ec7a3591c5869959//default256x256",
      //     "price": "100 ₽",
      //     "priceValue": "100",
      //     "priceCurrencyCode": "RUR"
      // }
      _get_payments() {
        return this._payments.getPurchases().then((purchases) => {
          if (purchases.length > 0) {
            return this._payment_validate({
              signature: purchases.signature,
              purchaseToken: purchases[0].purchaseToken
            });
          }
        });
      }

      auth_error() {
        return this.router.message({
          close: true,
          body: _l('Authorize.integrated login error')
        }).bind('close', () => {
          return this.router.trigger('anonymous');
        });
      }

    };

    Yandex.prototype._name = 'yandex';

    return Yandex;

  }).call(this);

}).call(this);
