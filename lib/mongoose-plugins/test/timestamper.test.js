/**
* Timestamper Mongoose plugin tests
* expresso 
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
  , timestamper = require('../lib/timestamper')
  , assert = require('assert')
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
function createPost(options) {
    var options = options || {}
      , schema = options.schema || { title: String }
      , pluginOptions = options.plugin || {}
      ;
    
    //Set up schema
    var postSchema = new mongoose.Schema(schema);
    postSchema.plugin(timestamper(pluginOptions));
    
    //Create model instance
    var modelName = 'TimestamperTestPost' + modelCounter;
    modelCounter++;
    mongoose.model(modelName, postSchema);
    var Post = mongoose.model(modelName);
    var post = new Post();
    
    return post;
}

/**
 * Returns unix time but less accurately. Used to make sure that created and updated times
 * are correct (match the time now) but allowing for time between operations as the 
 * Javascript Date object unix time is too accurate.
 */
function getRoughTime(dateObj) {
    return dateObj.getTime().toString().substring(0, 10);
}


//Tests
module.exports = {
    
    'created and updated times are set when model is saved': function(beforeExit) {
        var n = 0;
        
        //Default options
        var postDefault = createPost();
        
        postDefault.pre('save', function(next) {            
            var now = getRoughTime(new Date());

            assert.eql(
                getRoughTime(postDefault.created), now, 
                'Default created option saves timestamp on the "created" key'
            );
            assert.eql(
                getRoughTime(postDefault.updated), now,
                'Default updated option saves timestamp on the "updated" key'
            );
            
            n++;
            next();
        });
        
        postDefault.save(function(err) {
            if (err) throw err;
        });
        
        
        //Custom options
        var postCustom = createPost({
            plugin: { createdKey: 'myCreated', updatedKey: 'myUpdated' }
        });
        
        postCustom.pre('save', function(next) {            
            var now = getRoughTime(new Date());
            
            assert.eql(
                getRoughTime(postCustom.myCreated), now,
                '"created" key can be renamed'
            );
            assert.eql(
                getRoughTime(postCustom.myUpdated), now,
                '"updated" key can be renamed'
            );
            
            n++;
            next();
        });
        
        postCustom.save(function(err) {
            if (err) throw err;
        });
        
        
        //Ensure all asserts run
        beforeExit(function() {
            assert.equal(2, n, 'All asserts ran');
        });
    },
    
    'when saving an existing object only the updated property is changed': function(beforeExit) {
        var n = 0;
        
        //Simulate an old object
        var post = createPost();
        post.isNew = false;
        
        post.pre('save', function(next) {
            var now = getRoughTime(new Date());

            assert.isUndefined(post.created, '"created" timestamp is not set');

            assert.eql(
                getRoughTime(post.updated), now,
                '"updated" timestamp is set'
            );
            
            n++;
            next();
        });
        
        post.save(function(err) {
            if (err) throw err;
        });

        
        //Ensure all asserts run
        beforeExit(function() {
            assert.equal(1, n, 'All asserts ran');
        });
    }
    
};
