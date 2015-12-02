
/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var events = require('component/events');

/**
 * Define default styles for the `Overlay`.
 * @type {Object}
 */

var defaultStyles = {
  'backgroundColor': '#000',
  'position': 'absolute',
  'height': '100vh',
  'width': '100vw',
  'zIndex': '4999',
  'opacity': '0.5',
  'left': '0',
  'top': '0'
};

/**
 * Define the id of the Overlay element.
 * @type {String}
 */

var overlayId = 'msi-overlay';

/**
 * Expose `Overlay`.
 */

module.exports = Overlay;

/**
 * Create an instance of Overlay.
 *
 * @api public
 */

function Overlay() {
  this.el = document.createElement('div');
  this.el.id = overlayId;

  this.applyStyles(defaultStyles);

  this.events = events(this.el, this);
  this.events.bind('keydown body');
  this.events.bind('click');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Overlay.prototype);

Overlay.prototype.applyStyles = function (styles) {
  if (!styles || typeof styles != 'object') {
    return new Error('`styles` must be an object');
  }
  var el = this.el;
  Object.keys(styles).forEach(function (prop) {
    if (styles.hasOwnProperty(prop)) {
      el.style[prop] = styles[prop];
    }
  });
};

Overlay.prototype.onkeydown = function () {
  this.hide();
};

Overlay.prototype.onclick = function () {
  this.emit('close-dialog');
};

Overlay.prototype.show = function () {
  document.body.appendChild(this.el);
};

Overlay.prototype.hide = function () {
  document.body.removeChild(this.el);
};
