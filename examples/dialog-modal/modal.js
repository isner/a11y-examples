
/**
 * Module dependencies.
 */

var focusTrap = require('stephenmathieson/focus-trap');
var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');

/**
 * Define default styles for the `Modal`.
 * @type {Object}
 */

var styles = {
  'width': '600px'
};

/**
 * Define classname for the Modal's close button.
 * @type {String}
 */

var closeBtnClass = 'msi-close';

/**
 * Expose `Modal`.
 */

module.exports = Modal;

/**
 * Create an instance of `Modal`.
 *
 * @param {HTMLElement|String} content
 * @param {String} headingText
 * @api public
 */

function Modal(content, headingText) {
  // Stringify `content` argument
  if (content.nodeType) {
    content = content.outerHTML.toString();
  }
  this.equator = createEquator();
  this.omphalos = createOmphalos();
  this.panel = new Panel(content, headingText);

  var el = this.el = this.panel.el;

  this.equator.appendChild(this.omphalos);
  this.omphalos.appendChild(el);

  this.events = events(el, this);
  this.events.bind('click');
  this.events.bind('keydown');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Modal.prototype);

/**
 * Handles keydowns on the Modal.
 *
 * @param {KeyEvent} e
 * @return {Modal}
 * @api private
 */

Modal.prototype.onkeydown = function (e) {
  var key = e.which || e.keyCode;
  if (key == 27) {
    e.preventDefault();
    this.emit('close-dialog');
  }
  return this;
};

/**
 * Handles clicks on the Modal's close button.
 *
 * @param {ClickEvent} e
 * @return {Modal}
 * @api private
 */

Modal.prototype.onclick = function (e) {
  if (classes(e.target).has(closeBtnClass)) {
    this.emit('close-dialog');
  }
  return this;
};

/**
 * Insert the Modal elements.
 *
 * @return {Modal}
 * @api public
 */

Modal.prototype.show = function () {
  document.body.appendChild(this.equator);
  focusTrap(this.el);
  this.el.focus();
  return this;
};

/**
 * Remove the Modal elements.
 *
 * @return {Modal}
 * @api public
 */

Modal.prototype.hide = function () {
  document.body.removeChild(this.equator);
  return this;
};

/**
 * Generates an equator element,
 * used to position the modal vertically.
 *
 * @return {HTMLElement}
 * @api private
 */

function createEquator() {
  var el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.zIndex = '9999';
  el.style.height = '0px';
  el.style.width = '0px';
  el.style.top = '20vh';
  return el;
}

/**
 * Generates an omphalos element,
 * used to position the modal vertically.
 *
 * @return {HTMLElement}
 * @api private
 */

function createOmphalos() {
  var el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.height = '0px';
  el.style.width = '0px';
  el.style.left = '50%';
  return el;
}

function Panel(content, headingText, buttons) {
  var el = this.el = document.createElement('div');
  this.heading = new Heading(headingText);
  this.body = new Body(content);
  this.footer = new Footer(buttons);

  el.setAttribute('tabindex', '-1');
  el.setAttribute('role', 'dialog');
  // TODO Allow user to specify dialog title other
  // heading text
  el.setAttribute('aria-label', headingText);
  classes(el)
  .add('panel')
  .add('panel-default')
  .add('msi-modal');

  Object.keys(styles).forEach(function (prop) {
    if (styles.hasOwnProperty(prop)) {
      el.style[prop] = styles[prop];
    }
  });
  // Apply margin offset to horizontally center the body
  var width = /\d+/.exec(styles.width);
  el.style.marginLeft = -(width / 2) + 'px';

  if (this.heading) el.appendChild(this.heading.el);
  el.appendChild(this.body.el);
  el.appendChild(this.footer.el);
}

function Heading(text) {
  if (!text || typeof text != 'string') {
    return;
  }
  this.el = document.createElement('div');
  classes(this.el).add('panel-heading');

  var h2 = document.createElement('h2');
  classes(h2).add('modal-title');
  h2.innerHTML = text;
  this.el.appendChild(h2);
}

function Body(content) {
  this.el = document.createElement('div');
  classes(this.el).add('modal-body');
  this.el.innerHTML = content;
}

function Footer(buttons) {
  var el = this.el = document.createElement('div');
  classes(el).add('modal-footer');

  if (!buttons || !buttons.length) {
    buttons = ['Close'];
  }
  buttons.forEach(function (name) {
    el.appendChild(new Button(name).el);
  });
}

function Button(name) {
  this.el = document.createElement('button');
  this.el.setAttribute('type', 'button');
  this.el.innerHTML = name;
  classes(this.el)
  .add('btn')
  .add('btn-default');
  if (name == 'Close') {
    classes(this.el).add(closeBtnClass);
  }
}
