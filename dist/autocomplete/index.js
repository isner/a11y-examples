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

var displaySource = require('../../lib/display-source');
var AutoComplete = require('./autocomplete');

var inputEl = document.getElementById('character-input');

var autoComplete = new AutoComplete(inputEl)
  .options([
    'Ruthie Cohen',
    'Newman',
    'Frank Costanza',
    'Estelle Costanza',
    'Susan Ross',
    'Morty Seinfeld',
    'Helen Seinfeld',
    'Jacopo "J" Peterman',
    'George Steinbrenner',
    'Uncle Leo',
    'Matt Wilhelm',
    'David Puddy',
    'Mr. Lippman'
    // TODO add more
  ])
  .render();

displaySource(require('./source'));

}, {"../../lib/display-source":2,"./autocomplete":3,"./source":4}],
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

  sourceArr.forEach((file) => {
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

}, {"component/query":5}],
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
3: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var rndid = require('stephenmathieson/rndid');
var Emitter = require('component/emitter');
var classes = require('component/classes');
var events = require('component/events');
var data = require('code42day/dataset');
var query = require('component/query');

/**
 * Define constants.
 */

var INPUT_SELECTOR = 'input[type="text"]';

/**
 * Expose `AutoComplete`.
 */

module.exports = AutoComplete;

/**
 * Creates a new `AutoComplete`.
 *
 * @param {HTMLElement} el - a type="text" input, or parent thereof
 */

function AutoComplete(el) {
  if (!el) {
    throw new Error('"el" required');
  }
  else if (el.nodeType != 1) {
    throw new Error('"el" must be an element');
  }

  var input = query(INPUT_SELECTOR, el.parentNode);
  if (!input) {
    throw new Error('"el" must contain an ' + INPUT_SELECTOR);
  }

  var self = this;
  this._combobox = new Combobox(input)
    .on('focus', function () {
      // self._list.show();
    })
    .on('blur', function () {
      self._list.hide();
    })
    .on('keypress', function (newVal) {
      if (newVal.length) {
        self.update(newVal);
      }
    })
    .on('select', function (dir) {
      self.clearSelection();
      var i;

      switch (dir) {
        case 'prev':
          var prev = self._list._selectedIndex - 1;
          i = prev < 0
            ? self._list._items.length - 1
            : prev;
          break;
        case 'next':
          var next = self._list._selectIndex + 1;
          i = next > self._list._items.length - 1
            ? 0
            : next;
          break;
      }
      self._list._items[i].select();
    });
}

/**
 * Mixin `Emitter`.
 */

Emitter(AutoComplete.prototype);

/**
 * Gets, or sets, the `#options` for this `AutoComplete` widget.
 *
 * @param  {Array} options
 * @return {AutoComplete}
 */

AutoComplete.prototype.options = function (options) {
  if (arguments.length > 0 && options.length) {
    this._list = new List(options);
    return this;
  }
  return this._items;
};

/**
 * Renders the `AutoComplete` widget.
 *
 * @return {AutoComplete}
 */

AutoComplete.prototype.render = function () {
  var autocomplete = this;;
  this._list.render().hide();
  this._list._items.forEach(function (item) {
    item.appendTo(autocomplete._list.listbox);
  });

  var parent = this._combobox.el.parentNode;
  var listEl = this._list.el;
  var target = this._combobox.el.nextSibling;
  parent.insertBefore(listEl, target);

  return this;
};

/**
 * Updates the suggestions based on the new input `val`.
 *
 * @param  {String} val
 * @return {AutoComplete}
 */

AutoComplete.prototype.update = function (val) {
  var list = this._list;
  var items = this._list._items;
  var matches = [];

  items.forEach(function (item) {
    var itemName = item._name.toLowerCase();
    var prefix = itemName.substr(0, val.length);

    var isPrefixMatch = prefix == val.toLowerCase();
    var isSubstrMatch = ~itemName.indexOf(val.toLowerCase());

    if (isPrefixMatch || isSubstrMatch) {
      matches.push(item);
      item.show();
    }
    else {
      item.hide();
    }
  });

  this.clearSelection();

  if (matches.length) {
    this.getItem(matches[0]).select();
    list.show();
  }
  else {
    list.hide();
  }

  return this;
};

AutoComplete.prototype.clearSelection = function () {
  this._list._items.forEach(function (item) {
    item.deselect();
  });
};

AutoComplete.prototype.getItem = function (name) {
  var i = this._list._items.indexOf(name);
  return this._list._items[i];
};

/**
 * Creates a new `Combobox`.
 *
 * @param {HTMLElement} el - a type="text" input
 */

function Combobox(el) {
  this.el = el;
  this.el.setAttribute('role', 'combobox');
  this.el.setAttribute('autocomplete', 'off');

  this.events = events(this.el, this);
  this.events.bind('keyup');
  this.events.bind('focus');
  this.events.bind('blur');
}

/**
 * Mixin `Emitter`.
 */

Emitter(Combobox.prototype);

/**
 * Handles 'keyup' events on the `Combobox#el`.
 *
 * @param  {Event} e
 * @return {Combobox}
 */

Combobox.prototype.onkeyup = function (e) {
  var key = e.which || e.keyCode;

  switch (key) {
    case 38: // Up arrow
      this.emit('select', 'prev');
      break;
    case 40: // Down arrow
      this.emit('select', 'next');
      break;
    case 9:  // Tab
    case 16: // Shift
    case 13: // Enter
      console.log('Tab, Enter, Shift');
      break;
    default:
      this.emit('keypress', this.el.value);
  }

  return this;
};

Combobox.prototype.onfocus = function () {
  this.emit('focus');
};

Combobox.prototype.onblur = function () {
  this.emit('blur');
};

/**
 * Creates a `List`.
 *
 * @param {Array} options
 */

function List(options) {
  var items = this._items = [];

  options.forEach(function (name) {
    var item = new Item(name);
    items.push(item);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(List.prototype);

List.prototype.render = function () {
  this.el = document.createElement('div');
  classes(this.el).add('listbox-container');

  this.listbox = document.createElement('ul');
  this.listbox.setAttribute('role', 'listbox');
  this.el.appendChild(this.listbox);

  return this;
};

/**
 * Appends this List's `#el` to a given `target` element.
 *
 * @param  {HTEMLElement} target
 * @return {List}
 */

List.prototype.appendTo = function (target) {
  target.appendChild(this.el);
  return this;
};

List.prototype.show = function () {
  classes(this.el).remove('hidden');
  this.el.removeAttribute('aria-hidden');
};

List.prototype.hide = function () {
  classes(this.el).add('hidden');
  this.el.setAttribute('aria-hidden', 'true');
};

/**
 * Creates a new `Item`.
 *
 * @param {String} name
 */

function Item(name) {
  this._name = name;
  this.el = document.createElement('li');
  this.el.setAttribute('role', 'option');
  this.el.innerHTML = name;
  data(this.el, 'name', name);
}

/**
 * Mixin `Emitter`.
 */

Emitter(Item.prototype);

/**
 * Appends this Item's `#el` to a given `target` element.
 *
 * @param  {HTMLElement} target
 * @return {Item}
 */

Item.prototype.appendTo = function (target) {
  target.appendChild(this.el);
  return this;
};

Item.prototype.show = function () {
  classes(this.el).remove('hidden');
  this.el.removeAttribute('aria-hidden');
};

Item.prototype.hide = function () {
  classes(this.el).add('hidden');
  this.el.setAttribute('aria-hidden', 'true');
};

Item.prototype.select = function () {
  this.el.setAttribute('aria-selected', 'true');
  classes(this.el).add('selected');
  this.emit('selected');
};

Item.prototype.deselect = function () {
  this.el.removeAttribute('aria-selected');
  classes(this.el).remove('selected');
};

}, {"stephenmathieson/rndid":6,"component/emitter":7,"component/classes":8,"component/events":9,"code42day/dataset":10,"component/query":5}],
6: [function(require, module, exports) {

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
7: [function(require, module, exports) {

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
8: [function(require, module, exports) {
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

}, {"indexof":11,"component-indexof":11}],
11: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
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

}, {"event":12,"component-event":12,"delegate":13,"component-delegate":13}],
12: [function(require, module, exports) {
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
13: [function(require, module, exports) {
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

}, {"closest":14,"component-closest":14,"event":12,"component-event":12}],
14: [function(require, module, exports) {
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

}, {"matches-selector":15,"component-matches-selector":15}],
15: [function(require, module, exports) {
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

}, {"query":5,"component-query":5}],
10: [function(require, module, exports) {
module.exports=dataset;

/*global document*/


// replace namesLikeThis with names-like-this
function toDashed(name) {
  return name.replace(/([A-Z])/g, function(u) {
    return "-" + u.toLowerCase();
  });
}

var fn;

if (typeof document !== "undefined" && document.head && document.head.dataset) {
  fn = {
    set: function(node, attr, value) {
      node.dataset[attr] = value;
    },
    get: function(node, attr) {
      return node.dataset[attr];
    },
    del: function (node, attr) {
      delete node.dataset[attr];
    }
  };
} else {
  fn = {
    set: function(node, attr, value) {
      node.setAttribute('data-' + toDashed(attr), value);
    },
    get: function(node, attr) {
      return node.getAttribute('data-' + toDashed(attr));
    },
    del: function (node, attr) {
      node.removeAttribute('data-' + toDashed(attr));
    }
  };
}

function dataset(node, attr, value) {
  var self = {
    set: set,
    get: get,
    del: del
  };

  function set(attr, value) {
    fn.set(node, attr, value);
    return self;
  }

  function del(attr) {
    fn.del(node, attr);
    return self;
  }

  function get(attr) {
    return fn.get(node, attr);
  }

  if (arguments.length === 3) {
    return set(attr, value);
  }
  if (arguments.length == 2) {
    return get(attr);
  }

  return self;
}

}, {}],
4: [function(require, module, exports) {
module.exports = [{"name":"autocomplete.js","code":"\n/**\n * Module dependencies.\n */\n\nvar rndid = require('stephenmathieson/rndid');\nvar Emitter = require('component/emitter');\nvar classes = require('component/classes');\nvar events = require('component/events');\nvar data = require('code42day/dataset');\nvar query = require('component/query');\n\n/**\n * Define constants.\n */\n\nvar INPUT_SELECTOR = 'input[type=\"text\"]';\n\n/**\n * Expose `AutoComplete`.\n */\n\nmodule.exports = AutoComplete;\n\n/**\n * Creates a new `AutoComplete`.\n *\n * @param {HTMLElement} el - a type=\"text\" input, or parent thereof\n */\n\nfunction AutoComplete(el) {\n  if (!el) {\n    throw new Error('\"el\" required');\n  }\n  else if (el.nodeType != 1) {\n    throw new Error('\"el\" must be an element');\n  }\n\n  var input = query(INPUT_SELECTOR, el.parentNode);\n  if (!input) {\n    throw new Error('\"el\" must contain an ' + INPUT_SELECTOR);\n  }\n\n  var self = this;\n  this._combobox = new Combobox(input)\n    .on('focus', function () {\n      // self._list.show();\n    })\n    .on('blur', function () {\n      self._list.hide();\n    })\n    .on('keypress', function (newVal) {\n      if (newVal.length) {\n        self.update(newVal);\n      }\n    })\n    .on('select', function (dir) {\n      self.clearSelection();\n      var i;\n\n      switch (dir) {\n        case 'prev':\n          var prev = self._list._selectedIndex - 1;\n          i = prev < 0\n            ? self._list._items.length - 1\n            : prev;\n          break;\n        case 'next':\n          var next = self._list._selectIndex + 1;\n          i = next > self._list._items.length - 1\n            ? 0\n            : next;\n          break;\n      }\n      self._list._items[i].select();\n    });\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(AutoComplete.prototype);\n\n/**\n * Gets, or sets, the `#options` for this `AutoComplete` widget.\n *\n * @param  {Array} options\n * @return {AutoComplete}\n */\n\nAutoComplete.prototype.options = function (options) {\n  if (arguments.length > 0 && options.length) {\n    this._list = new List(options);\n    return this;\n  }\n  return this._items;\n};\n\n/**\n * Renders the `AutoComplete` widget.\n *\n * @return {AutoComplete}\n */\n\nAutoComplete.prototype.render = function () {\n  var autocomplete = this;;\n  this._list.render().hide();\n  this._list._items.forEach(function (item) {\n    item.appendTo(autocomplete._list.listbox);\n  });\n\n  var parent = this._combobox.el.parentNode;\n  var listEl = this._list.el;\n  var target = this._combobox.el.nextSibling;\n  parent.insertBefore(listEl, target);\n\n  return this;\n};\n\n/**\n * Updates the suggestions based on the new input `val`.\n *\n * @param  {String} val\n * @return {AutoComplete}\n */\n\nAutoComplete.prototype.update = function (val) {\n  var list = this._list;\n  var items = this._list._items;\n  var matches = [];\n\n  items.forEach(function (item) {\n    var itemName = item._name.toLowerCase();\n    var prefix = itemName.substr(0, val.length);\n\n    var isPrefixMatch = prefix == val.toLowerCase();\n    var isSubstrMatch = ~itemName.indexOf(val.toLowerCase());\n\n    if (isPrefixMatch || isSubstrMatch) {\n      matches.push(item);\n      item.show();\n    }\n    else {\n      item.hide();\n    }\n  });\n\n  this.clearSelection();\n\n  if (matches.length) {\n    this.getItem(matches[0]).select();\n    list.show();\n  }\n  else {\n    list.hide();\n  }\n\n  return this;\n};\n\nAutoComplete.prototype.clearSelection = function () {\n  this._list._items.forEach(function (item) {\n    item.deselect();\n  });\n};\n\nAutoComplete.prototype.getItem = function (name) {\n  var i = this._list._items.indexOf(name);\n  return this._list._items[i];\n};\n\n/**\n * Creates a new `Combobox`.\n *\n * @param {HTMLElement} el - a type=\"text\" input\n */\n\nfunction Combobox(el) {\n  this.el = el;\n  this.el.setAttribute('role', 'combobox');\n  this.el.setAttribute('autocomplete', 'off');\n\n  this.events = events(this.el, this);\n  this.events.bind('keyup');\n  this.events.bind('focus');\n  this.events.bind('blur');\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Combobox.prototype);\n\n/**\n * Handles 'keyup' events on the `Combobox#el`.\n *\n * @param  {Event} e\n * @return {Combobox}\n */\n\nCombobox.prototype.onkeyup = function (e) {\n  var key = e.which || e.keyCode;\n\n  switch (key) {\n    case 38: // Up arrow\n      this.emit('select', 'prev');\n      break;\n    case 40: // Down arrow\n      this.emit('select', 'next');\n      break;\n    case 9:  // Tab\n    case 16: // Shift\n    case 13: // Enter\n      console.log('Tab, Enter, Shift');\n      break;\n    default:\n      this.emit('keypress', this.el.value);\n  }\n\n  return this;\n};\n\nCombobox.prototype.onfocus = function () {\n  this.emit('focus');\n};\n\nCombobox.prototype.onblur = function () {\n  this.emit('blur');\n};\n\n/**\n * Creates a `List`.\n *\n * @param {Array} options\n */\n\nfunction List(options) {\n  var items = this._items = [];\n\n  options.forEach(function (name) {\n    var item = new Item(name);\n    items.push(item);\n  });\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(List.prototype);\n\nList.prototype.render = function () {\n  this.el = document.createElement('div');\n  classes(this.el).add('listbox-container');\n\n  this.listbox = document.createElement('ul');\n  this.listbox.setAttribute('role', 'listbox');\n  this.el.appendChild(this.listbox);\n\n  return this;\n};\n\n/**\n * Appends this List's `#el` to a given `target` element.\n *\n * @param  {HTEMLElement} target\n * @return {List}\n */\n\nList.prototype.appendTo = function (target) {\n  target.appendChild(this.el);\n  return this;\n};\n\nList.prototype.show = function () {\n  classes(this.el).remove('hidden');\n  this.el.removeAttribute('aria-hidden');\n};\n\nList.prototype.hide = function () {\n  classes(this.el).add('hidden');\n  this.el.setAttribute('aria-hidden', 'true');\n};\n\n/**\n * Creates a new `Item`.\n *\n * @param {String} name\n */\n\nfunction Item(name) {\n  this._name = name;\n  this.el = document.createElement('li');\n  this.el.setAttribute('role', 'option');\n  this.el.innerHTML = name;\n  data(this.el, 'name', name);\n}\n\n/**\n * Mixin `Emitter`.\n */\n\nEmitter(Item.prototype);\n\n/**\n * Appends this Item's `#el` to a given `target` element.\n *\n * @param  {HTMLElement} target\n * @return {Item}\n */\n\nItem.prototype.appendTo = function (target) {\n  target.appendChild(this.el);\n  return this;\n};\n\nItem.prototype.show = function () {\n  classes(this.el).remove('hidden');\n  this.el.removeAttribute('aria-hidden');\n};\n\nItem.prototype.hide = function () {\n  classes(this.el).add('hidden');\n  this.el.setAttribute('aria-hidden', 'true');\n};\n\nItem.prototype.select = function () {\n  this.el.setAttribute('aria-selected', 'true');\n  classes(this.el).add('selected');\n  this.emit('selected');\n};\n\nItem.prototype.deselect = function () {\n  this.el.removeAttribute('aria-selected');\n  classes(this.el).remove('selected');\n};\n"},{"name":"index.jade","code":"\nextends ../layout\n\nblock vars\n  - var heading = 'Auto Complete'\n\nblock content\n  .panel.panel-default\n    .panel-heading\n      h2 Example: Auto Complete\n    \n    .panel-body\n      p TODO\n      //- a(href=\"#before\") Before\n      \n      //- form\n        //- label(for=\"character-input\") Favorite Seinfeld Character\n        //- .input-group\n          //- input#character-input(type=\"text\")\n    \n      //- a(href=\"#after\") After\n\nblock scripts\n  //- script(src=\"index.js\")\n\nblock styles\n  link(rel=\"stylesheet\" href=\"index.css\")\n"},{"name":"index.js","code":"\nvar displaySource = require('../../lib/display-source');\nvar AutoComplete = require('./autocomplete');\n\nvar inputEl = document.getElementById('character-input');\n\nvar autoComplete = new AutoComplete(inputEl)\n  .options([\n    'Ruthie Cohen',\n    'Newman',\n    'Frank Costanza',\n    'Estelle Costanza',\n    'Susan Ross',\n    'Morty Seinfeld',\n    'Helen Seinfeld',\n    'Jacopo \"J\" Peterman',\n    'George Steinbrenner',\n    'Uncle Leo',\n    'Matt Wilhelm',\n    'David Puddy',\n    'Mr. Lippman'\n    // TODO add more\n  ])\n  .render();\n\ndisplaySource(require('./source'));\n"},{"name":"index.styl","code":"\n@require '../global'\n\n.hidden\n  display none\n\n.bold\n  font-weight 600\n\n.block\n  display block\n\n#character-input\n  width 300px\n  padding 0.3em 0.5em\n\n.listbox-container\n  position relative\n\n  ul\n    position absolute\n    width 100%\n    background-color #fff\n    padding .5em\n    border 1px solid #ccc\n\n    li\n      padding .2em .5em\n      &.selected\n        background-color #eee\n"}];
}, {}]}, {}, {"1":""})