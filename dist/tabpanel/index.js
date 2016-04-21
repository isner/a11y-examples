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

var query = require('component/query');
var Tabpanel = require('./tabpanel');

var selector = '#tabpanel-widget';

/**
 * Create a Tabpanel using the selector provided.
 */

var el = document.querySelector(selector);

var tp = new Tabpanel(el, {

  /**
   * A css selector that will find a single tablist
   * in the context of `el`.
   *
   * @type {String}
   */

  tablistSelector: 'ul.nav.nav-tabs',

  /**
   * A css selector that will find all tabs in the
   * context of  the tablist element.
   *
   * @type {String}
   */

  tabSelector: 'li > a',

  /**
   * A function which, when given a tab's element
   * reference, will find and return an element
   * reference for that tab's corresponding panel.
   *
   * @param {HTMLElement} tab
   * @return {HTMLElement}
   * @api private
   */

  panelGetter: function (tab) {
    var id = tab.getAttribute('data-panel');
    return query('#' + id);
  },

  /**
   * [optional]
   * A class that can be applied to panels in order
   * to hide them. If unsupplied, will default to
   * setting inline styles.
   *
   * @type {String}
   */

  hiddenClass: 'hidden',

  /**
   * [optional]
   * The index of the tab that should be selected
   * by default.
   *
   * @type {Number}
   */

  defaultIndex: 2,

  /**
   * [optional]
   * Called each time a tab is selected.
   *
   * @param {Tab} tab
   * @api private
   */

  selectFun: function (tab) {
    console.log('"%s" tab selected', tab.el.innerText);
  },

  /**
   * [optional]
   * Temporarily suppress any parent's "main" role when Tabbing
   * from the selected Tab to the Tabpanel.
   *
   * NOTE: This option is designed specifically to sidestep a VO/OSX bug.
   *
   * @type {Boolean}
   */

  suppressMain: true

});

console.log(tp);

}, {"component/query":2,"./tabpanel":3}],
2: [function(require, module, exports) {
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
var Tablist = require('./tablist');

/**
 * Expose `Tabpanel`.
 */

module.exports = Tabpanel;

/**
 * Creates a new instance of `Tabpanel`.
 *
 * @param {HTMLElement} el
 * @param {Object} options
 * @api public
 */

function Tabpanel(el, options) {
  this.el = el;
  this.tablist = new Tablist(options, el);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tabpanel.prototype);

}, {"component/Emitter":4,"./tablist":5}],
4: [function(require, module, exports) {

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
5: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('component/emitter');
var query = require('component/query');
var Tab = require('./tab');

/**
 * Expose `Tablist`.
 */

module.exports = Tablist;

/**
 * Create a new `Tablist`.
 *
 * @param {Object} options
 * @param {HTMLElement} el
 * @api public
 */

function Tablist(options, el) {
  var self = this;
  this.el = query(options.tablistSelector, el);
  this.defaultIndex = options.defaultIndex;
  this.el.setAttribute('role', 'tablist');

  // Create Tabs for this Tablist.

  this.tabs = [];
  var tabs = query.all(options.tabSelector, this.el);
  [].slice.call(tabs).forEach(function (el) {
    var tab = new Tab(el, options);
    self.tabs.push(tab);

    var parent = tab.el.parentNode;
    while (parent != this.el) {
      tab.el.parentNode.setAttribute('role', 'presentation');
      parent = parent.parentNode;
    }
  });

  this.init();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Tablist.prototype);

/**
 * Define the default selected Tab,
 * and bind listener to affect Tablist when a Tab
 * is selected.
 *
 * @return {Tablist}
 * @api public
 */

Tablist.prototype.init = function () {
  var self = this;
  this.selectedIndex = this.defaultIndex;

  this.tabs.forEach(function (tab, i) {
    if (i == self.selectedIndex) {
      tab.select();
    }
    else {
      tab.deselect();
    }

    tab
    .on('clicked', function (selectedTab) {
      self.tabs.forEach(function (tab, i) {
        if (tab == selectedTab) {
          self.selectedIndex = i;
          tab.select();
          self.deselectAllExcept(tab);
          tab.el.focus();
        }
      });
    })
    .on('navigated', function (dir) {
      switch (dir) {
        case 'prev':
          self.selectedIndex = self.selectedIndex === 0
            ? self.tabs.length - 1
            : self.selectedIndex - 1;
          break;
        case 'next':
          self.selectedIndex = self.selectedIndex === self.tabs.length - 1
            ? 0
            : self.selectedIndex + 1;
          break;
      }
      var tab = self.tabs[self.selectedIndex];
      tab.select();
      self.deselectAllExcept(tab);
      tab.el.focus();
    });

  });

  return this;
};

/**
 * Deselect all Tabs in the Tablist except a given Tab.
 *
 * @param {Tab} exceptTab
 * @return {Tablist}
 * @api private
 */

Tablist.prototype.deselectAllExcept = function (exceptTab) {
  this.tabs.forEach(function (tab) {
    if (tab != exceptTab) {
      tab.deselect();
    }
  });
  return this;
};

}, {"component/emitter":6,"component/query":2,"./tab":7}],
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

}, {"stephenmathieson/rndid":8,"component/emitter":6,"component/events":9,"component/query":2,"./panel":10}],
8: [function(require, module, exports) {

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
9: [function(require, module, exports) {

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

}, {"event":11,"component-event":11,"delegate":12,"component-delegate":12}],
11: [function(require, module, exports) {
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
12: [function(require, module, exports) {
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

}, {"closest":13,"component-closest":13,"event":11,"component-event":11}],
13: [function(require, module, exports) {
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

}, {"matches-selector":14,"component-matches-selector":14}],
14: [function(require, module, exports) {
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

}, {"query":2,"component-query":2}],
10: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
var classes = require('component/classes');
var events = require('component/events');

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

  this.events = events(el, this);
  this.events.bind('blur');
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

Panel.prototype.focusTemp = function () {
  this.el.setAttribute('tabindex', '-1');
  this.el.focus();
};

Panel.prototype.onblur = function (e) {
  this.el.removeAttribute('tabindex');
};

}, {"stephenmathieson/rndid":8,"component/classes":15,"component/events":9}],
15: [function(require, module, exports) {
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

}, {"indexof":16,"component-indexof":16}],
16: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}]}, {}, {"1":""})
