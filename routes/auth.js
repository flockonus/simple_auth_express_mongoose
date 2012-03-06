
// app.get( '/auth/popover', auth.popover);
exports.popover = function(req, res){
	//req.session.popover = new Date()
	console.log('My session:', req.session)
  res.render('auth/index_pop', req.viewVars);
};


// CLASSIC LOGIN / SIGNUP       --because everyauth seems too messedup for login+pass

// app.post('/auth/classic-signup', auth.classicSignup)
exports.classicSignup = function(req,res,next) {
	if( !req.body ){
		console.log('why u signup nobody?')
		return res.redirect('/?nobodySignup')
	}
	
	var user = new app.models.User()
	
	user.set('nick', req.body.nick)
	user.set('email', req.body.email)
	user.set('password', req.body.pass)
	user.set('providers', ['signup:'+user.get('email')])
	user.set('profiles', [{ _name: 'signup'}])
	
	user.save( function(err) {
		if( err ){ // validation failed
			
			req.viewVars.u = user
			return classicYieldErr( req, res, 'signUp', err)
		
		} else { // signup successful
			
			
			req.session.user = { 
				provider: 'signup',
				id: user.get('id'),
				nick: user.get('nick'),
			}
			req.session.auth = {
				signup: {},
				loggedIn: true,
				userId: user.get('id'),
			}
			
			req.flash('notice', 'Welcome!')
			req.viewVars.welcome_login = "Welcome, "+user.nick
  		
  		res.render('auth/win_pop', req.viewVars )
		}
	})
};

// app.post('/auth/classic-login',  auth.classicLogin)
exports.classicLogin = function(req,res,next) {
	if( !req.body ){
		console.log('why u login nobody?')
		return res.redirect('/?nobodyLogin')
	}
	
	
	app.models.User.classicLogin( req.body.email, req.body.pass, function(err, user) {
		if( err ){ // validation failed
			
			return classicYieldErr( req, res, 'signIn', err)
			
		} else { 
			
			if( user ){ // login
				
				req.session.user = { 
					provider: 'signup',
					id: user.get('id'),
					nick: user.get('nick'),
				}
				req.session.auth = {
					signup: {},
					loggedIn: true,
					userId: user.get('id'),
				}
				
				req.flash('notice', 'Welcome!')
				req.viewVars.welcome_login = "Welcome, "+user.nick
	  		
	  		res.render('auth/win_pop', req.viewVars )
	  		
			} else { // not found
				return classicYieldErr( req, res, 'signIn', {errors:
					{'loginpass': {
						name: 'V',
						path: 'login+password',
						type: 'loginpass'
					}
				}})
			}
  		
		}
	})
};

// display form error
function classicYieldErr( req, res, mode, err ){
	req.viewVars.erroredForm = mode
	if( mode === 'signIn' ){
		req.viewVars.signin_errors = app.helpers.displayErrors( err )
	} else {
		req.viewVars.signup_errors = app.helpers.displayErrors( err )
	}
	req.viewVars.email = req.body.email
	
	res.render('auth/index_pop', req.viewVars);
}


