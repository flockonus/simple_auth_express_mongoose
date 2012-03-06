/**
* Authenticator Mongoose plugin tests
* 
* TODO: Write tests in Nodeunit, improve
*       Add a test for setting a password, checking it, 
*           changing something else and saving the model, then checking that the password
*           still works.  Then change the password and save, and check that it has changed.
*
* Run $ expresso
*
* These tests use the Mongoose pre save middleware rather than save callbacks to do asserts because this way
* we don't need to connect to a real DB.  At time of writing, Mongoose doesn't run the save() callback if there
* is not a real DB connection
* 
* @author Charles Davison charlie@powmedia.co.uk
*/


/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , authenticator = require('../lib/authenticator')
  , assert = require('assert')
  , bcrypt = require('bcrypt')
  ;

/**
 * This counter is used to create unique models each time createPost is called, due to the way
 * mongoose caches models
 */
var modelCounter = 1;

/**
 * Create a post with a new schema and model each time
 * Options: schema, model, slugger
 */
function createUser(options) {
    var options = options || {}
      , schema = options.schema || { username: String }
      , pluginOptions = options.plugin || {}
      ;
      
    //Set up schema
    var userSchema = new mongoose.Schema(schema);
    userSchema.plugin(authenticator(pluginOptions));
    
    //Create model instance
    var modelName = 'AuthenticatorTestUser' + modelCounter;
    modelCounter++;
    mongoose.model(modelName, userSchema);
    var User = mongoose.model(modelName);
    var user = new User();
    
    return user;
}


/**
 * Tests
 */
module.exports = {
    
    'validates minimum password length': function(beforeExit) {
        var n = 0;
        
        
        //Default options
        var userDefault = createUser();
        userDefault.username = 'Charlie';
        userDefault.password = '1234567';
        
        userDefault.save(function(err) {            
            assert.eql(
                'Validator "minLength" failed for path password', 
                err.errors.password,
                'With default options, validation fails if password is less than 8 characters'
            );
            
            n++;
        });
        
        
        //Custom options
        var userCustom = createUser({
            plugin: { minLength: 10 }
        });
        userCustom.username = 'Charlie';
        userCustom.password = '123456789';
        
        userCustom.save(function(err) {
            assert.eql(
                'Validator "minLength" failed for path password', 
                err.errors.password,
                'Custom minLength can be set for password'
            );
            
            n++;
        });

        //Check assertions ran
        beforeExit(function() {
            assert.eql(2, n, 'All callbacks ran');
        });
    },
    
    'allows changing the bcrypt work factor': function(beforeExit) {
        var n = 0;
        
        
        /**
         * Default options
         */
        var userDefault = createUser();
        userDefault.username = 'Charlie1';
        userDefault.password = 'testtest1';
        
        //Assertions
        userDefault.pre('save', function(next) {
            var workFactor = parseFloat(userDefault.password.split('$')[2]);
            assert.eql(10, workFactor, 'Work factor is 10 by default');
            
            //Run second set of assertions
            runAssertsForCustomWorkFactor();
            
            n++;
            next();
        });
        
        //Trigger authenticator functionality
        userDefault.save(function(err) {
            if (err) throw err;
        });
        
        
        /**
         * Custom options tests
         *
         * This is in a separate function so that it can run after the 'default options' test.
         * If they run in parallel they often fail. This seems to be due to a Mongoose bug where the
         * new options passed into the plugin (in this case the workFactor) aren't used. 
         * Running the tests serially this way works.
         * TODO: Look into this
         */
        function runAssertsForCustomWorkFactor() {
            var userCustom = createUser({
                plugin: { workFactor: 8 }
            });
            userCustom.username = 'Charlie2';
            userCustom.password = 'testtest2';

            //Assertions
            userCustom.pre('save', function(next) {
                var workFactor = parseFloat(userCustom.password.split('$')[2]);
                assert.eql(8, workFactor, 'Work factor can be changed');

                n++;
                next();
            });

            //Trigger authenticator functionality
            userCustom.save(function(err) {
                if (err) throw err;
            });
        }
        
        
        //Check assertions ran
        beforeExit(function() {
            assert.eql(2, n, 'All callbacks ran');
        });
    },
    
    'when a password is set it is encrypted': function(beforeExit) {
        var n = 0;
        
        var user = createUser();
        user.username = 'charlie';
        user.password = 'testtest';
        
        //Assertions
        user.pre('save', function(next) {
            assert.ok(
                bcrypt.compare_sync('testtest', user.password), 
                'Password is encrypted correctly'
            );
            
            n++;
            next();
        });
        
        //Trigger functionality
        user.save(function(err) {
            if (err) throw err;
        });
        
        //Check assertions ran
        beforeExit(function() {
            assert.eql(1, n, 'All callbacks ran');
        });
    },

    'adds a checkPassword() method which checks if a password matches': function(beforeExit) {
        var n = 0;
        
        var user = createUser();
        user.username = 'charlie';
        user.password = 'testtest';
        
        //Assertions
        //TODO: Move this into the user.save() callback. But that isn't running the callback. Why?
        user.pre('save', function(next) {
            //Test correct password
            user.checkPassword('testtest', function(err, passwordMatches) {
                if (err) throw err;
                
                assert.ok(passwordMatches, 'Correct password passes authentication');
            });

            //Test incorrect password
            user.checkPassword('gbrsybgry', function(err, passwordMatches) {
                if (err) throw err;

                assert.eql(false, passwordMatches, 'Incorrect password fails authentication');
            });    

            n++;
            next();
        });
        
        //Trigger functionality
        user.save(function(err) {
            if (err) throw err;
        });

        //Check assertions ran
        beforeExit(function() {
            assert.eql(1, n, 'All callbacks ran');
        });
    },
    
    //TODO: Add more in-depth test of the static method
    'adds an authenticate() static method which finds and authenticates a user': function() {        
        var userSchema = new mongoose.Schema({ email: String });
        userSchema.plugin(authenticator());
        
        assert.ok(userSchema.statics.authenticate);
    }
    
};
