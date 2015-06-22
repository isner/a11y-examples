
/**
 * Module dependencies.
 */

var events = require('component/events');
var classes = require('component/classes');
var Emitter = require('component/emitter');
var Dropdown = require('./dropdown');

var ddSelector = '.dropdown-menu';

/**
 * Expose `Megamenu`.
 */

module.exports = Megamenu;

/**
 * Create a new instance of `Megamenu`.
 *
 * @param {HTMLElement} el
 * @api public
 */

function Megamenu(el) {
  this.el = el;
  this.dropdowns = [];
  this.init(el);
  this.events = events(el, this);
  this.events.bind('keydown');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Megamenu.prototype);

/**
 * Initialize the `Megamenu`.
 *
 * - Create a `Dropdown` for each dropdown in the megamenu.
 *
 * @param  {HTMLElement} el
 * @return {Megamenu}
 */

Megamenu.prototype.init = function (el) {
  var self = this;
  var dropdowns = el.querySelectorAll(ddSelector);
  if (!dropdowns) {
    return;
  }
  [].slice.call(dropdowns).forEach(function (dropdown) {
    var dd = new Dropdown(dropdown);
    dd.on('hideOthers', function (data) {
      self.hideAllExcept(data.except);
    });
    self.dropdowns.push(dd);
  });
};

Megamenu.prototype.hideAllExcept = function (except) {
  this.dropdowns.forEach(function (dropdown) {
    if (except == dropdown.el) {
      return;
    }
    classes(dropdown.trigger.el).remove('open');
    dropdown.hide();
  });
};

Megamenu.prototype.onkeydown = function (e) {
  var self = this;
  var target = e.target;
  var key = e.which || e.keyCode;
  // Arrow pressed
  if (~[37, 38, 39].indexOf(key)) {
    e.preventDefault();
    this.arrowNav(target, key);
  }
  else if (~[40].indexOf(key)) {
    e.preventDefault();
    self.dropdowns.forEach(function (dd) {
      if (target == dd.trigger.el) {
        dd.show();
      }
    });
  }
};

Megamenu.prototype.arrowNav = function (el, key) {
  var self = this;
  var dds = this.dropdowns;
  var prevPressed = ~[37, 38].indexOf(key);
  var nextPressed = ~[39].indexOf(key);

  if (prevPressed) {
    dds.forEach(function (dd, index, arr) {
      if (dd.trigger.el == el) {
        var dest = index === 0
          ? arr.length - 1
          : index - 1;
        self.selectTrigger(dds[dest].trigger);
      }
    });
  }
  else if (nextPressed) {
    dds.forEach(function (dd, index, arr) {
      if (dd.trigger.el == el) {
        var dest = index == arr.length - 1
          ? 0
          : index + 1;
        self.selectTrigger(dds[dest].trigger);
      }
    });
  }
};

/**
 * Select a given Trigger#.
 *
 * @param {Trigger} trigger
 * @return {Megamenu}
 * @api private
 */

Megamenu.prototype.selectTrigger = function (trigger) {
  this.dropdowns.forEach(function (dropdown) {
    dropdown.trigger.deselect();
  });
  trigger.select();
  return this;
};
