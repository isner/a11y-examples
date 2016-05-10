
/**
 * Module dependencies.
 */

var suppressMain = require('../../lib/suppress-main');
var Emitter = require('component/emitter');
var events = require('component/events');
var Panel = require('./panel');
var Tab = require('./tab');

var expandedState = 'expanded';
var collapsedState = 'collapsed';

/**
 * Expose `Pair`.
 */

module.exports = Pair;

/**
 * Creates a new `Pair`.
 *
 * @param {HTMLElement} el
 * @param {Object} config
 * @param {Number} i
 * @api public
 */

function Pair(el, config, i) {
  var self = this;
  this.config = config;

  this.el = el;
  this.el.setAttribute('role', 'presentation');

  this.i = i;
  this.tab = new Tab(config.tab, el);
  this.panel = new Panel(config.panel, el)
    .on('focus-tab', function () {
      self.emit('select', { val: self.i });
    });

  this.panel.el.setAttribute('aria-labelledby', this.tab.el.id);

  this.events = events(el, this);
  this.events.bind('click ' + config.tab);
  this.events.bind('keydown ' + config.tab);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Pair.prototype);

/**
 * Handle clicks on the Pair's Tab.
 *
 * @param {ClickEvent} e
 * @return {Pair}
 * @api private
 */

Pair.prototype.onclick = function (e) {
  this.emit('select');
  this.toggle();
  return this;
};

/**
 * Handle keydown on the Pair's Tab.
 *
 * @param {ClickEvent} e
 * @return {Pair}
 * @api private
 */

Pair.prototype.onkeydown = function (e) {
  var key = e.which || e.keycode;
  var pair = this;

  switch (key) {
    case 37: // Left
    case 38: // Up
      e.preventDefault();
      this.emit('select', { val: 'prev' });
      break;
    case 39: // Right
    case 40: // Down
      e.preventDefault();
      this.emit('select', { val: 'next' });
      break;
    case 13: // Enter
    case 32: // Space
      e.preventDefault();
      this.toggle();
      break;
    case 35: // End
      e.preventDefault();
      this.emit('select', { val: 'last' });
      break;
    case 36: // Home
      e.preventDefault();
      this.emit('select', { val: 'first' });
      break;
    case 9: // Tab
      if (!e.shiftKey && !this.panel._isHidden) {
        e.preventDefault();

        if (this.config.suppressMain) {
          suppressMain(function () {
            pair.panel.focusTemp();
          }, 100);
        }
        else {
          this.panel.focusTemp();
        }
      }
      break;
  }
  return this;
};

/**
 * Toggle the state of the Pair.
 *
 * @return {Pair}
 * @api private
 */

Pair.prototype.toggle = function () {
  if (this.state == collapsedState) {
    this.expand();
  }
  else if (this.state == expandedState) {
    this.collapse();
  }
  return this;
};

/**
 * Expand this Pair.
 *
 * @return {Pair}
 * @api public
 */

Pair.prototype.expand = function () {
  this.tab.expand();
  this.panel.show();
  this.state = expandedState;
  return this;
};


/**
 * Collapse this Pair.
 *
 * @return {Pair}
 * @api public
 */

Pair.prototype.collapse = function () {
  this.tab.collapse();
  this.panel.hide();
  this.state = collapsedState;
  return this;
};

Pair.prototype.deselect = function () {
  this.tab.el.setAttribute('tabindex', '-1');
  this.tab.el.setAttribute('aria-selected', 'false');
};

Pair.prototype.select = function () {
  this.tab.el.setAttribute('tabindex', '0');
  this.tab.el.setAttribute('aria-selected', 'true');
  this.tab.el.focus();
};
