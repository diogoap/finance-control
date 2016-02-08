(function() {
	$(window).load(function(){
		$('.navbar-collapse a').click(function(){
			$(".navbar-collapse").collapse('hide');
		});

		$('.navbar-header a').click(function(){
			$(".navbar-collapse").collapse('hide');
		});
	});

	$(window).ready(function(){
		$('.date-mask').mask("00/00/00");
	});

	// ServiceWorker is a progressive technology. Ignore unsupported browsers
	if ('serviceWorker' in navigator) {
		console.log('CLIENT: service worker registration in progress.');

		navigator.serviceWorker.register('/js/serviceWorker.js').then(function() {
			console.log('CLIENT: service worker registration complete.');
		}, function() {
			console.log('CLIENT: service worker registration failure.');
		});
	} else {
		console.log('CLIENT: service worker is not supported.');
	}

})();
