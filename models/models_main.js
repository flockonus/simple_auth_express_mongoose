/*
 * Invoke all models we need, expose mongoose
 */

GLOBAL.mongoose = require('mongoose');
mongoose.set('debug', true)

// include the mongoose plugins
// 		authenticator
// 		pointer
// 		slugger
// 		timestamper
// 		utils
// 		validator
// 		
// 		Of these, only the timestamper is used in this example
// 		
mongoose.availablePlugins = require('../lib/mongoose-plugins')

//set the url from the configuration file (dev makes this local)
var url = app.config.mongodb_url

//includes the user.js which 
//	- describes the user model schema (name, email, nick)
//	- includes the password encryption function
//	- validates the name, password and schema
//	- inserts the schema into mongoose

require('./user.js')


// make the mongoose schema available as app.models that will be used by routes\auth.js to
// creating new users
app.models = mongoose.models

//connect to the configured mongodb_url
//NOTE: this isn't configured in 'production' in this example, 
//you'll need to set it yourself
var url = app.config.mongodb_url
mongoose.connect(url);

//on connection, log the number of users in the system
mongoose.models.User.count({}, function (err, num) { console.log('users:',num)  });

// export mongoose.models as a module
module.exports = mongoose.models
