/*
// value as key, key as value
reverseHash = function(hash) {
	var i, 
			h = {}
	
	for( i in hash ){
		if( hash.hasOwnProperty(i) ){
			h[hash[i]] = i
		}
	}
	return h
};

translation = {
	platforms: {
		pc: "PC",
		ps3: "Playstation 3",
		'360': "Xbox 360",
		wii: "Wii",
		psp: "PSP",
		vita: "Vita",
		ds: "DS",
		'3ds': "3DS",
		web: "Browser/Web",
		iph: "iPhone",
		and: "Android",
	},
	genres: {
		shooter: "Shooter",
		rpg:     'RPG',
		mmo:     "MMO",
		sports:  "Sports",
		str:     "Strategy",
		sim:     "Simulation",
		race:    "Racing",
		puzzle:  "Puzzle",
		rhythm:  "Rhythm",
		casual:  "Casual",
		sand:    "Sandbox",
		part:    "Family/Party",
		edu:     "Educational",
		action:  "Action",
		adv:     "Adventure",
		fight:   "Fighting",
		card:    "Card Game",
		triv:    "Trivia/Board Game",
		comp:    "Compilation",
		minig:   "Minigame",
		flight:  "Flight",
		bllrd:   "Billiards",
		pinbl:   "Pinball",
		f2p:     "Free to Play",
	},
	tags:{
		single: "Single",
		lmulti: "Local Multiplayer",
		omulti: "Online Multiplayer",
		coop:   "Coop Multiplayer",
		comp:   "Competitive Multiplayer",
	}
}
translation.platformsR = reverseHash( translation.platforms )
translation.genresR = reverseHash( translation.genres )
translation.tagsR = reverseHash( translation.tags )

//console.log( "TRANSLATION", translation )
exports.translation = translation
*/

exports.createPrettyGet = function( category ) {
	return function(){
		var model = null
		switch( category ){
			case( 'platforms' ): model = app.staticModels.Platform._id ; break;
			case( 'tags' ): model = app.staticModels.Tag._id ; break;
			case( 'genres' ): model = app.staticModels.Genre._id ; break;
		}
		var tmp = this[category].map(function(e,i){
			// TODO remove this compability layer
			return model[e] ? model[e].name : '?'+e
		})
		return tmp.join(', ')
	}
}

exports.createPrettyGetWithLink = function( category ) {
	return function(){
		var model = null
		switch( category ){
			case( 'platforms' ): model = app.staticModels.Platform._id ; break;
			case( 'tags' ): model = app.staticModels.Tag._id ; break;
			case( 'genres' ): model = app.staticModels.Genre._id ; break;
		}
		var that = this
		var tmp = this[category].map(function(e,i){
			return '<a href="/game/'+e+'/'+that._id+'/" class="serp_link">'+(model[e] ? model[e].name : '?'+e)+'</a>'
		})
		return tmp.join(', ')
	}
}

//setTimeout(function(){ console.log('has store:', app.staticModels) }, 3000)

exports.toMemory = function( store, model, indexes ) {
	//if( typeof index !== 'string' )
	//	index = '_id'
	store[model.modelName] = {}
	var _order = 'order'
	
	
	model.find(function(err, docs){
		// this var holds all var objs, just so all indexes ref. the same Obj
		var docObjects = []
		docs.forEach(function(doc,i){
			docObjects.push( doc.toObject() )
		})
		indexes.forEach(function(key){
			store[model.modelName][key] = {}
			// sort by each index, so each index will be in order
			// 	WARN! sortBy run unique indexes; will discard repeated elements
			_.sortBy(docObjects, function(doc){ return( _order in doc ? doc.order : doc[key] ) }).forEach(function(doc){
				//console.log("order in doc?", _order in doc)
				store[model.modelName][key][doc[key]] = doc
			})
		})
		//console.log("just memorized:", model.modelName, 'for keys:', indexes, 'got:', store[model.modelName] )
	})
	
	
	return true
}