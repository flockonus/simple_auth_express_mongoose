/**
 * Slugger
 * 
 * Adds a 'slug' property to the document, which can be set automatically when saving a new 
 * document.
 * Adds a 'fetchBySlug' static method to the collection
 *
 *
 * TODO:
 * Add check that the slug is unique
 *
 * Options:
 * slugKey:
 *      Description : The name for the key.
 *      Type        : String
 *      Default     : 'slug'
 * 
 * sourceKey:
 *      Description : The name of the key to use for generating the slug.
 *      Type        : String
 *      Default     : 'title'
 * 
 * index:
 *      Description : Whether to add an index
 *      Type        : Boolean
 *      Default     : true
 *
 * length:
 *      Description : The maximum string length
 *      Type        : Number
 *      Default     : 50
 *
 * unique:
 *      Description : Whether the slug should be unique. If another document with the same
 *          slug exists, a number will be added on the end.
 *          NOTE: If you set unique to true, you need to handle duplicate key errors from 
 *          within the model's save() method.
 *      Type        : Boolean
 *      Default     : true
 *
 * spaceChar:
 *      Description : The replacement character for spaces
 *      Type        : String
 *      Default     : '-'
 *
 * invalidChar:
 *      Description : The replacement character for invalid characters (e.g. punctuation)
 *      Type        : Boolean
 *      Default     : true
 *  
 */
module.exports = function slugger(options) {
    options = options || {};
    var slugKey     = options.slugKey       || 'slug'
      , sourceKey   = options.sourceKey     || 'title'
      , index       = (options.index === false) ? false : true
      , maxLength   = options.length        || 50
      , unique      = (options.unique === true) ? true : false
      , spaceChar   = options.spaceChar     || '-'
      , invalidChar = options.invalidChar   || ''
      ;
      
    
    return function slugger(schema) {        
        //Create slug path for schema
        var properties = {};
        properties[slugKey] = { type: String };
        
        //Add indexes
        if (unique)
            properties[slugKey].unique = true;
        else if (index)
            properties[slugKey].index = true;
        
        //Add to schema
        schema.add(properties);
        
        //Slug setter: sluggifies the string
        schema.path(slugKey).set(function(str) {
            //Trim and lowercase
            str = str.replace(/^\s+|\s+$/g, '')
                .toLowerCase();

            //Replace accented characters
            var from = "àáäâèéëêìíïîòóöôùúüûñç";
            var to   = "aaaaeeeeiiiioooouuuunc";
            for (var i=0, l=from.length ; i<l ; i++) {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }

            //Replace invalid characters and collapse repeated invalidChars
            str = str.replace(/[^a-z0-9 -]/g, invalidChar)
                .replace(new RegExp('['+invalidChar+']'+'+', 'g'), invalidChar);
            
            //Replace spaces
            str = str.replace(/\s+/g, spaceChar);
            
            //Limit length
            str = str.substr(0, maxLength);
            
            return str;
        });
        
        //Source setter: Set the slug when the 'source' changes, but not over existing slug
        schema.path(sourceKey).set(function(v) {
            //Set the slug if there isn't one already
            if (!this[slugKey]) this[slugKey] = v;
            
            return v;
        });
        
        //Add the fetchBySlug static method to the collection
        schema.static('fetchBySlug', function(slug, callback) {
            //Build criteria to use user-defined slugKey
            var criteria = {};
            criteria[slugKey] = slug;
            
            //Find
            return this.findOne(criteria, callback);
        });
    };
};
