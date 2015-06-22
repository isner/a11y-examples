
/**
 * Module dependencies.
 */

var events = require('component/events');
var classes = require('component/classes');
var closest = require('component/closest');
var Emitter = require('component/emitter');
var Trigger = require('./trigger');

/**
 * Expose `Dropdown`.
 */

module.exports = Dropdown;

/**
 * Creates an instance of `Dropdown`.
 *
 * @param {HTMLElement} el
 */

function Dropdown(el) {
  var self = this;
  this.el = el;
  this.getAnchors();
  this.trigger = new Trigger(el, this)
    .on('goto', function (data) {
      self.emit('goto', { dir: data.dir });
    });
  this.events = events(el, this);
  this.events.bind('keydown');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Dropdown.prototype);

Dropdown.prototype.show = function () {
  classes(this.el).add('open');
  this.trigger.el.setAttribute('aria-expanded', 'true');
  this.emit('hideOthers', {
    except: this.el
  });
  classes(this.trigger.el).add('open');
  this.anchors[0].focus();
};

Dropdown.prototype.hide = function () {
  classes(this.el).remove('open');
  this.trigger.el.setAttribute('aria-expanded', 'false');
  classes(this.trigger.el).remove('open');
  this.trigger.el.focus();
};

Dropdown.prototype.onkeydown = function (e) {
  var target = e.target;
  var key = e.which || e.keyCode;
  // Escape pressed
  if (key == 27) {
    this.hide();
  }
  // Arrow pressed
  if (~[37, 38, 39, 40].indexOf(key)) {
    e.preventDefault();
    this.arrowNav(target, key);
  }
};

Dropdown.prototype.arrowNav = function (el, key) {
  var anchors = this.anchors;
  var prevPressed = ~[37, 38].indexOf(key);
  var nextPressed = ~[39, 40].indexOf(key);

  if (prevPressed) {
    anchors.forEach(function (anchor, index, arr) {
      if (anchor == el) {
        var dest = index == 0
          ? arr.length - 1
          : index - 1;
        anchors[dest].focus();
      }
    });
  }
  else if (nextPressed) {
    anchors.forEach(function (anchor, index, arr) {
      if (anchor == el) {
        var dest = index == arr.length - 1
          ? 0
          : index + 1;
        anchors[dest].focus();
      }
    });
  }
};

Dropdown.prototype.getAnchors = function () {
  var anchors = this.el.querySelectorAll('a, [tabindex="0"]');
  this.anchors = [].slice.call(anchors);
};
