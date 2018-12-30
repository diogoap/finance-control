'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
	name: String,
	initialBalance: { type: Number, default: 0 },
	order: { type: Number, default: 0 },
	enabled: { type: Boolean, default: true },	
	user_id: String,
	currency_id: String,
	_currency: Object	
});

module.exports = mongoose.model('Account', accountSchema);
