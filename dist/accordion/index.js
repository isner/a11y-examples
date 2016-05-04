(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name){
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
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(m.exports, function(req){
        var dep = modules[id][1][req];
        return require(dep || req);
      }, m, m.exports, outer, modules, cache, entries);
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

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

var displaySource = require('../../lib/display-source');
var Accordion = require('./accordion');
var query = require('component/query');

/**
 * Create an Accordion using the selector provided.
 */

var el = query('#myAccordion');

new Accordion(el, {
  pair: '.panel',
  tab: '.panel-heading',
  panel: '.panel-body',
  suppressMain: true
});

/**
 * Display the source files.
 */

displaySource(require('./source'));

}, {"../../lib/display-source":2,"./accordion":3,"component/query":4,"./source":5}],
2: [function(require, module, exports) {

var query = require('component/query');

module.exports = displaySource;

function displaySource(sourceArr) {
  if (sourceArr.length == 1 && sourceArr[0].name == 'source.js') {
    return;
  }
  var cage = query('#source');
  var sectionHeading = document.createElement('h2');
  sectionHeading.innerHTML = 'Source Files';
  sectionHeading.className = 'page-header';
  cage.appendChild(sectionHeading);

  sourceArr.forEach(function (file) {
    var isSourceJs = file.name == 'source.js';
    var isHtml = ~file.name.search('.html');
    var isJade = ~file.name.search('.jade');
    var isStyl = ~file.name.search('.styl');
    var isText = ~file.name.search('.txt');

    if (isSourceJs || isHtml || isJade || isStyl || isText) {
      return;
    }
    var heading = document.createElement('h3');
    var code = document.createElement('pre');

    heading.innerHTML = file.name;
    code.innerHTML = file.code;

    cage.appendChild(heading);
    cage.appendChild(code);
  });
}

}, {"component/query":4}],
4: [function(require, module, exports) {
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
3: [function(require, module, exports) {

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
 * @param {Object} config
 * @api public
 */

function Accordion(el, config) {
  if (!(this instanceof Accordion)) {
    return new Accordion(config);
  }
  this.el = el;
  this.pairs = [];
  this.selectedIndex = 0;

  this.el.setAttribute('role', 'tablist');
  this.el.setAttribute('aria-multiselectable', 'true');

  var self = this;
  var pairs = query.all(config.pair);

  [].slice.call(pairs).forEach(function (el, i) {
    var pair = self.pairs[i] = new Pair(el, config, i)
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

}, {"component/Emitter":6,"component/events":7,"component/query":4,"./pair":8}],
6: [function(require, module, exports) {

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
7: [function(require, module, exports) {

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

}, {"event":9,"component-event":9,"delegate":10,"component-delegate":10}],
9: [function(require, module, exports) {
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
10: [function(require, module, exports) {
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

}, {"closest":11,"component-closest":11,"event":9,"component-event":9}],
11: [function(require, module, exports) {
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

}, {"matches-selector":12,"component-matches-selector":12}],
12: [function(require, module, exports) {
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

}, {"query":4,"component-query":4}],
8: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var suppressMain = require('../../lib/suppress-main');
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
 * @param {Object} config
 * @param {Number} i
 * @api public
 */

function Pair(el, config, i) {
  var self = this;
  this.config = config;

  this.el = el;
  this.el.setAttribute('role', 'presentation');

  this.i = i;
  this.tab = new Tab(config.tab, el);
  this.panel = new Panel(config.panel, el)
    .on('focus-tab', function () {
      self.emit('select', { val: self.i });
    });

  this.panel.el.setAttribute('aria-labelledby', this.tab.el.id);

  this.events = events(el, this);
  this.events.bind('click ' + config.tab);
  this.events.bind('keydown ' + config.tab);
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

  switch (key) {
    case 37: // Left
    case 38: // Up
      e.preventDefault();
      this.emit('select', { val: 'prev' });
      break;
    case 39: // Right
    case 40: // Down
      e.preventDefault();
      this.emit('select', { val: 'next' });
      break;
    case 13: // Enter
    case 32: // Space
      e.preventDefault();
      this.toggle();
      break;
    case 35: // End
      e.preventDefault();
      this.emit('select', { val: 'last' });
      break;
    case 36: // Home
      e.preventDefault();
      this.emit('select', { val: 'first' });
      break;
    case 9: // Tab
      if (!e.shiftKey && !this.panel._isHidden) {
        e.preventDefault();

        if (this.config.suppressMain) {
          suppressMain(function () {
            this.panel.focusTemp();
          }, 100);
        }
        else {
          this.panel.focusTemp();
        }
      }
      break;
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

}, {"../../lib/suppress-main":13,"component/emitter":14,"component/events":7,"./panel":15,"./tab":16}],
13: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var query = require('component/query');

/**
 * Expose `suppressMain`.
 */

module.exports = suppressMain;

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

}, {"component/query":4}],
14: [function(require, module, exports) {

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
15: [function(require, module, exports) {

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
  this.el.setAttribute('role', 'tabpanel');
  this.el.setAttribute('aria-hidden', 'true');

  this.events = events(el, this);
  this.events.bind('keydown');
  this.events.bind('blur');
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
  this._isHidden = false;
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
  this._isHidden = true;
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

Panel.prototype.focusTemp = function () {
  this.el.setAttribute('tabindex', '-1');
  this.el.focus();
};

Panel.prototype.onblur = function (e) {
  this.el.removeAttribute('tabindex');
};

}, {"component/emitter":14,"component/classes":17,"component/events":7,"component/query":4}],
17: [function(require, module, exports) {
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

}, {"indexof":18,"component-indexof":18}],
18: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
16: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
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
  this.el.setAttribute('role', 'tab');
  this.el.setAttribute('aria-selected', 'false');
  this.el.setAttribute('aria-expanded', 'false');
  this.el.id = this.el.id || rndid();
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

}, {"stephenmathieson/rndid":19,"component/emitter":14,"component/query":4}],
19: [function(require, module, exports) {

/**
 * Expose `rndid`.
 */

exports = module.exports = rndid;

/**
 * Default ID length.
 */

exports.defaultLength = 7;

/**
 * Return a guaranteed unique id of the provided
 * `length`, optionally prefixed with `prefix`.
 *
 * If no length is provided, will use
 * `rndid.defaultLength`.
 *
 * @api private
 * @param {String} [prefix]
 * @param {Number} [length]
 * @return {String}
 */

function rndid(prefix, length) {
  if ('number' == typeof prefix)
    length = prefix, prefix = '';
  length = length || exports.defaultLength;
  var id = (prefix || '') + str(length);
  if (document.getElementById(id)) return rndid(prefix, length);
  return id;
}

/**
 * Generate a random alpha-char.
 *
 * @api private
 * @return {String}
 */

function character() {
  return String.fromCharCode(Math.floor(Math.random() * 25) + 97);
}

/**
 * Generate a random alpha-string of `len` characters.
 *
 * @api private
 * @param {Number} len
 * @return {String}
 */

function str(len) {
  for (var i = 0, s = ''; i < len; i++) s += character();
  return s;
}

}, {}],
5: [function(require, module, exports) {
module.exports = [{"name":"accordion.js","code":"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('component/Emitter');\nvar events = require('component/events');\nvar query = require('component/query');\nvar Pair = require('./pair');\n\n/**\n * Expose `Accordion`.\n */\n\nmodule.exports = Accordion;\n\n/**\n * Creates a new instance of `Accordion`.\n *\n * @param {HTMLElement} el - outermost container\n * @param {Object} config\n * @api public\n */\n\nfunction Accordion(el, config) {\n  if (!(this instanceof Accordion)) {\n    return new Accordion(config);\n  }\n  this.el = el;\n  this.pairs = [];\n  this.selectedIndex = 0;\n\n  this.el.setAttribute('role', 'tablist');\n  this.el.setAttribute('aria-multiselectable', 'true');\n\n  var self = this;\n  var pairs = query.all(config.pair);\n\n  [].slice.call(pairs).forEach(function (el, i) {\n    var pair = self.pairs[i] = new Pair(el, config, i)\n      .collapse()\n      .on('select', function (data) {\n        self.updateIndex(data.val);\n      });\n    var tabindex = i === 0 ? '0' : '-1';\n    pair.tab.el.setAttribute('tabindex', tabindex);\n  });\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Accordion.prototype);\n\n/**\n * Update the Accordion's #selectedIndex, determined\n * by `val`, deselect all Tabs, and select the\n * new active Tab.\n *\n * @param {[String|Number]} val\n * @return {Accordion}\n * @api private\n */\n\nAccordion.prototype.updateIndex = function (val) {\n  var current = this.selectedIndex;\n\n  // If relative movement instruction is provided, use it\n  // else use the specific index\n  switch (val) {\n    case 'prev':\n      this.selectedIndex = current > 0\n        ? current - 1\n        : this.pairs.length - 1;\n      break;\n    case 'next':\n      this.selectedIndex = current < this.pairs.length - 1\n        ? current + 1\n        : 0;\n      break;\n    case 'first':\n      this.selectedIndex = 0;\n      break;\n    case 'last':\n      this.selectedIndex = this.pairs.length - 1;\n      break;\n    default:\n      this.selectedIndex = val;\n  }\n\n  this.selectPair(this.selectedIndex);\n\n  return this;\n};\n\n/**\n * Deselect all Pairs in this Accordion.\n *\n * @return {Accordion}\n * @api private\n */\n\nAccordion.prototype.deselectAllPairs = function () {\n  this.pairs.forEach(function (pair) {\n    pair.deselect();\n  });\n\n  return this;\n};\n\n/**\n * Select a Pair of a given index.\n *\n * @return {Accordion}\n * @api private\n */\n\nAccordion.prototype.selectPair = function (i) {\n  this.deselectAllPairs();\n  this.pairs[i].select();\n\n  return this;\n};\n"},{"name":"index.jade","code":"\nextends ../layout\n\nblock vars\n\t- var heading = 'Accordion'\n\nblock content\n\t#myAccordion\n\t\t.panel.panel-default\n\t\t\t.panel-heading(id=\"jerry-tab\")\n\t\t\t\tspan Jerry\n\t\t\t.panel-body\n\t\t\t\tp Source:&nbsp;\n\t\t\t\t\ta(href=\"https://en.wikipedia.org/wiki/Jerry_Seinfeld_(character)\")\n\t\t\t\t\t\t| Jerry's Wikipedia page\n\t\t\t\tp Jerome \"Jerry\" Seinfeld is the protagonist of the American television sitcom Seinfeld (1989&dash;1998). The straight man among his group of friends, this semi-fictionalized version of comedian Jerry Seinfeld was named after, co-created by, based on, and played by Seinfeld himself. The series revolves around Jerry's misadventures with his best friend George Costanza, neighbor Cosmo Kramer, and ex-girlfriend Elaine Benes. He is usually the voice of reason amidst his friends' antics and the focal point of the foursome's relationship.\n\t\t.panel.panel-default\n\t\t\t.panel-heading(id=\"elaine-tab\")\n\t\t\t\tspan Elaine\n\t\t\t.panel-body\n\t\t\t\tp Source:&nbsp;\n\t\t\t\t\ta(href=\"https://en.wikipedia.org/wiki/Elaine_Benes\")\n\t\t\t\t\t\t| Elaine's Wikipedia page\n\t\t\t\tp Elaine Marie Benes is a fictional character on the American television sitcom Seinfeld (1989&dash;1998), played by Julia Louis-Dreyfus. Elaine's best friend is her ex-boyfriend Jerry Seinfeld, and she is also good friends with George Costanza and Cosmo Kramer. Julia Louis-Dreyfus received critical acclaim for her performance as Elaine, winning an Emmy, a Golden Globe and five SAG Awards.\n\t\t.panel.panel-default\n\t\t\t.panel-heading(id=\"george-tab\")\n\t\t\t\tspan George\n\t\t\t.panel-body\n\t\t\t\tp Source:&nbsp;\n\t\t\t\t\ta(href=\"https://en.wikipedia.org/wiki/George_Costanza\")\n\t\t\t\t\t\t| George's Wikipedia page\n\t\t\t\tp George Louis Costanza is a character in the American television sitcom Seinfeld (1989&dash;1998), played by Jason Alexander. He has variously been described as a \"short, stocky, slow-witted, bald man\" (by Elaine Benes and Costanza himself), and \"Lord of the Idiots\" (by Costanza himself). George and Jerry were junior high school friends and remained friends after. He is friends with Jerry Seinfeld, Cosmo Kramer, and Elaine Benes. George appears in every episode except \"The Pen\" (third season).\n\t\t.panel.panel-default\n\t\t\t.panel-heading(id=\"kramer-tab\")\n\t\t\t\tspan Kramer\n\t\t\t.panel-body\n\t\t\t\tp Source:&nbsp;\n\t\t\t\t\ta(href=\"https://en.wikipedia.org/wiki/Cosmo_Kramer\")\n\t\t\t\t\t\t| Kramer's Wikipedia page\n\t\t\t\tp Cosmo Kramer, usually referred to as simply \"Kramer\", is a fictional character on the American television sitcom Seinfeld (1989&dash;1998), played by Michael Richards. The character is loosely based on comedian Kenny Kramer, Larry David's former neighbor across the hall. Kramer is the friend and neighbor of main character Jerry Seinfeld, residing in Apartment 5B, and is friends with George Costanza and Elaine Benes. Of the series' four central characters, only Kramer has no visible means of support; what few jobs he holds seem to be nothing more than larks.\n\nblock scripts\n\tscript(src=\"index.js\")\n\nblock styles\n\tlink(rel=\"stylesheet\" href=\"index.css\")\n"},{"name":"index.js","code":"\n/**\n * Module dependencies.\n */\n\nvar displaySource = require('../../lib/display-source');\nvar Accordion = require('./accordion');\nvar query = require('component/query');\n\n/**\n * Create an Accordion using the selector provided.\n */\n\nvar el = query('#myAccordion');\n\nnew Accordion(el, {\n  pair: '.panel',\n  tab: '.panel-heading',\n  panel: '.panel-body',\n  suppressMain: true\n});\n\n/**\n * Display the source files.\n */\n\ndisplaySource(require('./source'));\n"},{"name":"index.styl","code":"\n@require '../global'\n\n.hidden\n  display none"},{"name":"pair.js","code":"\n/**\n * Module dependencies.\n */\n\nvar suppressMain = require('../../lib/suppress-main');\nvar Emitter = require('component/emitter');\nvar events = require('component/events');\nvar Panel = require('./panel');\nvar Tab = require('./tab');\n\nvar expandedState = 'expanded';\nvar collapsedState = 'collapsed';\n\n/**\n * Expose `Pair`.\n */\n\nmodule.exports = Pair;\n\n/**\n * Creates a new `Pair`.\n *\n * @param {HTMLElement} el\n * @param {Object} config\n * @param {Number} i\n * @api public\n */\n\nfunction Pair(el, config, i) {\n  var self = this;\n  this.config = config;\n\n  this.el = el;\n  this.el.setAttribute('role', 'presentation');\n\n  this.i = i;\n  this.tab = new Tab(config.tab, el);\n  this.panel = new Panel(config.panel, el)\n    .on('focus-tab', function () {\n      self.emit('select', { val: self.i });\n    });\n\n  this.panel.el.setAttribute('aria-labelledby', this.tab.el.id);\n\n  this.events = events(el, this);\n  this.events.bind('click ' + config.tab);\n  this.events.bind('keydown ' + config.tab);\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Pair.prototype);\n\n/**\n * Handle clicks on the Pair's Tab.\n *\n * @param {ClickEvent} e\n * @return {Pair}\n * @api private\n */\n\nPair.prototype.onclick = function (e) {\n  this.toggle();\n  return this;\n};\n\n/**\n * Handle keydown on the Pair's Tab.\n *\n * @param {ClickEvent} e\n * @return {Pair}\n * @api private\n */\n\nPair.prototype.onkeydown = function (e) {\n  var key = e.which || e.keycode;\n\n  switch (key) {\n    case 37: // Left\n    case 38: // Up\n      e.preventDefault();\n      this.emit('select', { val: 'prev' });\n      break;\n    case 39: // Right\n    case 40: // Down\n      e.preventDefault();\n      this.emit('select', { val: 'next' });\n      break;\n    case 13: // Enter\n    case 32: // Space\n      e.preventDefault();\n      this.toggle();\n      break;\n    case 35: // End\n      e.preventDefault();\n      this.emit('select', { val: 'last' });\n      break;\n    case 36: // Home\n      e.preventDefault();\n      this.emit('select', { val: 'first' });\n      break;\n    case 9: // Tab\n      if (!e.shiftKey && !this.panel._isHidden) {\n        e.preventDefault();\n\n        if (this.config.suppressMain) {\n          suppressMain(function () {\n            this.panel.focusTemp();\n          }, 100);\n        }\n        else {\n          this.panel.focusTemp();\n        }\n      }\n      break;\n  }\n  return this;\n};\n\n/**\n * Toggle the state of the Pair.\n *\n * @return {Pair}\n * @api private\n */\n\nPair.prototype.toggle = function () {\n  if (this.state == collapsedState) {\n    this.expand();\n  }\n  else if (this.state == expandedState) {\n    this.collapse();\n  }\n  return this;\n};\n\n/**\n * Expand this Pair.\n *\n * @return {Pair}\n * @api public\n */\n\nPair.prototype.expand = function () {\n  this.tab.expand();\n  this.panel.show();\n  this.state = expandedState;\n  return this;\n};\n\n\n/**\n * Collapse this Pair.\n *\n * @return {Pair}\n * @api public\n */\n\nPair.prototype.collapse = function () {\n  this.tab.collapse();\n  this.panel.hide();\n  this.state = collapsedState;\n  return this;\n};\n\nPair.prototype.deselect = function () {\n  this.tab.el.setAttribute('tabindex', '-1');\n  this.tab.el.setAttribute('aria-selected', 'false');\n};\n\nPair.prototype.select = function () {\n  this.tab.el.setAttribute('tabindex', '0');\n  this.tab.el.setAttribute('aria-selected', 'true');\n  this.tab.el.focus();\n};\n"},{"name":"panel.js","code":"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('component/emitter');\nvar classes = require('component/classes');\nvar events = require('component/events');\nvar query = require('component/query');\n\n/**\n * Expose `Panel`.\n */\n\nmodule.exports = Panel;\n\n/**\n * Creates a new `Panel`.\n *\n * @param {String} selector\n * @param {HTMLElement} el - Pair#el\n * @api public\n */\n\nfunction Panel(selector, el) {\n  this.el = query(selector, el);\n  this.el.setAttribute('role', 'tabpanel');\n  this.el.setAttribute('aria-hidden', 'true');\n\n  this.events = events(el, this);\n  this.events.bind('keydown');\n  this.events.bind('blur');\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Panel.prototype);\n\n/**\n * Show this Panel.\n *\n * @return {Panel}\n * @api public\n */\n\nPanel.prototype.show = function () {\n  classes(this.el).remove('hidden');\n  this.el.setAttribute('aria-hidden', 'false');\n  this._isHidden = false;\n  return this;\n};\n\n\n/**\n * Hide this Panel.\n *\n * @return {Panel}\n * @api public\n */\n\nPanel.prototype.hide = function () {\n  classes(this.el).add('hidden');\n  this.el.setAttribute('aria-hidden', 'true');\n  this._isHidden = true;\n  return this;\n};\n\n/**\n * Handles keydown events on the Panel.\n *\n * @param {KeyEvent} e\n * @return {Panel}\n * @api private\n */\n\nPanel.prototype.onkeydown = function (e) {\n  var key = e.which || e.keyCode;\n  // Ctrl + HOME\n  if (key == 36 && e.ctrlKey) {\n    e.preventDefault();\n    this.emit('focus-tab');\n  }\n  return this;\n};\n\nPanel.prototype.focusTemp = function () {\n  this.el.setAttribute('tabindex', '-1');\n  this.el.focus();\n};\n\nPanel.prototype.onblur = function (e) {\n  this.el.removeAttribute('tabindex');\n};\n"},{"name":"tab.js","code":"\n/**\n * Module dependencies.\n */\n\nvar rndid = require('stephenmathieson/rndid');\nvar Emitter = require('component/emitter');\nvar query = require('component/query');\n\n/**\n * Expose `Tab`.\n */\n\nmodule.exports = Tab;\n\n/**\n * Creates a new `Tab`.\n *\n * @param {String} selector\n * @param {HTMLElement} el - Pair#el\n * @api public\n */\n\nfunction Tab(selector, el) {\n  this.el = query(selector, el);\n  this.el.setAttribute('role', 'tab');\n  this.el.setAttribute('aria-selected', 'false');\n  this.el.setAttribute('aria-expanded', 'false');\n  this.el.id = this.el.id || rndid();\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Tab.prototype);\n\n/**\n * Update the Tab's attributes to reflect the fact\n * that its corresponding Panel is expanded.\n *\n * @return {Tab}\n * @api public\n */\n\nTab.prototype.expand = function () {\n  this.el.setAttribute('aria-expanded', 'true');\n  return this;\n};\n\n\n/**\n * Update the Tab's attributes to reflect the fact\n * that its corresponding Panel is collapsed.\n *\n * @return {Tab}\n * @api public\n */\n\nTab.prototype.collapse = function () {\n  this.el.setAttribute('aria-expanded', 'false');\n  return this;\n};\n"}];
}, {}]}, {}, {"1":""})