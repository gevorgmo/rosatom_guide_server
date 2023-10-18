var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , crypto = require('crypto');

var UserSchema = new Schema({
    fullname: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        index: {unique: true}
    },
    passwordReset :String,
    hashedPassword: String,
    salt: String,
	role:{
        type: Number,
        default: 0
    },
	signecount:{
        type: Number,
        default: 0
    },
	lastlogin: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    created: {type: Date, default: Date.now}
});


// virtual attributes
UserSchema.virtual('password')
	.set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    }).get(function () {
        return this._password
	});


// methods

UserSchema.method('authenticate', function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
});

UserSchema.method('makeSalt', function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
});

UserSchema.method('encryptPassword', function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

mongoose.model('User', UserSchema);