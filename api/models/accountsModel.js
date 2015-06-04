'use strict';

var mongoose = require('mongoose');

module.exports = mongoose.model('Account', {
	name: {type: String, default: ''},
	initialBalance: {type: Number, default: 0},
	actualBalance: {type: Number, default: 0}
});