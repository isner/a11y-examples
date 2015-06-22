
/**
 * Module dependencies.
 */

var events = require('component/events');
var classes = require('component/classes');
var Emitter = require('component/emitter');

var toggleSelector = '.dropdown-toggle';

/**
 * Expose `Trigger`.
 */

module.exports = Trigger;

/**
 * Creates an instance of `Trigger`.
 *
 * @param {HTMLElement} el
 */

function Trigger(el, dropdown) {
  this.el = el;
  this.dropdown = dropdown;
  this.init();
  this.events = events(this.el, this);
  this.events.bind('click', 'activate');
  this.events.bind('keydown');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Trigger.prototype);

Trigger.prototype.init = function () {
  var parent = this.dropdown.el.parentNode;
  this.el = parent.querySelector(toggleSelector);
};

Trigger.prototype.activate = function (e) {
  if (classes(this.dropdown.el).has('open')) {
    this.dropdown.hide();
  }
  else {
    this.dropdown.show();
  }
};

Trigger.prototype.onkeydown = function (e) {
  var key = e.which || e.keyCode;
  var prevPressed = ~[37, 38].indexOf(key);
  var nextPressed = ~[39, 40].indexOf(key);

  if (prevPressed) {
    e.preventDefault();
    this.emit('goto', { dir: 'prev' });
  }
  else if (nextPressed) {
    e.preventDefault();
    this.emit('goto', { dir: 'next' });
  }
};

/**
 * Deselect this Trigger.
 *
 * @return {Trigger}
 * @api public
 */

Trigger.prototype.deselect = function () {
  classes(this.el).remove('selected');
};

/**
 * Select this Trigger.
 *
 * @return {Trigger}
 * @api public
 */

Trigger.prototype.select = function () {
  classes(this.el).add('selected');
  this.el.focus();
};
