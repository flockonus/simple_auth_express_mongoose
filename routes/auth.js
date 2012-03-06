

exports.popover = function(req, res){
	//req.session.popover = new Date()
	console.log('My session:', req.session)
  res.render('auth/index_pop', req.viewVars);
};



// CLASSIC LOGIN / SIGNUP       --because everyauth seems too messedup for login+pass

exports.classicSignup = function(req,res,next) {
	if( !req.body ){ 
		console.log('why u signup nobody?')
		return res.redirect('/?nobodySignup')
	}
	
	var user = new app.models.User()
	
	user.set('nick', req.body.nick)
	user.set('email', req.body.email)
	user.set('password', req.body.pass)
	
	user.save( function(err) {
		if( err ){ // validation failed
			
			console.log(err)
			
			req.viewVars.erroredForm = 'signUp'
			req.viewVars.signup_errors = app.helpers.displayErrors( err )
			req.viewVars.u = user
			
			res.render('auth/index_pop', req.viewVars);
			
		} else { // signup successful
			
			req.session.user = { 
				provider: 'signup',
				id: user.get('id'),
				nick: user.get('nick'),
			}
			
			req.flash('notice', 'Welcome!')
			req.viewVars.welcome_login = "Welcome, "+user.nick
  		
  		res.render('auth/win_pop', req.viewVars )
		}
	})
};

exports.classicLogin = function(req,res,next) {
	if( !req.body ){ 
		console.log('why u login nobody?')
		return res.redirect('/?nobodyLogin')
	}
	
	
	app.models.User.classicLogin( req.body.email, req.body.pass, function(err, user) {
		
		console.log('got ', err, user)
		
		if( err ){ // validation failed
			
			req.viewVars.erroredForm = 'signIn'
			req.viewVars.signin_errors = app.helpers.displayErrors( err )
			req.viewVars.email = req.body.email
			
			res.render('auth/index_pop', req.viewVars);
		} else { 
			
			if( user ){ // login
				
				req.session.user = { 
					provider: 'signup',
					id: user.get('id'),
					nick: user.get('nick'),
				}
				
				req.flash('notice', 'Welcome!')
				req.viewVars.welcome_login = "Welcome, "+user.nick
	  		
	  		res.render('auth/win_pop', req.viewVars )
	  		
			} else { // not found
				req.viewVars.erroredForm = 'signIn'
				req.viewVars.signin_errors = app.helpers.displayErrors({errors:
					{'loginpass': {
						name: 'V',
						path: 'login+password',
						type: 'loginpass'
					}
				}})
				req.viewVars.email = req.body.email
				
				res.render('auth/index_pop', req.viewVars);
			}
  		
		}
	})
};


