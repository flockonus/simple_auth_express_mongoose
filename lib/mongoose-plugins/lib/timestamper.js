/**
 * Timestamper
 *
 * Sets the 'created' and 'updated' values when the object is saved
 *
 * TODO:
 * Look into why the 'created' key isn't added on embedded documents. Could be that they don't 
 *      have the 'isNew' property?
 *
 * Options:
 * createdKey:
 *      Description : The name of the key to timestamp when an object is created (and saved)
 *      Type        : String (or false/null to not save this)
 *      Default     : 'created'
 * 
 * updatedKey:
 *      Description : The name of the key to timestamp when an object is updated (and saved)
 *      Type        : String (or false/null to not save this)
 *      Default     : 'updated'
 *
 */
module.exports = function timestamper(options) {
    options = options || {};
    var createdKey     = options.createdKey   || 'created_at'
      , updatedKey     = options.updatedKey   || 'updated_at'
      ;

    return function timestamper(schema) {
        //Add the properties to the schema
        var properties = {};
        if (createdKey) properties[createdKey] = { type: Date };
        if (updatedKey) properties[updatedKey] = { type: Date };
        schema.add(properties);
        
        //Updated timestamps before save
        schema.pre('save', function(next) {
            //Set created
            if (this.isNew && createdKey) {
                this[createdKey] = Date.now();
            }
            
            //Set updated
            if (updatedKey) this[updatedKey] = Date.now();
            
            next();
        });
    };
};
