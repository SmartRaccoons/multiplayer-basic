// Generated by CoffeeScript 2.5.1
(function() {
  var Popup;

  window.o.ViewPopup = Popup = (function() {
    class Popup extends window.o.View {
      constructor() {
        super(...arguments);
        if (this.options.parent) {
          this.$el.appendTo(this.options.parent);
        }
        this;
      }

      remove() {
        clearTimeout(this.__close_delay_timeout);
        return super.remove(...arguments);
      }

      render() {
        super.render(...arguments);
        this.$container = $(this.$('div')[0]);
        return this;
      }

    };

    Popup.prototype._remove_timeout = 200;

    Popup.prototype.smooth_appear = true;

    Popup.prototype.className = 'popup';

    Popup.prototype.template = `<div>
   <% if (!('close' in self.options) || self.options.close){ %>
    <button data-delay=" &=close_delay " data-action='close' class='popup-close'><%= self.options.close_content || '' %></button>
   <% } %>

   <% if (self.options.head) { %>
    <h1><%= typeof self.options.head === 'function' ? self.options.head({'self': self}) : self.options.head %></h1>
   <% } %>

   <div>
     <% if(self.options.body){ %>
        <%= typeof self.options.body === 'function' ? self.options.body({'self': self}) : self.options.body %>
     <% } %>
     <% if (self.options.actions) { %>

       <div class='popup-actions'>
         <% self.options.actions.forEach(function (button) {
           var event, body;
           if (!button.event) {
             event = Object.keys(button)[0];
             body = button[event];
           }

           %><button data-click='<%= event || button.event %>'<%= button.attr ? ' data-click-attr="' + button.attr + '"' : ''%><%= button.stay ? ' data-stay' : '' %>><%= body || button.body %></button><%
         }); %>

      </div>
     <% } %>
   </div>
</div>`;

    Popup.prototype.options_default = {
      close: true,
      close_delay: null,
      close_content: '×'
    };

    // head: false
    // body: ''
    // actions: [] # {event, attr, stay, body}
    Popup.prototype.options_bind = {
      close_delay: function() {
        clearTimeout(this.__close_delay_timeout);
        if (this.options.close_delay === 0) {
          return this.options_update({
            close_delay: null
          });
        }
        if (this.options.close_delay && this.options.close_delay > 0) {
          return this.__close_delay_timeout = setTimeout(() => {
            return this.options_update({
              close_delay: this.options.close_delay - 1
            });
          }, 1000);
        }
      }
    };

    Popup.prototype.events = {
      'click button[data-action="close"]': function() {
        this.trigger('close');
        if (!this._remove_timeout) {
          return this.remove();
        }
        this.$el.attr('data-add', '');
        return setTimeout(() => {
          return this.remove();
        }, this._remove_timeout);
      },
      'click [data-click]': function(e) {
        var el;
        el = $(e.target);
        this.trigger(el.attr('data-click'), el.attr('data-click-attr'));
        if (!el.is('[data-stay]')) {
          return this.remove();
        }
      }
    };

    return Popup;

  }).call(this);

}).call(this);
