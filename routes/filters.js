exports.setReqView = function(req,res,next) {
	
	// avoid losing messages in between assets request
	var augument =  function(){
		return req.flash('notice').join(' ')
	}
	
	req.viewVars = {
		crumbs: [],
		flash_notice: augument, // only consumed inside views :)
	}
	
	if( req.session ){
		if ( req.session.user ){
			req.viewVars.welcome_login = "Welcome, "+req.session.user.nick
		}
	}
	
	// hook bread crumb
	req.addCrumb = function ( tip, url ){
		req.viewVars.crumbs.push( '<a href="'+url+'">'+tip+'</a>' )
	}
	req.addCrumb( 'Start', '/' )
	
	next()
}

exports.requireLogin = function(req, res, next){
	if( req.session ){
		if ( req.session.user ){
			next()
		} else {
			req.flash('notice', 'Login required')
			req.session.returnTo = req.originalUrl
			//res.redirect('/auth') not anymore.. now it should be a popup!
			res.redirect(req.headers.referer || "/?do_signup" )
		}
	}
}

//exports.setCrumb = function(req, res, next){
//}
