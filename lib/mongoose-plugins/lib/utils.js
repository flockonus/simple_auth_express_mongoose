var utils = {
    
    /**
     * Takes a nested object and returns a shallow object keyed with the path names
     * e.g. { "level1.level2": "value" }
     * 
     * Useful with Mongoose to create a safer way of updating nested documents.
     * 
     * Create a whitelist of attributes a client is able to change and
     * then check that the paths they are trying to set is valid
     * 
     * @param {Object}      Nested object e.g. { level1: { level2: 'value' } }
     * @param {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
     */
    objToPaths: function(obj) {
        var ret = {};

        for (var key in obj) {
            var val = obj[key];

            if (val.constructor === Object) {
                //Recursion for embedded objects
                var obj2 = utils.objToPaths(val);

                for (var key2 in obj2) {
                    var val2 = obj2[key2];

                    ret[key+'.'+key2] = val2;
                }
            } else {
                ret[key] = val;
            }
        }

        return ret;
    }
    
};


//Exports
module.exports = utils;
