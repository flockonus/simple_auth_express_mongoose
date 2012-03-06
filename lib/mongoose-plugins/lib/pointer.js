/**
 * Pointer Mongoose plugin 
 * 
 * Manages referenced documents from other collections and caches them locally.
 * A little like the MongoDB DBRef (which is not available in Mongoose)
 * 
 * USAGE:
 * var postSchema = new mongoose.Schema({
 *   title: String 
 * });
 * 
 * postSchema.plugin(pointer({
 *   modelName: 'Author'
 * }));
 * 
 * mongoose.model('Post', postSchema);
 * var Post = mongoose.model('Post');
 * 
 * var author = new Author({ name: 'John Smith' });
 * var post = new Post({ title: 'My post', author: author });
 * 
 * console.log(post.authorId);      // 4e1855326883bb050e000001
 * console.log(post.author);        // { _id: 4e1855326883bb050e000001, name: 'John Smith' }
 * 
 * //Example using post2, which has been fetched from DB (author document has not been loaded into it yet):
 * post2.getAuthor(function(err, author) {
 *   console.log(author) // { _id: 4e1855326883bb050e000001, name: 'John Smith' }
 *   //author is now cached on the post object and can be accessed with post2.author
 * });
 * 
 * 
 * NOTES:
 * The async getter method (e.g. getAuthor()) is required for when loading the referenced document for the
 * first time, as this needs to be fetched from the DB.  After the first use, it is cached locally so that
 * that the virtual (post.author) can be used without fetching from the DB again.
 *
 * 
 * REQUIRED PARAMETERS:
 * modelName:
 *      Description : The Mongoose model name for the referenced document/collection. E.g. 'Author'
 *      Type        : String
 *
 *
 * OPTIONS:
 * virtualKey:
 *      Description : The name for the virtual that will be added
 *      Type        : String
 *      Default     : A lowercase version of the modelName, e.g. 'author'
 *
 * idKey:
 *      Description : The name for the key where the reference ObjectId will be stored.
 *                    If it does not exist on the schema, it will be added.
 *                    This is the part that is persisted to the database so it can be worth making this short
 *                    in order to save space (e.g. 'aid' instead of 'authorId')
 *      Type        : String
 *      Default     : The virtualKey with 'Id' appended to it, e.g. 'authorId'
 *
 * getterKey:
 *      Description : The name of the async getter/loader method that will be added
 *      Type        : String
 *      Default     : 'get' + the modelName, e.g. 'getAuthor'
 *
 */
 

//Dependencies
var mongoose = require('mongoose');

module.exports = function pointer(options) {
    //Check for required options
    if (!options.modelName) throw new Error('Missing required parameter: modelName');
        
    var modelName   = options.modelName,
        virtualKey  = options.virtualKey || modelName.toLowerCase(),
        idKey       = options.idKey || virtualKey + 'Id',
        getterKey   = options.getterKey || 'get' + modelName,
        cachedKey   = '__' + virtualKey + '_cached';
                
    
    return function pointer(schema) {
        //Add the reference (idKey) if not already defined
        if (typeof schema.path(idKey) == 'undefined') {
            var additions = {};
            additions[idKey] = { type: mongoose.Schema.ObjectId, required: true };
            
            schema.add(additions);
        }
        
        //Add the virtual
        schema.virtual(virtualKey)
            .get(function() {
                if (!this[cachedKey]) {
                    var msg = modelName+' has not been loaded yet. Use '+getterKey+'() instead.';                    
                    throw new Error(msg);
                }

                return this[cachedKey];
            })
            .set(function(val) {
                var model = mongoose.model(modelName);

                //Must be a Domain model instance
                if (!(val instanceof model))
                    throw new Error('"'+virtualKey+'" must be a '+modelName+' model');

                //Check the ID matches current ID (if set)
                if (this[idKey] && this[idKey].toHexString() !== val._id.toHexString()) {
                    throw new Error(modelName+' must be the same as identified by the "'+idKey+'" attribute');
                }

                //Save the ID (this gets persisted to DB)
                this[idKey] = val._id;

                //Store the business object for accessing it later without a DB lookup
                this[cachedKey] = val;
            });
        
        
        //Add the async get method which loads the referenced document
        schema.method(getterKey, function(callback) {
            //Check for a locally cached version first
            if (this[cachedKey]) return callback(null, this[cachedKey]);

            var model = mongoose.model(modelName),
                self = this;

            model.findOne({ _id: this[idKey] }, function(err, instance) {
                if (err) return callback(err);
                if (!instance) return callback(new Error(modelName + ' not found'));

                //Cache the object to prevent multiple fetches from DB
                self[cachedKey] = instance;

                return callback(null, instance);
            });
        });
    };
};
