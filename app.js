
// require the module dependencies express web server, swig templating library
// set the port variable for the application
var express = require('express')
	, swig = require('./lib/swig') // https://github.com/paularmstrong/swig/tree/master/docs
  , port = process.env.PORT || 8142

// create the express server, call it app, under the Global namespace
GLOBAL.app = module.exports = express.createServer();

// for development:
// initialize swig, specifying the root directory of the templates
// sets 'allowErrors' flag to true (this is development, after all)
// prevents caching of templates
// includes 'dev' app.config ()
app.configure('development', function(){
  app.config = JSON.parse( require('fs').readFileSync('./config/development.json', 'utf8') )
  swig.init({
    root: __dirname + '/views',
    allowErrors: true,
    cache: false,
	});
});

// for production: 
// initialize swig, specifying the root directory of the templates
// sets 'allowErrors' flag to false
// allows caching of templates for faster use
// NOTE that production doesn't have a mongodb url set up. 
//      This would be a place to provide that, or pull in a production.json file perhaps.

app.configure('production', function(){
	app.config = {}
  swig.init({
    root: __dirname + '/views',
    allowErrors: false, // ? allows errors to be thrown and caught by express
    cache: true,
	});
});

// Configuration //

app.configure(function(){
  // use the express.logger npm module express-logger to log error to console
  // https://github.com/joehewitt/express-logger
  app.use(express.logger({format: app.config.logger.format }));

  // set the views 
  app.set('views', __dirname + '/views');

  // registers html files with swig
  // In express v3+, you would do this with app.engine('html',swig)
  app.register('.html', swig);

  // sets the default engine to html as registers above.
	app.set('view engine', 'html');

  // sets view options. by setting layout to false, 
  // 
	app.set('view options', { layout: false });

  // 
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'changeME' }));

  app.use(app.router);

  // set express static to deliver the static files, like js, css, images etc
  app.use(express.static(__dirname + '/public'));
});

// Show errors, keep bots away
app.configure('development', function(){
	app.use(express.errorHandler({
		'dumpExceptions': true
		, 'showStack': true
	}));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// this is important to show fields with errors
if( !app.helpers ) app.helpers = {}
app.helpers.displayErrors = require('./helpers/form_helper.js').displayErrors


// include the file models_main.js that instantiates mongoose models
require('./models/models_main.js')
routes = require('./routes/routes_main.js')


routes = require('./routes/routes_main.js')

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
