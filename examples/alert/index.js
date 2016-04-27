
/**
 * Module dependencies.
 */

var query = require('component/query');
var Alert = require('./alert');

var selectors = {
  form: 'form',
  input: 'input[type=text]',
  submit: 'button',
  alert: '.alert'
};

var form = query(selectors.form);
var input = query(selectors.input, form);
var submit = query(selectors.submit, form);
var alert = new Alert(query(selectors.alert));

form.addEventListener('submit', function (e) {
  e.preventDefault();
  alert.hide();

  if (!input.value.length) {
    alert
      .text('At least make an effort!')
      .type('danger');
  }
  else if (input.value != '42') {
    alert
      .text('Sorry. "<span class="bold">' + input.value + '</span>" is not the Answer to The Ultimate Question of Life, the Universe, and Everything')
      .type('danger');
  }
  else {
    alert
      .text('Congratulations! "<span class="bold">42</span>" is the Answer to The Ultimate Question of Life, the Universe, and Everything')
      .type('success');
  }

  input.select();
  alert.show();
});

/**
 * Display the source files.
 */

require('../../lib/display-source')(require('./source'));
