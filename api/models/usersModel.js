'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	emailAuthorized: String,
	creationDate: { type: Date, default: Date.Now },
	externalId: String,
	externalName: String,
	externalPhoto: String,
	userEnabled: { type: Boolean, default: true },
	accessTokens: [ {
		token: String,
		creationDate: { type: Date, default: Date.Now }
	} ]
});

module.exports = mongoose.model('User', userSchema);
