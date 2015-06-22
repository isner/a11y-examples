
/**
 * Module dependencies.
 */

var classes = require('component/classes');

/**
 * Expose `Panel`.
 */

module.exports = Panel;

function Panel(el, options) {
  this.el = el;
  this.options = options;
}

Panel.prototype.hide = function () {
  if (this.options.hiddenClass) {
    classes(this.el).add(this.options.hiddenClass);
  }
  else {
    this.el.style.display = 'none';
  }
};
