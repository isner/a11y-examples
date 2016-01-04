
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
