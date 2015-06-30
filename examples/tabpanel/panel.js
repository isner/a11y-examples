
/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
var classes = require('component/classes');

/**
 * Expose `Panel`.
 */

module.exports = Panel;

/**
 * Create a new instance of `Panel`.
 *
 * @param {HTMLElement} el
 * @param {Object} options
 * @api public
 */

function Panel(el, options) {
  this.el = el;
  this.hiddenClass = options.hiddenClass || null;
  this.el.setAttribute('role', 'tabpanel');
  this.el.id = this.el.id || rndid();
}

/**
 * Show this Panel.
 * Prefers to use #hiddenClass supplied by options,
 * but default to settings inline style.
 *
 * @return {Panel}
 * @api public
 */

Panel.prototype.hide = function () {
  if (this.hiddenClass) {
    classes(this.el).add(this.hiddenClass);
  }
  else {
    this.el.style.display = 'none';
  }
  return this;
};

/**
 * Hide this Panel.
 * Prefers to use #hiddenClass supplied by options,
 * but default to settings inline style.
 *
 * @return {Panel}
 * @api public
 */

Panel.prototype.show = function () {
  if (this.hiddenClass) {
    classes(this.el).remove(this.hiddenClass);
  }
  else {
    this.el.style.display = 'block';
  }
  return this;
};
