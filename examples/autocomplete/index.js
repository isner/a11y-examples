
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

console.log(autoComplete);
