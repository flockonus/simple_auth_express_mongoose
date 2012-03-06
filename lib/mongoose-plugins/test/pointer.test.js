/**
* Pointer Mongoose plugin tests
* 
* Run $ nodeunit
* 
* @author Charles Davison charlie@powmedia.co.uk
*/

//Dependencies
var mongoose = require('mongoose'),
    testCase = require('nodeunit').testCase,
    Schema = mongoose.Schema,
    pointer = require('../lib/pointer');


//Set up schemas
var authorSchema = new Schema({
    name: String
});

var postSchema = new Schema({
    title: String,
    authorId: Schema.ObjectId
});
postSchema.plugin(pointer({
    idKey: 'authorId',
    virtualKey: 'author',
    modelName: 'Author'
}));

//Create models
mongoose.model('Post', postSchema);
mongoose.model('Author', authorSchema);

//Get models
var Post = mongoose.model('Post'),
    Author = mongoose.model('Author');



exports.options_idKey = {
    'is added to the schema if it doesnt exist already': function(test) {
        test.expect(3);
        
        //Create schema without the ID key
        var schema = new Schema({
            title: String
        });
        
        //Add the plugin
        schema.plugin(pointer({
            modelName: 'Author',
            idKey: 'aid'
        }));
        
        //Test that the ID key had been added correctly
        var path = schema.paths.aid;
        test.ok(typeof path !== 'undefined');
        test.same(path.isRequired, true);
        test.same(path.options.type, Schema.ObjectId);
        test.done();
    },
    
    'if idKey option is not supplied, a default name is used': function(test) {
        test.expect(1);
        
        //Create schema without the ID key
        var schema = new Schema({
            title: String
        });
        
        //Add the plugin
        schema.plugin(pointer({
            modelName: 'Author'
        }));
        
        //Test
        var path = schema.paths.authorId;
        test.ok(typeof path !== 'undefined');
        test.done();
    },
    
    'if there is an existing idKey, it is not overwritten': function(test) {
        test.expect(1);
        
        //Create schema with the ID key
        var schema = new Schema({
            title: String,
            authorId: { type: Schema.ObjectId, required: false }
        });
        
        //Add the plugin
        schema.plugin(pointer({
            modelName: 'Author',
            idKey: 'authorId'
        }));
        
        //Test
        var path = schema.paths.authorId;
        test.same(path.isRequired, false);
        test.done();
    }
};



exports.options_virtualKey = {
    'is added to the schema with the given name': function(test) {
        test.expect(1);

        //Create schema with the ID key
        var schema = new Schema({ title: String });

        //Add the plugin with custom name for the virtual
        schema.plugin(pointer({
            modelName: 'Author',
            virtualKey: 'author123'
        }));

        test.ok(typeof schema.virtuals.author123 !== 'undefined');
        test.done();
    },

    'if virtualKey option is not supplied, a default is used': function(test) {
        test.expect(1);

        //Create schema with the ID key
        var schema = new Schema({ title: String });

        //Add the plugin with custom name for the virtual
        schema.plugin(pointer({
            modelName: 'Author'
        }));

        test.ok(typeof schema.virtuals.author !== 'undefined');
        test.done();
    }
};



exports.options_getterKey = {
    'option is used to name the async getter method': function(test) {
        test.expect(1);
        
        //Create schema with the ID key
        var schema = new Schema({ title: String });
        
        //Add the plugin with custom name for the virtual
        schema.plugin(pointer({
            modelName: 'Author',
            getterKey: 'getAuthor123'
        }));
        
        test.ok(typeof schema.methods.getAuthor123 !== 'undefined');
        test.done();
    },
    
    'if option is not supplied, a default is used': function(test) {
        test.expect(1);
        
        //Create schema with the ID key
        var schema = new Schema({ title: String });
        
        //Add the plugin with custom name for the virtual
        schema.plugin(pointer({
            modelName: 'Author'
        }));
        
        test.ok(typeof schema.methods.getAuthor !== 'undefined');
        test.done();
    },
};



exports.virtualSetter = {
    'requires a model instance': function(test) {
        test.expect(1);
        
        try {
            var post = new Post({
                title: 'Article title',
                authorId: undefined,
                author: '000000000000000000000001'
            });
        } catch (e) {
            test.same(e.message, '"author" must be a Author model');
            return test.done();
        }

        //Fail if the exception wasn't caught
        test.ok(false, 'Expecting an exception');
        test.done();
    },
    
    'sets the [idKey] attribute if not already set': function(test) {
        var author = new Author({
            _id: '000000000000000000000001',
            name: 'John Smith'
        });
        
        var post = new Post({
            title: 'Post title',
            authorId: undefined,
            author: author
        });
        
        test.same(post.authorId, author._id);
        test.done();
    },
    
    'if the job already has a reference ID, it must match the given document ID': function(test) {
        test.expect(1);
        
        try {
            var author = new Author({
                _id: '000000000000000000000001',
                name: 'John Smith'
            });

            var post = new Post({
                title: 'Post title',
                authorId: '000000000000000000000002'
            });
            
            post.author = author;
        } catch (e) {
            test.same(e.message, 'Author must be the same as identified by the "authorId" attribute');
            return test.done();
        }
        
        //Fail if the exception wasn't caught
        test.ok(false, 'Expecting an exception');
        test.done();
    },
    
    'caches the referenced document for fetching later without a DB request': function(test) {
        var author = new Author({
            _id: '000000000000000000000001',
            name: 'John Smith'
        });

        var post = new Post({
            title: 'Post title',
            authorId: '000000000000000000000001'
        });
        
        post.author = author;
        
        test.same(post.author, author);
        test.done();
    }
};


exports.virtualGetter = {
    'returns the supplied domain': function(test) {
        var author = new Author({
            name: 'John Smith'
        });

        var post = new Post({
            title: 'Post title',
            author: author
        });
        
        test.same(post.author, author);
        test.done();
    }
};


exports.asyncGetter = testCase({    
    setUp: function(callback) {
        //Create models
        this.author = new Author({
            _id: '000000000000000000000005',
            name: 'William Shakespeare'
        });
        
        this.post = new Post({
            title: 'Post title',
            authorId: '000000000000000000000005'
        });
        
        //Save the original method which will be mocked
        this._findOne = Author.findOne;
        
        callback();
    },
    
    tearDown: function(callback) {
        //Return the original method
        Author.findOne = this._findOne;
        
        callback();
    },
    
    'fetches the referenced document': function(test) {
        test.expect(2);
        
        var post = this.post,
            author = this.author;
        
        //Mock the DB request
        Author.findOne = function(criteria, callback) {
            //Make sure the correct ID was requested
            test.same(criteria._id.toHexString(), '000000000000000000000005');
            
            //Return the author, as if this was the DB returning it
            callback(null, author);
        }
        
        //Check that the method fetches the correct referenced object
        post.getAuthor(function(err, author2) {
            if (err) throw err;
            
            test.same(author2, author);
            
            test.done();
        });
    },
    
    'caches the domain object to prevent multiple DB fetches': function(test) {
        test.expect(3);
        
        var post = this.post,
            author = this.author;
        
        //Mock the DB request
        Author.findOne = function(criteria, callback) {
            //Make sure the correct ID was requested
            test.same(criteria._id.toHexString(), '000000000000000000000005');
            
            //Return the author, as if this was the DB returning it
            callback(null, author);
        }
        
        //Get doc the first time (from DB)
        post.getAuthor(function(err, author2) {
            test.same(typeof author2._testCached, 'undefined');
            
            //Mark it as cached
            author2._testCached = true;
            
            //Get the doc again (cached)
            post.getAuthor(function(err, author3) {
                test.ok(author3._testCached, 'Got the cached object');
                
                test.done();
            });
        });
    }
});
