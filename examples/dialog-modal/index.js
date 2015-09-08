
/**
 * Module dependencies.
 */

var DialogModal = require('./dialog-modal');
var query = require('component/query');

/**
 * Define arguments.
 */

var trigger = query('#why');
var content = require('./modal-body.html');
var title = 'Why we need your email address';

/**
 * Create a dialog-modal using the above arguments.
 */

var dm =
new DialogModal(trigger, content, title);

console.log(dm);
