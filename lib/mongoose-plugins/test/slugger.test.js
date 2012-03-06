/**
* Slugger Mongoose plugin tests
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
  , slugger = require('../lib/slugger')
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
      , sluggerOptions = options.slugger || {}
      ;
    
    //Set up schema
    var postSchema = new mongoose.Schema(schema);
    postSchema.plugin(slugger(sluggerOptions));
    
    //Create model instance
    var modelName = 'SluggerTestPost' + modelCounter;
    modelCounter++;
    mongoose.model(modelName, postSchema);
    var Post = mongoose.model(modelName);
    var post = new Post();
    
    return post;
}


/**
 * Tests
 */
module.exports = {
    
    'can set the slug name via slugKey option': function() {
        //Default options
        var post = createPost();
        assert.isDefined(post.schema.paths.slug, 'slugKey defaults to "slug"');
        
        //Custom options
        var post = createPost({
            slugger: { slugKey: 'customSlugName' }
        });
        assert.isDefined(post.schema.paths.customSlugName, 'Allows setting custom slugKey');
    },
    
    'can set the slug source via sourceKey option': function() {
        //Default options
        var post = createPost();
        post.title = 'Title';
        assert.eql(post.slug, 'title', 'sourceKey defaults to "title"');
        
        //Custom option
        var post = createPost({
            schema: { name: String },
            slugger: { sourceKey: 'name'}
        });
        post.name = 'Name';
        assert.eql(post.slug, 'name', 'Allows setting custom sourceKey')
    },
    
    'can set an index via the index option': function() {
        //Default options
        var post = createPost();
        assert.eql(post.schema.paths.slug.options.index, true, 'Index is on by default');
        
        //Custom options
        var post = createPost({
            slugger: { index: false }
        });
        assert.isUndefined(post.schema.paths.slug.options.index, 'Index can be turned off');
    },
    
    'slug length is limited via the length option': function() {
        //Default options
        var post = createPost();
        post.title = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        assert.eql(
            post.slug, 
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 
            'Slugs are shortened to 50 characters by default'
        );
        
        //Custom options
        var post = createPost({
            slugger: { length: 10 }
        });
        post.title = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
        assert.eql(
            post.slug,
            'bbbbbbbbbb',
            'Slug length can be changed'
        );
    },
    
    'can set a unique index via the unique option': function() {
        //Default options
        var post = createPost();
        assert.isUndefined(post.schema.paths.slug.options.unique, 'Unique index is off by default');
        
        //Custom options
        var post = createPost({
            slugger: { unique: true }
        });
        assert.eql(post.schema.paths.slug.options.unique, true, 'Unique index can be turned on');
    },
    
    'can set a character to replace spaces via the spaceChar option': function() {
        //Default options
        var post = createPost();
        post.title = 'Post Title';
        assert.eql(post.slug, 'post-title', 'Default space character is "-"');
        
        //Custom options
        var post = createPost({
            slugger: { spaceChar: '_' }
        });
        post.title = 'Post Title';
        assert.eql(post.slug, 'post_title', 'Space character can be changed');
    },
    
    'can set a character to replace invalid characters via the invalidChar option': function() {
        //Default options
        var post = createPost();
        post.title = 'Title!';
        assert.eql(post.slug, 'title', 'Default invalid character is empty string');
        
        //Custom options
        var post = createPost({
            slugger: { invalidChar: '-' }
        });
        post.title = 'Title!';
        assert.eql(post.slug, 'title-', 'Invalid character can be changed');
    },

    'setting the model sourceKey should set the slug': function() {
        var post = createPost();
        post.title = 'Post Title';
        
        assert.eql('post-title', post.slug);
    },

    'setting the sourceKey should not set the slug if it has already been set': function() {
        var post = createPost();
        post.title = 'Title 1';
        post.title = 'Title 2';
        
        assert.eql('title-1', post.slug);
    },
    
    'setting the slug directly should sluggify the string': function() {
        var post = createPost();
        post.slug = 'Some Slug';
        
        assert.eql('some-slug', post.slug);
    },
    
    'converts strings to URL safe slugs': function() {
        var post = createPost({
            slugger: {
                slugKey     : 'slug',
                sourceKey   : 'title',
                spaceChar   : '-',
                invalidChar : '_',
                length      : 25
            }
        });
        
        //Assertions
        post.title = 'àáäâèéëêìíïîòóöôùúüûñç';
        assert.eql(post.slug, 'aaaaeeeeiiiioooouuuunc', 'Should replace accented characters');
        
        post.slug = null;
        post.title = 'some post';
        assert.eql(post.slug, 'some-post', 'Should replace spaces with spaceChar');
        
        post.slug = null;
        post.title = 'post    with   lots of     spaces';
        assert.eql(
            post.slug, 
            'post-with-lots-of-spaces', 
            'Should replace multiple spaces with one spaceChar'
        );
        
        post.slug = null;
        post.title = 'some§±!@£$%^&*()+={}[];:\'\"\\|?/,.<>`~post';
        assert.eql(post.slug, 'some_post', 'Should replaces invalid characters with one invalidChar');
        
        post.slug = null;
        post.title = 'this is a long title for some post';
        assert.eql(post.slug, 'this-is-a-long-title-for-', 'Should limit slug length');
    },
    
    'adds a fetchBySlug static method to the collection': function() {
        var postSchema = new mongoose.Schema({'title': String});
        postSchema.plugin(slugger());
        
        assert.ok(postSchema.statics.fetchBySlug);
    }
};