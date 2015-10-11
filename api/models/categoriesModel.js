'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
 	name: String,
	type: String,
    user_id: String
});

module.exports = mongoose.model('Category', categorySchema);
