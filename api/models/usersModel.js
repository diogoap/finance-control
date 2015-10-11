'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	emailAuthorized: String,
	creationDate: { type: Date, default: Date.Now },
	externalId: String,
	externalName: String,
	externalPhoto: String,
	accessToken: String,
	accessTokenCreationDate: { type: Date, default: Date.Now },
	userEnabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);
