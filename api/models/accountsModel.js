'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
	name: String,
	initialBalance: { type: Number, default: 0 },
	actualBalance: { type: Number, default: 0 }
});

module.exports = mongoose.model('Account', accountSchema);