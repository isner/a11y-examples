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

var Accordion = require('./accordion');

var selector = '#myAccordion';

/**
 * Create an Accordion using the selector provided.
 */

var el = document.querySelector(selector);

new Accordion(el, {
  pair: '.panel',
  tab: '.panel-heading',
  panel: '.panel-body'
});

}, {"./accordion":2}],
2: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/Emitter');
var events = require('component/events');
var query = require('component/query');
var Pair = require('./pair');

/**
 * Expose `Accordion`.
 */

module.exports = Accordion;

/**
 * Creates a new instance of `Accordion`.
 *
 * @param {HTMLElement} el - outermost container
 * @param {Object} selectors
 * @api public
 */

function Accordion(el, selectors) {
	if (!(this instanceof Accordion)) {
    return new Accordion(selectors);
  }
  this.el = el;
  this.pairs = [];
  this.selectedIndex = 0;

  var self = this;
  var pairs = query.all(selectors.pair);

  [].slice.call(pairs).forEach(function (el, i) {
    var pair = self.pairs[i] = new Pair(el, selectors, i)
      .collapse()
      .on('select', function (data) {
        self.updateIndex(data.val);
      });
    var tabindex = i === 0 ? '0' : '-1';
    pair.tab.el.setAttribute('tabindex', tabindex);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Accordion.prototype);

/**
 * Update the Accordion's #selectedIndex, determined
 * by `val`, deselect all Tabs, and select the
 * new active Tab.
 *
 * @param {[String|Number]} val
 * @return {Accordion}
 * @api private
 */

Accordion.prototype.updateIndex = function (val) {
  var current = this.selectedIndex;

  // If relative movement instruction is provided, use it
  // else use the specific index
  switch (val) {
    case 'prev':
      this.selectedIndex = current > 0
        ? current - 1
        : this.pairs.length - 1;
      break;
    case 'next':
      this.selectedIndex = current < this.pairs.length - 1
        ? current + 1
        : 0;
      break;
    case 'first':
      this.selectedIndex = 0;
      break;
    case 'last':
      this.selectedIndex = this.pairs.length - 1;
      break;
    default:
      this.selectedIndex = val;
  }

  this.selectPair(this.selectedIndex);

  return this;
};

/**
 * Deselect all Pairs in this Accordion.
 *
 * @return {Accordion}
 * @api private
 */

Accordion.prototype.deselectAllPairs = function () {
  this.pairs.forEach(function (pair) {
    pair.deselect();
  });

  return this;
};

/**
 * Select a Pair of a given index.
 *
 * @return {Accordion}
 * @api private
 */

Accordion.prototype.selectPair = function (i) {
  this.deselectAllPairs();
  this.pairs[i].select();

  return this;
};

}, {"component/Emitter":3,"component/events":4,"component/query":5,"./pair":6}],
3: [function(require, module, exports) {

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
4: [function(require, module, exports) {

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

}, {"event":7,"delegate":8}],
7: [function(require, module, exports) {
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
8: [function(require, module, exports) {
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

}, {"closest":9,"event":7}],
9: [function(require, module, exports) {
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return
  }
}

}, {"matches-selector":10}],
10: [function(require, module, exports) {
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

}, {"query":5}],
5: [function(require, module, exports) {
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
6: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var events = require('component/events');
var Panel = require('./panel');
var Tab = require('./tab');

var expandedState = 'expanded';
var collapsedState = 'collapsed';

/**
 * Expose `Pair`.
 */

module.exports = Pair;

/**
 * Creates a new `Pair`.
 *
 * @param {HTMLElement} el
 * @param {Object} selectors
 * @param {Number} i
 * @api public
 */

function Pair(el, selectors, i) {
  var self = this;
  this.el = el;
  this.i = i;
  this.tab = new Tab(selectors.tab, el);
  this.panel = new Panel(selectors.panel, el)
    .on('focus-tab', function () {
      self.emit('select', { val: self.i });
    });
  this.events = events(el, this);
  this.events.bind('click ' + selectors.tab);
  this.events.bind('keydown ' + selectors.tab);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Pair.prototype);

/**
 * Handle clicks on the Pair's Tab.
 *
 * @param {ClickEvent} e
 * @return {Pair}
 * @api private
 */

Pair.prototype.onclick = function (e) {
  this.toggle();
  return this;
};

/**
 * Handle keydown on the Pair's Tab.
 *
 * @param {ClickEvent} e
 * @return {Pair}
 * @api private
 */

Pair.prototype.onkeydown = function (e) {
  var key = e.which || e.keycode;
  // Arrow pressed
  if (~[37, 38, 39, 40].indexOf(key)) {
    e.preventDefault();
    // Left/Up arrow pressed
    if (~[37, 38].indexOf(key)) {
      this.emit('select', { val: 'prev' });
    }
    // Right/Down arrow pressed
    else if (~[39, 40].indexOf(key)) {
      this.emit('select', { val: 'next' });
    }
  }
  // Enter/Space pressed
  else if (~[13, 32].indexOf(key)) {
    this.toggle();
  }
  // Home pressed
  else if (key == 36) {
    e.preventDefault();
    this.emit('select', { val: 'first' });
  }
  // End pressed
  else if (key == 35) {
    e.preventDefault();
    this.emit('select', { val: 'last' });
  }
  return this;
};

/**
 * Toggle the state of the Pair.
 *
 * @return {Pair}
 * @api private
 */

Pair.prototype.toggle = function () {
  if (this.state == collapsedState) {
    this.expand();
  }
  else if (this.state == expandedState) {
    this.collapse();
  }
  return this;
};

/**
 * Expand this Pair.
 *
 * @return {Pair}
 * @api public
 */

Pair.prototype.expand = function () {
  this.tab.expand();
  this.panel.show();
  this.state = expandedState;
  return this;
};


/**
 * Collapse this Pair.
 *
 * @return {Pair}
 * @api public
 */

Pair.prototype.collapse = function () {
  this.tab.collapse();
  this.panel.hide();
  this.state = collapsedState;
  return this;
};

Pair.prototype.deselect = function () {
  this.tab.el.setAttribute('tabindex', '-1');
  this.tab.el.setAttribute('aria-selected', 'false');
};

Pair.prototype.select = function () {
  this.tab.el.setAttribute('tabindex', '0');
  this.tab.el.setAttribute('aria-selected', 'true');
  this.tab.el.focus();
};

}, {"component/emitter":11,"component/events":4,"./panel":12,"./tab":13}],
11: [function(require, module, exports) {

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
12: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');
var query = require('component/query');

/**
 * Expose `Panel`.
 */

module.exports = Panel;

/**
 * Creates a new `Panel`.
 *
 * @param {String} selector
 * @param {HTMLElement} el - Pair#el
 * @api public
 */

function Panel(selector, el) {
  this.el = query(selector, el);
  this.events = events(el, this);
  this.events.bind('keydown');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Panel.prototype);

/**
 * Show this Panel.
 *
 * @return {Panel}
 * @api public
 */

Panel.prototype.show = function () {
  classes(this.el).remove('hidden');
  this.el.setAttribute('aria-hidden', 'false');
  return this;
};


/**
 * Hide this Panel.
 *
 * @return {Panel}
 * @api public
 */

Panel.prototype.hide = function () {
  classes(this.el).add('hidden');
  this.el.setAttribute('aria-hidden', 'true');
  return this;
};

/**
 * Handles keydown events on the Panel.
 *
 * @param {KeyEvent} e
 * @return {Panel}
 * @api private
 */

Panel.prototype.onkeydown = function (e) {
  var key = e.which || e.keyCode;
  // Ctrl + HOME
  if (key == 36 && e.ctrlKey) {
    e.preventDefault();
    this.emit('focus-tab');
  }
  return this;
};
}, {"component/emitter":11,"component/classes":14,"component/events":4,"component/query":5}],
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
13: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var query = require('component/query');

/**
 * Expose `Tab`.
 */

module.exports = Tab;

/**
 * Creates a new `Tab`.
 *
 * @param {String} selector
 * @param {HTMLElement} el - Pair#el
 * @api public
 */

function Tab(selector, el) {
  this.el = query(selector, el);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tab.prototype);

/**
 * Update the Tab's attributes to reflect the fact
 * that its corresponding Panel is expanded.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.expand = function () {
  this.el.setAttribute('aria-expanded', 'true');
  return this;
};


/**
 * Update the Tab's attributes to reflect the fact
 * that its corresponding Panel is collapsed.
 *
 * @return {Tab}
 * @api public
 */

Tab.prototype.collapse = function () {
  this.el.setAttribute('aria-expanded', 'false');
  return this;
};

}, {"component/emitter":11,"component/query":5}]}, {}, {"1":""})
