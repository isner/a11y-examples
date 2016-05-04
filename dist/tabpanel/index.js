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
var query = require('component/query');
var Tabpanel = require('./tabpanel');

/**
 * Create a Tabpanel on `el`.
 */

var el = query('#tabpanel-widget');

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

/**
 * Display the source files.
 */

displaySource(require('./source'));

}, {"../../lib/display-source":2,"component/query":3,"./tabpanel":4,"./source":5}],
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

}, {"component/query":3}],
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
4: [function(require, module, exports) {

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

}, {"component/Emitter":6,"./tablist":7}],
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

}, {"component/emitter":8,"component/query":3,"./tab":9}],
8: [function(require, module, exports) {

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
9: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var suppressMain = require('../../lib/suppress-main');
var rndid = require('stephenmathieson/rndid');
var Emitter = require('component/emitter');
var events = require('component/events');
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

}, {"../../lib/suppress-main":10,"stephenmathieson/rndid":11,"component/emitter":8,"component/events":12,"./panel":13}],
10: [function(require, module, exports) {

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

}, {"component/query":3}],
11: [function(require, module, exports) {

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
12: [function(require, module, exports) {

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

}, {"event":14,"component-event":14,"delegate":15,"component-delegate":15}],
14: [function(require, module, exports) {
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
15: [function(require, module, exports) {
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

}, {"closest":16,"component-closest":16,"event":14,"component-event":14}],
16: [function(require, module, exports) {
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

}, {"matches-selector":17,"component-matches-selector":17}],
17: [function(require, module, exports) {
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

}, {"query":3,"component-query":3}],
13: [function(require, module, exports) {

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

}, {"stephenmathieson/rndid":11,"component/classes":18,"component/events":12}],
18: [function(require, module, exports) {
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

}, {"indexof":19,"component-indexof":19}],
19: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
5: [function(require, module, exports) {
module.exports = [{"name":"index.jade","code":"\nextends ../layout\n\nblock vars\n  - var heading = 'Tab Panel'\n\nblock content\n  #tabpanel-widget\n    ul.nav.nav-tabs\n      li\n        a#jerry-tab(data-panel=\"jerry-panel\") Jerry\n      li\n        a#elaine-tab(data-panel=\"elaine-panel\") Elaine\n      li\n        a#george-tab(data-panel=\"george-panel\") George\n      li\n        a#kramer-tab(data-panel=\"kramer-panel\") Kramer\n    .panels\n      #jerry-panel.panel.panel-default\n        .panel-body\n          p Source:&nbsp;\n            a(href=\"https://en.wikipedia.org/wiki/Jerry_Seinfeld_(character)\")\n              | Jerry's Wikipedia page\n          p Jerome \"Jerry\" Seinfeld is the protagonist of the American television sitcom Seinfeld (1989&dash;1998). The straight man among his group of friends, this semi-fictionalized version of comedian Jerry Seinfeld was named after, co-created by, based on, and played by Seinfeld himself. The series revolves around Jerry's misadventures with his best friend George Costanza, neighbor Cosmo Kramer, and ex-girlfriend Elaine Benes. He is usually the voice of reason amidst his friends' antics and the focal point of the foursome's relationship.\n      #elaine-panel.panel.panel-default\n        .panel-body\n          p Source:&nbsp;\n            a(href=\"https://en.wikipedia.org/wiki/Elaine_Benes\")\n              | Elaine's Wikipedia page\n          p Elaine Marie Benes is a fictional character on the American television sitcom Seinfeld (1989&dash;1998), played by Julia Louis-Dreyfus. Elaine's best friend is her ex-boyfriend Jerry Seinfeld, and she is also good friends with George Costanza and Cosmo Kramer. Julia Louis-Dreyfus received critical acclaim for her performance as Elaine, winning an Emmy, a Golden Globe and five SAG Awards.\n      #george-panel.panel.panel-default\n        .panel-body\n          p Source:&nbsp;\n            a(href=\"https://en.wikipedia.org/wiki/George_Costanza\")\n              | George's Wikipedia page\n          p George Louis Costanza is a character in the American television sitcom Seinfeld (1989&dash;1998), played by Jason Alexander. He has variously been described as a \"short, stocky, slow-witted, bald man\" (by Elaine Benes and Costanza himself), and \"Lord of the Idiots\" (by Costanza himself). George and Jerry were junior high school friends and remained friends after. He is friends with Jerry Seinfeld, Cosmo Kramer, and Elaine Benes. George appears in every episode except \"The Pen\" (third season).\n      #kramer-panel.panel.panel-default\n        .panel-body\n          p Source:&nbsp;\n            a(href=\"https://en.wikipedia.org/wiki/Cosmo_Kramer\")\n              | Kramer's Wikipedia page\n          p Cosmo Kramer, usually referred to as simply \"Kramer\", is a fictional character on the American television sitcom Seinfeld (1989&dash;1998), played by Michael Richards. The character is loosely based on comedian Kenny Kramer, Larry David's former neighbor across the hall. Kramer is the friend and neighbor of main character Jerry Seinfeld, residing in Apartment 5B, and is friends with George Costanza and Elaine Benes. Of the series' four central characters, only Kramer has no visible means of support; what few jobs he holds seem to be nothing more than larks.\n\nblock scripts\n  script(src=\"index.js\")\n\nblock styles\n  link(rel=\"stylesheet\" href=\"index.css\")\n"},{"name":"index.js","code":"\n/**\n * Module dependencies.\n */\n\nvar displaySource = require('../../lib/display-source');\nvar query = require('component/query');\nvar Tabpanel = require('./tabpanel');\n\n/**\n * Create a Tabpanel on `el`.\n */\n\nvar el = query('#tabpanel-widget');\n\nvar tp = new Tabpanel(el, {\n\n  /**\n   * A css selector that will find a single tablist\n   * in the context of `el`.\n   *\n   * @type {String}\n   */\n\n  tablistSelector: 'ul.nav.nav-tabs',\n\n  /**\n   * A css selector that will find all tabs in the\n   * context of  the tablist element.\n   *\n   * @type {String}\n   */\n\n  tabSelector: 'li > a',\n\n  /**\n   * A function which, when given a tab's element\n   * reference, will find and return an element\n   * reference for that tab's corresponding panel.\n   *\n   * @param {HTMLElement} tab\n   * @return {HTMLElement}\n   * @api private\n   */\n\n  panelGetter: function (tab) {\n    var id = tab.getAttribute('data-panel');\n    return query('#' + id);\n  },\n\n  /**\n   * [optional]\n   * A class that can be applied to panels in order\n   * to hide them. If unsupplied, will default to\n   * setting inline styles.\n   *\n   * @type {String}\n   */\n\n  hiddenClass: 'hidden',\n\n  /**\n   * [optional]\n   * The index of the tab that should be selected\n   * by default.\n   *\n   * @type {Number}\n   */\n\n  defaultIndex: 2,\n\n  /**\n   * [optional]\n   * Called each time a tab is selected.\n   *\n   * @param {Tab} tab\n   * @api private\n   */\n\n  selectFun: function (tab) {\n    console.log('\"%s\" tab selected', tab.el.innerText);\n  },\n\n  /**\n   * [optional]\n   * Temporarily suppress any parent's \"main\" role when Tabbing\n   * from the selected Tab to the Tabpanel.\n   *\n   * NOTE: This option is designed specifically to sidestep a VO/OSX bug.\n   *\n   * @type {Boolean}\n   */\n\n  suppressMain: true\n\n});\n\n/**\n * Display the source files.\n */\n\ndisplaySource(require('./source'));\n"},{"name":"index.styl","code":"\n@require '../global'\n\n.hidden\n  display none\n\n[role=tab][aria-selected=true]\n  border-color #eee #eee #ddd\n  text-decoration none\n  background-color #eee\n"},{"name":"panel.js","code":"\n/**\n * Module dependencies.\n */\n\nvar rndid = require('stephenmathieson/rndid');\nvar classes = require('component/classes');\nvar events = require('component/events');\n\n/**\n * Expose `Panel`.\n */\n\nmodule.exports = Panel;\n\n/**\n * Create a new instance of `Panel`.\n *\n * @param {HTMLElement} el\n * @param {Object} options\n * @api public\n */\n\nfunction Panel(el, options) {\n  this.el = el;\n  this.hiddenClass = options.hiddenClass || null;\n  this.el.setAttribute('role', 'tabpanel');\n  this.el.id = this.el.id || rndid();\n\n  this.events = events(el, this);\n  this.events.bind('blur');\n}\n\n/**\n * Show this Panel.\n * Prefers to use #hiddenClass supplied by options,\n * but default to settings inline style.\n *\n * @return {Panel}\n * @api public\n */\n\nPanel.prototype.hide = function () {\n  if (this.hiddenClass) {\n    classes(this.el).add(this.hiddenClass);\n  }\n  else {\n    this.el.style.display = 'none';\n  }\n  return this;\n};\n\n/**\n * Hide this Panel.\n * Prefers to use #hiddenClass supplied by options,\n * but default to settings inline style.\n *\n * @return {Panel}\n * @api public\n */\n\nPanel.prototype.show = function () {\n  if (this.hiddenClass) {\n    classes(this.el).remove(this.hiddenClass);\n  }\n  else {\n    this.el.style.display = 'block';\n  }\n  return this;\n};\n\nPanel.prototype.focusTemp = function () {\n  this.el.setAttribute('tabindex', '-1');\n  this.el.focus();\n};\n\nPanel.prototype.onblur = function (e) {\n  this.el.removeAttribute('tabindex');\n};\n"},{"name":"tab.js","code":"\n/**\n * Module dependencies.\n */\n\nvar suppressMain = require('../../lib/suppress-main');\nvar rndid = require('stephenmathieson/rndid');\nvar Emitter = require('component/emitter');\nvar events = require('component/events');\nvar Panel = require('./panel');\n\n/**\n * Expose `Tab`.\n */\n\nmodule.exports = Tab;\n\n/**\n * Creates a new Tab.\n *\n * @param {HTMLElement} el\n * @param {Object} options\n * @api public\n */\n\nfunction Tab(el, options) {\n  this.el = el;\n  this.opts = options || {};\n  this.panel = new Panel(options.panelGetter(el), options);\n  this.el.id = this.el.id || rndid();\n\n  this.events = events(el, this);\n  this.events.bind('click');\n  this.events.bind('keydown');\n\n  this.el.setAttribute('aria-controls', this.panel.el.id);\n  this.el.setAttribute('role', 'tab');\n\n  this.panel.el.setAttribute('aria-labelledby', this.el.id);\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Tab.prototype);\n\n/**\n * Handle clicks on the Tab.\n *\n * @param {ClickEvent} e\n * @return {Tab}\n * @api private\n */\n\nTab.prototype.onclick = function (e) {\n  this.emit('clicked', this);\n  return this;\n};\n\n/**\n * Select this Tab.\n * Execute any custom function specified during config.\n *\n * @return {Tab}\n * @api public\n */\n\nTab.prototype.select = function () {\n  this.el.setAttribute('tabindex', '0');\n  this.el.setAttribute('aria-selected', 'true');\n  this.panel.show();\n\n  // Execute any custom function specified during config.\n  var selectFun = this.opts.selectFun;\n  if (selectFun && typeof selectFun == 'function') {\n    selectFun(this);\n  }\n\n  return this;\n};\n\n/**\n * Deselect this Tab.\n *\n * @return {Tab}\n * @api public\n */\n\nTab.prototype.deselect = function () {\n  this.el.setAttribute('tabindex', '-1');\n  this.el.setAttribute('aria-selected', 'false');\n  this.panel.hide();\n  return this;\n};\n\n/**\n * Handles keydown events on a given Tab.\n *\n * @param {KeydownEvent} e\n * @return {Tab}\n * @api private\n */\n\nTab.prototype.onkeydown = function (e) {\n  var key = e.which || e.keyCode;\n  // Left/Up pressed\n  if (~[37,38].indexOf(key)) {\n    e.preventDefault();\n    this.emit('navigated', 'prev');\n  }\n  // Right/Down pressed\n  else if (~[39,40].indexOf(key)) {\n    e.preventDefault();\n    this.emit('navigated', 'next');\n  }\n  // Tab pressed\n  else if (key === 9 && !e.shiftKey) {\n    e.preventDefault();\n    var panel = this.panel;\n\n    if (this.opts.suppressMain) {\n      suppressMain(function () {\n        panel.focusTemp();\n      }, 100);\n    }\n    else {\n      panel.focusTemp();\n    }\n  }\n};\n"},{"name":"tablist.js","code":"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('component/emitter');\nvar query = require('component/query');\nvar Tab = require('./tab');\n\n/**\n * Expose `Tablist`.\n */\n\nmodule.exports = Tablist;\n\n/**\n * Create a new `Tablist`.\n *\n * @param {Object} options\n * @param {HTMLElement} el\n * @api public\n */\n\nfunction Tablist(options, el) {\n  var self = this;\n  this.el = query(options.tablistSelector, el);\n  this.defaultIndex = options.defaultIndex;\n  this.el.setAttribute('role', 'tablist');\n\n  // Create Tabs for this Tablist.\n\n  this.tabs = [];\n  var tabs = query.all(options.tabSelector, this.el);\n  [].slice.call(tabs).forEach(function (el) {\n    var tab = new Tab(el, options);\n    self.tabs.push(tab);\n\n    var parent = tab.el.parentNode;\n    while (parent != this.el) {\n      tab.el.parentNode.setAttribute('role', 'presentation');\n      parent = parent.parentNode;\n    }\n  });\n\n  this.init();\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Tablist.prototype);\n\n/**\n * Define the default selected Tab,\n * and bind listener to affect Tablist when a Tab\n * is selected.\n *\n * @return {Tablist}\n * @api public\n */\n\nTablist.prototype.init = function () {\n  var self = this;\n  this.selectedIndex = this.defaultIndex;\n\n  this.tabs.forEach(function (tab, i) {\n    if (i == self.selectedIndex) {\n      tab.select();\n    }\n    else {\n      tab.deselect();\n    }\n\n    tab\n    .on('clicked', function (selectedTab) {\n      self.tabs.forEach(function (tab, i) {\n        if (tab == selectedTab) {\n          self.selectedIndex = i;\n          tab.select();\n          self.deselectAllExcept(tab);\n          tab.el.focus();\n        }\n      });\n    })\n    .on('navigated', function (dir) {\n      switch (dir) {\n        case 'prev':\n          self.selectedIndex = self.selectedIndex === 0\n            ? self.tabs.length - 1\n            : self.selectedIndex - 1;\n          break;\n        case 'next':\n          self.selectedIndex = self.selectedIndex === self.tabs.length - 1\n            ? 0\n            : self.selectedIndex + 1;\n          break;\n      }\n      var tab = self.tabs[self.selectedIndex];\n      tab.select();\n      self.deselectAllExcept(tab);\n      tab.el.focus();\n    });\n\n  });\n\n  return this;\n};\n\n/**\n * Deselect all Tabs in the Tablist except a given Tab.\n *\n * @param {Tab} exceptTab\n * @return {Tablist}\n * @api private\n */\n\nTablist.prototype.deselectAllExcept = function (exceptTab) {\n  this.tabs.forEach(function (tab) {\n    if (tab != exceptTab) {\n      tab.deselect();\n    }\n  });\n  return this;\n};\n"},{"name":"tabpanel.js","code":"\n/**\n * Module dependencies.\n */\n\nvar Emitter = require('component/Emitter');\nvar Tablist = require('./tablist');\n\n/**\n * Expose `Tabpanel`.\n */\n\nmodule.exports = Tabpanel;\n\n/**\n * Creates a new instance of `Tabpanel`.\n *\n * @param {HTMLElement} el\n * @param {Object} options\n * @api public\n */\n\nfunction Tabpanel(el, options) {\n  this.el = el;\n  this.tablist = new Tablist(options, el);\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Tabpanel.prototype);\n"}];
}, {}]}, {}, {"1":""})