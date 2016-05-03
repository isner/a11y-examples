
/**
 * Module dependencies.
 */

var displaySource = require('../../lib/display-source');
var DialogModal = require('../../lib/dialog-modal/dialog-modal.js');
var query = require('component/query');

/**
 * Define arguments.
 */

var trigger = query('.btn-default');
var content = require('./modal-body.html');
var title = 'Example Alert';

/**
 * Create an alert-dialog using the above arguments.
 */

new DialogModal(trigger, content, title, true);

/**
 * Display the source files.
 */

displaySource(require('./source'));
