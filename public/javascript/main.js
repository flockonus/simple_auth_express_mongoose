j = jQuery;
(function() {
	
	if (typeof GW === 'undefined') {
		window.GW = {}
	};
	
	GW.Main = {}
	
	
	GW.Main.loginCallback = function( nick ){
		j('#notice').text('Welcome!')
		j('nav .popup').remove()
		j('nav').prepend(nick)
	}
	
	GW.Main.providerRedirect = function( url ) {
		window.location.href = url+'/to'
	};
	
	GW.Main.onLoad = function() {
		// http://swip.codylindley.com/DOMWindowDemo.html
		$('.popup').openDOMWindow({ 
			eventType:'click',
			windowSource:'iframe',
			loader:1,
			loaderImagePath:'/icons/ajax-loader.gif', 
			loaderHeight:16,
			loaderWidth:17,
			windowPadding: 5,
			modal: false,
			height: 380,
		}); 
	};
	
})()

$(document).ready(GW.Main.onLoad)
