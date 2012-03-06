var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , Validations = require('./validations.js')
  , salt = 'mySaltyString'
  , SHA2 = new (require('jshashes').SHA512)()

function encodePassword( pass ){
	if( typeof pass === 'string' && pass.length < 6 ) return ''
	
	return SHA2.b64_hmac(pass, salt )
}

var UserSchema = new Schema({
    nick        : {type: String, required: true, unique: true, trim: true } 
  , email       : {type: String, required: true, unique: true, trim: true, lowercase: true } 
  , password    : {type: String, set: encodePassword, required: true }
});

UserSchema.statics.classicLogin = function(login, pass, cb) {
	if( login && pass ){
		mongoose.models.User
			.where( 'email', login )
			.where( 'password', encodePassword(pass) )
	  	.findOne( cb )
	} else {
		// just to launch the standard error
		var o = new this({nick: 'VeryUniquejerewelA', password: '', email: login+'aaa'})
		o.save(cb)
	}
}

UserSchema.path('nick').validate( Validations.uniqueFieldInsensitive('User', 'nick' ), 'unique' )

UserSchema.path('email').validate( Validations.uniqueFieldInsensitive('User', 'email' ), 'unique' )
UserSchema.path('email').validate( Validations.emailFormat, 'format' )

UserSchema.path('password').validate( Validations.cannotBeEmpty, 'password' )

UserSchema.plugin( mongoose.availablePlugins.timestamper )

mongoose.model('User', UserSchema)

