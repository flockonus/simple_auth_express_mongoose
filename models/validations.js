exports.uniqueFieldInsensitive =  function ( modelName, field ){
	return function(val, cb){
		if( val && val.length ){ // if string not empty/null
			// only for new docs
			if( this.isNew ){
				mongoose.models[modelName].where(
					field, new RegExp('^'+val+'$', 'i')
				).count(function(err,n){
					// false when validation fails
					cb( n < 1 )
				})
			} else {
				cb( true )
			}
		} else { // raise error of unique if empty // may be confusing, but is rightful
			cb( false )
		}
	}
}

exports.emailFormat = function( val ){
	// false when validation fails
	return (/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i).test( val )
}

exports.cannotBeEmpty = function( val ){
	console.log('pass val is:', val)
	
	// not all passwords should be set, BUT when string, should be encoded
	if( typeof val === 'string' ){
		if( val.length ){ // when it comes empty, something went wrong!
			return true
		} else {
			return false
		}
	} else {
		return false
	}
}
