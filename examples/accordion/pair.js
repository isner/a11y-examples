
/**
 * Module dependencies.
 */

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
 * @param {Object} selectors
 * @param {Number} i
 * @api public
 */

function Pair(el, selectors, i) {
  var self = this;
  this.el = el;
  this.i = i;
  this.tab = new Tab(selectors.tab, el);
  this.panel = new Panel(selectors.panel, el)
    .on('focus-tab', function () {
      self.emit('select', { val: self.i });
    });
  this.events = events(el, this);
  this.events.bind('click ' + selectors.tab);
  this.events.bind('keydown ' + selectors.tab);
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
