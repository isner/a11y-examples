
/**
 * Module dependencies.
 */

var classes = require('component/classes');

/**
 * Expose `Alert`.
 */

module.exports = Alert;

/**
 * Create an instance of `Alert`.
 *
 * TODO This is not currently modular. It relies on role="alert"
 * 			being present in the template and uses Bootstrap-specific
 * 			classes. Make it modular!
 *
 * @param {HTMLElement} el
 * @api public
 */

function Alert(el) {
  this.el = el;
}

/**
 * Update the text content of the Alert.
 *
 * @param {String} str
 * @return {Alert}
 * @api public
 */

Alert.prototype.text = function (str) {
  this.el.innerHTML = str;
  return this;
};

/**
 * Specify the type of alert message.
 *
 * @param {String} type - ['danger'|'success']
 * @return {Alert}
 * @api public
 */

Alert.prototype.type = function (type) {
  classes(this.el).remove('alert-danger');
  classes(this.el).remove('alert-success');
  classes(this.el).add('alert-' + type);
  return this;
};

/**
 * Show the Alert message.
 *
 * @return {Alert}
 * @api public
 */

Alert.prototype.show = function () {
  classes(this.el).remove('hidden');
  return this;
};

/**
 * Hide the Alert message.
 *
 * @return {Alert}
 * @api public
 */

Alert.prototype.hide = function () {
  classes(this.el).add('hidden');
  return this;
};
