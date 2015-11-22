'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
	name: String,
	initialBalance: { type: Number, default: 0 },
	order: { type: Number, default: 0 },
	user_id: String
});

module.exports = mongoose.model('Account', accountSchema);
