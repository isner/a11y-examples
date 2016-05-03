
/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
var classes = require('component/classes');
var events = require('component/events');

/**
 * Define constants.
 */

var EXPANDED = 'aria-expanded';
var CONTROLS = 'aria-controls';
var HIDDEN = 'aria-hidden';

/**
 * Expose `expanded`.
 */

module.exports = Expanded;

/**
 * Create an expandable trigger/area widget.
 *
 * @param {HTMLElement} trigger - SHOULD be button or anchor
 * @param {HTMLElement} area
 * @param {Object} [opts] - see CONFIGURATION below
 * @api public
 *
 * CONFIGURATION
 *
 * --- `opts.initalState` ---
 * The inital expanded state of the widget.
 * Defaults to `false`.
 *
 * --- `opts.hiddenClass` ---
 * If the page already uses a class to hide elements
 * in an accessible manner, you can specify the
 * classname to be used by `Expanded#`.
 * Default behavior uses inline `display: block;`
 * to hide the `area`.
 *
 * --- `opts.handler` ---
 * If the page already contains a handler that toggles
 * the visiblity of the expandable area, specify the
 * function here and remove it from its original
 * context in the page.
 * Useful if the area expansion is animated and you
 * wish to retain the animation, but still want
 * accessibilty amrkup added.
 *
 * NOTE
 *
 * `trigger` SHOULD be a button or anchor because
 * these element types fire a "click" event on Enter
 * (and/or Space) presses. Otherwise, only mouse clicks
 * will activate the trigger.
 */

function Expanded(trigger, area, opts) {
  if (validateArgs(trigger, area)) {
    return;
  }
  opts = opts || {};

  this.trigger = trigger;
  this.area = area;
  this.state = opts.initialState || false;
  this.hiddenClass = opts.hiddenClass;
  this.handler = opts.handler;

  this.events = events(trigger, this);
  this.events.bind('click');

  // Set initial state of trigger's expanded attribute
  trigger.setAttribute(EXPANDED, this.state);

  // Set inital state of area
  if (this.state) {
    this.showArea();
  }
  else {
    this.hideArea();
  }

  // If necessary, establish 'owned by' relationship
  if (!area.contains(trigger)) {
    area.id = area.id || assignId(area);
    trigger.setAttribute(CONTROLS, area.id);
  }
}

/**
 * Handles "click" events on `#trigger`.
 *
 * @api private
 */

Expanded.prototype.onclick = function () {
  // Toggle the widget's state
  this.state = !this.state;

  // Update the trigger's expanded attribute
  this.trigger.setAttribute(EXPANDED, this.state);

  // Toggle the area's visibility
  if (this.state) {
    this.showArea();
  }
  else {
    this.hideArea();
  }

  if (this.handler) {
    this.handler();
  }
};

/**
 * Updates "aria-expanded" on `#trigger`.
 * Hides the expandable `#area`.
 *
 * @return {Expanded}
 * @api private
 */

Expanded.prototype.hideArea = function () {
  var area = this.area;
  var handler = this.handler;
  var hiddenClass = this.hiddenClass;

  area.setAttribute(HIDDEN, 'true');

  if (!handler) {
    if (hiddenClass) {
      classes(area).add(hiddenClass);
    }
    else {
      area.style.display = 'none';
    }
  }
  return this;
};

/**
 * Updates "aria-expanded" on `#trigger`.
 * Shows the expandable `#area`.
 *
 * @return {Expanded}
 * @api private
 */

Expanded.prototype.showArea = function () {
  var area = this.area;
  var handler = this.handler;
  var hiddenClass = this.hiddenClass;

  area.setAttribute(HIDDEN, 'false');

  if (!handler) {
    if (hiddenClass) {
      classes(area).remove(hiddenClass);
    }
    else {
      area.style.display = 'block';
    }
  }
  return this;
};

/**
 * Validates the arguments provided to `Expanded`.
 *
 * @param {HTMLElement} trigger
 * @param {HTMLElement} area
 * @return {Mixed} - `Error#` or `false`
 * @api private
 */

function validateArgs(trigger, area) {
  if (!trigger) {
    return new Error('trigger is required');
  }
  if (!area) {
    return new Error('area is required');
  }
  if (!trigger.nodeType || trigger.nodeType != 1) {
    return new Error('trigger must be an element');
  }
  if (!area.nodeType || area.nodeType != 1) {
    return new Error('area must be an element');
  }
  return false;
}

/**
 * Assigns a random, unique id to a given `el`.
 *
 * @param {HTMLElement} el
 * @return {String}
 * @api public
 */

function assignId(el) {
  el.id = rndid();
  return el.id;
}
