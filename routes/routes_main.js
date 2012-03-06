var auth = require('./auth.js')
	, filters = require('./filters.js')
	, site = require('./site.js')

// SENSITIVE CODE, for now seems fine
app.all('*', filters.setReqView )

app.get( '/', site.pageA);
app.get( '/pageB', site.pageB);

app.get( '/auth/popover', auth.popover);
app.post('/auth/classic-signup', auth.classicSignup)
app.post('/auth/classic-login',  auth.classicLogin)

