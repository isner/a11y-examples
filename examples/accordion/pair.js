
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
  // Arrow pressed
  if (~[37, 38, 39, 40].indexOf(key)) {
    e.preventDefault();
    // Left/Up arrow pressed
    if (~[37, 38].indexOf(key)) {
      this.emit('select', { val: 'prev' });
    }
    // Right/Down arrow pressed
    else if (~[39, 40].indexOf(key)) {
      this.emit('select', { val: 'next' });
    }
  }
  // Enter/Space pressed
  else if (~[13, 32].indexOf(key)) {
    this.toggle();
  }
  // Home pressed
  else if (key == 36) {
    e.preventDefault();
    this.emit('select', { val: 'first' });
  }
  // End pressed
  else if (key == 35) {
    e.preventDefault();
    this.emit('select', { val: 'last' });
  }
  // Tab pressed
  else if (key === 9 && !e.shiftKey) {
    e.preventDefault();
    var panel = this.panel;

    if (this.config.suppressMain) {
      suppressMain(function () {
        panel.focusTemp();
      }, 100);
    }
    else {
      panel.focusTemp();
    }
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
