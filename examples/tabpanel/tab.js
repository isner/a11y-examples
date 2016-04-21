
/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
var Emitter = require('component/emitter');
var events = require('component/events');
var query = require('component/query');
var Panel = require('./panel');

/**
 * Expose `Tab`.
 */

module.exports = Tab;

/**
 * Creates a new Tab.
 *
 * @param {HTMLElement} el
 * @param {Object} options
 * @api public
 */

function Tab(el, options) {
  this.el = el;
  this.opts = options || {};
  this.panel = new Panel(options.panelGetter(el), options);
  this.el.id = this.el.id || rndid();

  this.events = events(el, this);
  this.events.bind('click');
  this.events.bind('keydown');

  this.el.setAttribute('aria-controls', this.panel.el.id);
  this.el.setAttribute('role', 'tab');

  this.panel.el.setAttribute('aria-labelledby', this.el.id);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tab.prototype);

/**
 * Handle clicks on the Tab.
 *
 * @param {ClickEvent} e
 * @return {Tab}
 * @api private
 */

Tab.prototype.onclick = function (e) {
  this.emit('clicked', this);
  return this;
};

/**
 * Select this Tab.
 * Execute any custom function specified during config.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.select = function () {
  this.el.setAttribute('tabindex', '0');
  this.el.setAttribute('aria-selected', 'true');
  this.panel.show();

  // Execute any custom function specified during config.
  var selectFun = this.opts.selectFun;
  if (selectFun && typeof selectFun == 'function') {
    selectFun(this);
  }

  return this;
};

/**
 * Deselect this Tab.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.deselect = function () {
  this.el.setAttribute('tabindex', '-1');
  this.el.setAttribute('aria-selected', 'false');
  this.panel.hide();
  return this;
};

/**
 * Handles keydown events on a given Tab.
 *
 * @param {KeydownEvent} e
 * @return {Tab}
 * @api private
 */

Tab.prototype.onkeydown = function (e) {
  var key = e.which || e.keyCode;
  // Left/Up pressed
  if (~[37,38].indexOf(key)) {
    e.preventDefault();
    this.emit('navigated', 'prev');
  }
  // Right/Down pressed
  else if (~[39,40].indexOf(key)) {
    e.preventDefault();
    this.emit('navigated', 'next');
  }
  // Tab pressed
  else if (key === 9 && !e.shiftKey) {
    e.preventDefault();
    var panel = this.panel;

    if (this.opts.suppressMain) {
      suppressMain(function () {
        panel.focusTemp();
      }, 100);
    }
    else {
      panel.focusTemp();
    }
  }
};

/**
 * Suppresses "main" landmark semantics,
 * and reapplies them after a specified `time`.
 * Executes a given `fun` in the interim.
 *
 * @param  {Function} fun
 * @param  {Number} time - milliseconds
 */

function suppressMain(fun, time) {
  var mains = query.all('main, [role="main"]');
  if (!mains.length) {
    return fun();
  }
  [].slice.call(mains).forEach(function (main) {
    var role = main.getAttribute('role');
    main.setAttribute('role', 'presentation');
    fun();
    window.setTimeout(function () {
      if (role) {
        main.setAttribute('role', role);
      }
      else {
        main.removeAttribute('role');
      }
    }, time);
  });
}
