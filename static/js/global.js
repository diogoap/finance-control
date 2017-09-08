(function() {
	$(window).on('load', function(){
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
		navigator.serviceWorker.register('serviceWorker.js').then(function() {
		}, function() {
			console.log('CLIENT: service worker registration failure.');
		});
	} else {
		console.log('CLIENT: service worker is not supported.');
	}

})();
