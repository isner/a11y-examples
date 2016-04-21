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

var Megamenu = require('./megamenu');

var selector = '#myMegamenu';

/**
 * Create new Megamenu using the selector provided.
 */

var menu = document.querySelector(selector);

if (!menu) {
  console.error('query failed: %s', selector);
}

menu = new Megamenu(menu);
console.log(menu);
}, {"./megamenu":2}],
2: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var events = require('component/events');
var classes = require('component/classes');
var Emitter = require('component/emitter');
var Dropdown = require('./dropdown');

var ddSelector = '.dropdown-menu';

/**
 * Expose `Megamenu`.
 */

module.exports = Megamenu;

/**
 * Create a new instance of `Megamenu`.
 *
 * @param {HTMLElement} el
 * @api public
 */

function Megamenu(el) {
  this.el = el;
  this.dropdowns = [];
  this.init(el);
  this.events = events(el, this);
  this.events.bind('keydown');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Megamenu.prototype);

/**
 * Initialize the `Megamenu`.
 *
 * - Create a `Dropdown` for each dropdown in the megamenu.
 *
 * @param  {HTMLElement} el
 * @return {Megamenu}
 */

Megamenu.prototype.init = function (el) {
  var self = this;
  var dropdowns = el.querySelectorAll(ddSelector);
  if (!dropdowns) {
    return;
  }
  [].slice.call(dropdowns).forEach(function (dropdown) {
    var dd = new Dropdown(dropdown);
    dd.on('hideOthers', function (data) {
      self.hideAllExcept(data.except);
    });
    self.dropdowns.push(dd);
  });
};

Megamenu.prototype.hideAllExcept = function (except) {
  this.dropdowns.forEach(function (dropdown) {
    if (except == dropdown.el) {
      return;
    }
    classes(dropdown.trigger.el).remove('open');
    dropdown.hide();
  });
};

Megamenu.prototype.onkeydown = function (e) {
  var self = this;
  var target = e.target;
  var key = e.which || e.keyCode;
  // Arrow pressed
  if (~[37, 38, 39].indexOf(key)) {
    e.preventDefault();
    this.arrowNav(target, key);
  }
  else if (~[40].indexOf(key)) {
    e.preventDefault();
    self.dropdowns.forEach(function (dd) {
      if (target == dd.trigger.el) {
        dd.show();
      }
    });
  }
};

Megamenu.prototype.arrowNav = function (el, key) {
  var self = this;
  var dds = this.dropdowns;
  var prevPressed = ~[37, 38].indexOf(key);
  var nextPressed = ~[39].indexOf(key);

  if (prevPressed) {
    dds.forEach(function (dd, index, arr) {
      if (dd.trigger.el == el) {
        var dest = index === 0
          ? arr.length - 1
          : index - 1;
        self.selectTrigger(dds[dest].trigger);
      }
    });
  }
  else if (nextPressed) {
    dds.forEach(function (dd, index, arr) {
      if (dd.trigger.el == el) {
        var dest = index == arr.length - 1
          ? 0
          : index + 1;
        self.selectTrigger(dds[dest].trigger);
      }
    });
  }
};

/**
 * Select a given Trigger#.
 *
 * @param {Trigger} trigger
 * @return {Megamenu}
 * @api private
 */

Megamenu.prototype.selectTrigger = function (trigger) {
  this.dropdowns.forEach(function (dropdown) {
    dropdown.trigger.deselect();
  });
  trigger.select();
  return this;
};

}, {"component/events":3,"component/classes":4,"component/emitter":5,"./dropdown":6}],
3: [function(require, module, exports) {

/**
 * Module dependencies.
 */

try {
  var events = require('event');
} catch(err) {
  var events = require('component-event');
}

try {
  var delegate = require('delegate');
} catch(err) {
  var delegate = require('component-delegate');
}

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

}, {"event":7,"component-event":7,"delegate":8,"component-delegate":8}],
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

try {
  var closest = require('closest');
} catch(err) {
  var closest = require('component-closest');
}

try {
  var event = require('event');
} catch(err) {
  var event = require('component-event');
}

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

}, {"closest":9,"component-closest":9,"event":7,"component-event":7}],
9: [function(require, module, exports) {
/**
 * Module Dependencies
 */

try {
  var matches = require('matches-selector')
} catch (err) {
  var matches = require('component-matches-selector')
}

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

}, {"matches-selector":10,"component-matches-selector":10}],
10: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var query = require('query');
} catch (err) {
  var query = require('component-query');
}

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

}, {"query":11,"component-query":11}],
11: [function(require, module, exports) {
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
4: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var index = require('indexof');
} catch (err) {
  var index = require('component-indexof');
}

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

}, {"indexof":12,"component-indexof":12}],
12: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
5: [function(require, module, exports) {

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

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

}, {"component/events":3,"component/classes":4,"component/closest":9,"component/emitter":5,"./trigger":13}],
13: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var events = require('component/events');
var classes = require('component/classes');
var Emitter = require('component/emitter');

var toggleSelector = '.dropdown-toggle';

/**
 * Expose `Trigger`.
 */

module.exports = Trigger;

/**
 * Creates an instance of `Trigger`.
 *
 * @param {HTMLElement} el
 */

function Trigger(el, dropdown) {
  this.el = el;
  this.dropdown = dropdown;
  this.init();
  this.events = events(this.el, this);
  this.events.bind('click', 'activate');
  this.events.bind('keydown');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Trigger.prototype);

Trigger.prototype.init = function () {
  var parent = this.dropdown.el.parentNode;
  this.el = parent.querySelector(toggleSelector);
};

Trigger.prototype.activate = function (e) {
  if (classes(this.dropdown.el).has('open')) {
    this.dropdown.hide();
  }
  else {
    this.dropdown.show();
  }
};

Trigger.prototype.onkeydown = function (e) {
  var key = e.which || e.keyCode;
  var prevPressed = ~[37, 38].indexOf(key);
  var nextPressed = ~[39, 40].indexOf(key);

  if (prevPressed) {
    e.preventDefault();
    this.emit('goto', { dir: 'prev' });
  }
  else if (nextPressed) {
    e.preventDefault();
    this.emit('goto', { dir: 'next' });
  }
};

/**
 * Deselect this Trigger.
 *
 * @return {Trigger}
 * @api public
 */

Trigger.prototype.deselect = function () {
  classes(this.el).remove('selected');
};

/**
 * Select this Trigger.
 *
 * @return {Trigger}
 * @api public
 */

Trigger.prototype.select = function () {
  classes(this.el).add('selected');
  this.el.focus();
};

}, {"component/events":3,"component/classes":4,"component/emitter":5}]}, {}, {"1":""})
