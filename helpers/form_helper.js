//app.helpers.displayErrors = require('./helpers/form_helper.js').displayErrors

stripErrors = function(mongooseErr){
	var prop, list = [];
	for( prop in mongooseErr.errors ){
		list.push( [mongooseErr.errors[prop].path, mongooseErr.errors[prop].type] )
	}
	return list
}

/*
 * Translate mongoose errors into a <li> of errors
 */
exports.displayErrors = function( mongooseErr ){
	
	console.log( 'mongoose errs', mongooseErr )
	
	var list = stripErrors( mongooseErr )
	
	var output = []
	list.forEach(function(e,i){
		switch( e[1] ){
			case( 'unique' ):
				output.push( e[0]+" is taken" )
				break;
			case( 'required' ):
				output.push( e[0]+" is "+e[1] )
				break;
			case( 'format' ):
				output.push( e[0]+" has a bad format" )
				break;
			case( 'password' ):
				output.push( "password should be at least 6 char long" )
				break;
			case( 'loginpass' ):
				output.push( "login+password not found" )
				break;
				
			default:
				output.push( e[0]+": "+e[1] )
				break;
		}
	})
	if( output.length ){
		// condense all items in an error list
		output = [output.join( '</li><li>\n' )]
		output.unshift( '<ul><li>' )
		output.push( '</li><ul>' )
		
		// wrap in a div
		output.unshift( "<div class='error block'>" )
		output.push('</div>')
	}
	return output.join('\n')
}
