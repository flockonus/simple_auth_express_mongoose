// Dependencies
var bcrypt = require('bcrypt');


/**
 * Authenticator
 *
 * TODO: Add ability to change name of password field/key
 *
 * Dependencies:
 *      bcrypt
 * 
 * Adds a 'password' path, which automatically encrypts any passwords set to it
 * Adds a 'checkPassword' method
 * Adds a 'authenticate' static method to the collection for finding and authenticating users
 *
 * Options
 * findUserKey:
 *      Description : The key used to find a user (e.g. 'email', 'username')
 *      Type        : String
 *      Default     : 'email'
 *
 * minLength:
 *      Description : The min password length
 *      Type        : Number
 *      Default     : 8
 *  
 * workFactor:
 *      Description : The bcrypt work factor to use for new passwords. 
 *          Higher numbers are slower but safer.
 *      Type        : Number
 *      Default     : 10
 *
 */
module.exports = function authenticator(options) {
    options = options || {};
    
    //Options
    var findUserKey  = options.findUserKey   || 'email'
      , workFactor   = options.workFactor    || 10
      , minLength    = options.minLength     || 8
      ;
    
    /**
     * Encrypts a password
     * @param {String}      Password
     * @param {Function}    Callback (receives: err, hashedPassword)
     */
    function encryptPassword(password, callback) {
        bcrypt.gen_salt(workFactor, function(err, salt) {
            if (err) callback(err);
            
            bcrypt.encrypt(password, salt, function(err, hashedPassword) {
                if (err) callback(err);
                
                callback(null, hashedPassword);
            });
        });
    }
    
    /**
     * The main plugin function that is returned
     */
    return function authenticator(schema) {
        //Add the paths to the schema
        schema.add({
            password    : {
                type        : String,
                required    : true
            }
        });
        
        /**
         * Validate password length
         * NOTE: Validators are added after definition so built-in 'required' validator can run first
         */
        schema.path('password').validate(function(v) {
            if (!v) return false;
            
            return v.length >= minLength;
        }, 'minLength');
        
        //When password is set, mark it for encryption before save
        schema.path('password').set(function(v) {
            this['__authenticatorPlugin:passwordChanged'] = true;
            
            return v;
        });
        
        /**
         * Encrypt password before saving to DB.
         * This must be done in a middleware rather than setter, so that
         * it can run async.
         */
        schema.pre('save', function(next) {
            //Don't set password if it's already encrypted
            if (!this['__authenticatorPlugin:passwordChanged']) return next();
            
            var self = this;
            
            encryptPassword(self.password, function(err, hashedPassword) {
                if (err) next(err);
                
                self.password = hashedPassword;
                
                next();
            });
        });
        
        /**
         * Check a password
         * 
         * @param {String}      The plain text password to check
         * @param {Function}    Callback. Receives: err, passwordMatches
         * 
         * @return {Boolean}    Whether the password was correct
         */
        schema.method('checkPassword', function(password, callback) {
            bcrypt.compare(password, this.password, function(err, passwordMatches) {
                callback(err, passwordMatches);
            });
        });
        
        /**
         * Authenticate a user
         *
         * @param {String}      The user identifier (e.g. username, email); see findUserKey option
         * @param {String}      The password to check
         * @param {Function}    Callback.  Receives: err, doc
         */
        schema.static('authenticate', function(identifier, password, callback) {
            var criteria = {};
            criteria[findUserKey] = identifier;
            
            this.findOne(criteria, function(err, user) {
                if (err) return callback(err);
                
                //Make sure user exists
                if (!user) return callback(new Error('User ' + identifier + ' not found'));
                
                //Check password
                user.checkPassword(password, function(err, passwordMatches) {
                    if (err) return callback(err);
                    
                    if (passwordMatches)
                        return callback(null, user);
                    else
                        return callback(new Error('Invalid password'));
                });
            });
        });
    };
};
