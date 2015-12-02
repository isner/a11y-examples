(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep || req);
    }, m, m.exports, outer, modules, cache, entries);

    // store to cache after successful resolve
    cache[id] = m;

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var DialogModal = require('../../lib/dialog-modal/dialog-modal.js');
var query = require('component/query');

/**
 * Define arguments.
 */

var trigger = query('.btn-default');
var content = require('./modal-body.html');
var title = 'Example Alert';

/**
 * Create an alert-dialog using the above arguments.
 */

new DialogModal(trigger, content, title, true);

}, {"../../lib/dialog-modal/dialog-modal.js":2,"component/query":3,"./modal-body.html":4}],
2: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var events = require('component/events');

var HideExcept = require('../hide-except');
var Overlay = require('./overlay');
var Modal = require('./modal');

/**
 * Expose `DialogModal`.
 */

module.exports = DialogModal;

/**
 * Creates a new instance of `DialogModal`.
 *
 * @param {HTMLElement} trigger
 * @param {HTMLElement|String} content
 * @param {String} headingText
 */

function DialogModal(trigger, content, headingText, isAlert) {
  if (trigger.nodeType != 1) {
    throw new TypeError('`trigger` must be an element');
  }
  var self = this;
  this.trigger = trigger;

  this.modal = new Modal(content, headingText, isAlert)
  .on('close-dialog', function () {
    self.close();
  });

  this.overlay = new Overlay()
  .on('close-dialog', function () {
    self.close();
  });

  this.hider = new HideExcept(this.modal.el);

  this.events = events(trigger, this);
  this.events.bind('click');
}

/**
 * Mixin `Emitter`.
 */

Emitter(DialogModal.prototype);

/**
 * Handles click events on the DialogModal's trigger.
 *
 * @return {DialogModal}
 * @api private
 */

DialogModal.prototype.onclick = function () {
  this.open();
  return this;
};

DialogModal.prototype.open = function () {
  this.overlay.show();
  this.modal.show();
  this.hider.activate();
};

DialogModal.prototype.close = function () {
  this.overlay.hide();
  this.modal.hide();
  this.hider.deactivate();
  this.trigger.focus();
};

}, {"component/emitter":5,"component/events":6,"../hide-except":7,"./overlay":8,"./modal":9}],
5: [function(require, module, exports) {

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}, {}],
6: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

}, {"event":10,"delegate":11}],
10: [function(require, module, exports) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
}, {}],
11: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

}, {"closest":12,"event":10}],
12: [function(require, module, exports) {
/**
 * Module Dependencies
 */

var matches = require('matches-selector')

/**
 * Export `closest`
 */

module.exports = closest

/**
 * Closest
 *
 * @param {Element} el
 * @param {String} selector
 * @param {Element} scope (optional)
 */

function closest (el, selector, scope) {
  scope = scope || document.documentElement;

  // walk up the dom
  while (el && el !== scope) {
    if (matches(el, selector)) return el;
    el = el.parentNode;
  }

  // check scope for match
  return matches(el, selector) ? el : null;
}

}, {"matches-selector":13}],
13: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

}, {"query":3}],
3: [function(require, module, exports) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

}, {}],
7: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var classes = require('component/classes');

/**
 * Expose `HideExcept`.
 */

module.exports = HideExcept;

/**
 * Create an instance of `HideExcept#`.
 *
 * @param {HTMLElement} el
 * @api public
 */

function HideExcept(el) {
  this.el = el;
  this.cache = [];
}

/**
 * Hide all elements except `#el`.
 *
 * @api public
 */

HideExcept.prototype.activate = function () {
  var self = this;
  var source = this.el;
  var parent = this.el.parentNode;

  while (parent && parent.nodeName != 'HTML') {
    var els = parent.childNodes;
    [].slice.call(els).forEach(function (el) {
      if (el == source || isParentOf(el, source)) {
        return;
      }
      self.hide(el);
    });
    parent = parent.parentNode;
  }
};

/**
 * Remove the hiding mechanism from all elements
 * in `#cache`.
 *
 * @api public
 */

HideExcept.prototype.deactivate = function () {
  this.cache.forEach(function (el) {
    // TODO add ability to detech presence of aria-hidden
    // attribute before this utility applies so we don't
    // clobber a pre-existing value
    el.removeAttribute('aria-hidden');
  });
  this.cache = [];
};

/**
 * Hide a given `el` and add it to `#cache`.
 *
 * @param {HTMLElement} el
 * @api private
 */

HideExcept.prototype.hide = function (el) {
  this.cache.push(el);
  el.setAttribute('aria-hidden', 'true');
};

/**
 * Checks to see whether `needle` is a parent of `origin`.
 *
 * @param {HTMLElement} origin
 * @param {HTMLElement} needle
 * @return {Boolean}
 * @api private
 */

function isParentOf(needle, origin) {
  var parent = origin.parentNode;
  var result = false;
  while (parent) {
    if (parent == needle) {
      result = true;
    }
    parent = parent.parentNode;
  }
  return result;
}

}, {"component/classes":14}],
14: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

}, {"indexof":15}],
15: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
8: [function(require, module, exports) {

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

}, {"component/emitter":5,"component/events":6}],
9: [function(require, module, exports) {

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
 * @param {Boolean} isAlert - dialog is an "alert-dialog"
 * @api public
 */

function Modal(content, headingText, isAlert) {
  // Stringify `content` argument
  if (content.nodeType) {
    content = content.outerHTML.toString();
  }
  this.equator = createEquator();
  this.omphalos = createOmphalos();
  // TODO 3rd `Content` arg is `buttons`. Where can user set this?
  this.content = new Content(content, headingText, null, isAlert);

  var el = this.el = this.content.el;

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

function Content(content, headingText, buttons, isAlert) {
  var el = this.el = document.createElement('div');
  this.heading = new Heading(headingText);
  this.body = new Body(content);
  this.footer = new Footer(buttons);

  var role = isAlert ? 'alertdialog' : 'dialog';

  el.setAttribute('tabindex', '-1');
  el.setAttribute('role', role);
  el.setAttribute('aria-label', headingText);
  classes(el)
  .add('modal-content')
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
  classes(this.el).add('modal-header');

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

}, {"stephenmathieson/focus-trap":16,"component/emitter":5,"component/classes":14,"component/events":6}],
16: [function(require, module, exports) {

var focusable = require('focusable-elements');
var ev = require('event');
var normalize = require('normalize');

/**
 * Expose `trapFocus`
 */

module.exports = focusTrap;

/**
 * Trap focus within `container`
 *
 * @api public
 * @param {HTMLElement} container
 * @return {Function} keyboard listener
 */

function focusTrap(container) {
  var elements = focusable(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  return ev.bind(container, 'keydown', function (keyboardEvent) {
    keyboardEvent = normalize(keyboardEvent);

    if (9 !== keyboardEvent.which) return;

    if (keyboardEvent.shiftKey) {
      if (first === keyboardEvent.target) {
        keyboardEvent.preventDefault();
        last.focus();
      }
    } else {
      if (last === keyboardEvent.target) {
        keyboardEvent.preventDefault();
        first.focus();
      }
    }
  });
}

}, {"focusable-elements":17,"event":10,"normalize":18}],
17: [function(require, module, exports) {

var isFocusable = require('is-focusable');
var descendants = require('descendants');

module.exports = elements;

/**
 * Get all focusable elements within `container`
 *
 * @api public
 * @param {HTMLElement} container
 * @return {Array}
 */

function elements(container) {
  var children = descendants(container);
  var focusable = [];
  for (var i = 0, len = children.length; i < len; i++) {
    if (isFocusable(children[i])) focusable.push(children[i]);
  }
  return focusable;
}

}, {"is-focusable":19,"descendants":20}],
19: [function(require, module, exports) {

var selector = /input|select|textarea|button/i;

module.exports = isFocusable;

/**
 * Check if the given `element` can receive focus
 *
 * @api public
 * @param {HTMLElement} element
 * @return {Boolean}
 */

function isFocusable(element) {
  // tabindex
  if (element.hasAttribute('tabindex')) {
    var tabindex = element.getAttribute('tabindex');
    if (!isNaN(tabindex)) {
      return true;
    }
  }

  // natively focusable, but only when enabled
  var name = element.nodeName;
  if (selector.test(name)) {
    return element.type.toLowerCase() !== 'hidden'
        && !element.disabled;
  }

  // anchors must have an href
  if (name === 'A') {
    return !!element.href;
  }

  return false;
}

}, {}],
20: [function(require, module, exports) {

/**
 * Convert the given `nodes` to an Array, filtering
 * out text and comment nodes
 *
 * @api private
 * @param {NodeList} nodes
 * @return {Array}
 */
function array(nodes) {
  var arr = [];

  for (var i = 0, len = nodes.length; i < len; i++) {
    var type = nodes[i].nodeType;
    type !== 8 && type !== 3 && arr.push(nodes[i]);
  }

  return arr;
}

/**
 * Get an Array of descendants from `element`
 *
 * @api public
 * @param {HTMLElement} element
 * @param {Boolean} [direct]
 * @return {Array}
 */
exports = module.exports = function (element, direct) {
  var decendants = direct
    ? element.childNodes
    : element.getElementsByTagName('*');

  return array(decendants);
};

}, {}],
18: [function(require, module, exports) {

/**
 * Normalize the events provided to `fn`
 *
 * @api public
 * @param {Function|Event} fn
 * @return {Function|Event}
 */

exports = module.exports = function (fn) {
  // handle functions which are passed an event
  if (typeof fn === 'function') {
    return function (event) {
      event = exports.normalize(event);
      fn.call(this, event);
    };
  }

  // just normalize the event
  return exports.normalize(fn);
};

/**
 * Normalize the given `event`
 *
 * @api private
 * @param {Event} event
 * @return {Event}
 */

exports.normalize = function (event) {
  event = event || window.event;

  event.target = event.target || event.srcElement;

  event.which = event.which ||  event.keyCode || event.charCode;

  event.preventDefault = event.preventDefault || function () {
    this.returnValue = false;
  };

  event.stopPropagation = event.stopPropagation || function () {
    this.cancelBubble = true;
  };

  return event;
};

}, {}],
4: [function(require, module, exports) {
module.exports = '<p>An important message can be displayed here.</p>\n';
}, {}]}, {}, {"1":""})
