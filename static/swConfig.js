this.addEventListener('install', function(event) {
	console.log('addEventListener - install');
	event.waitUntil(
		caches.open('v2').then(function(cache) {
			return cache.addAll([
				'/css/',
				'/css/app.css',
				'/html/',
				'/images/',
				'/js/',
				'/index.html'
			]);
		})
	);
});

this.addEventListener('fetch', function(event) {
	console.log('addEventListener - fetch');

	var response;

	event.respondWith(caches.match(event.request).catch(function() {
		console.log('Hello from SW');
		return fetch(event.request);
	}).then(function(r) {
		response = r;
		caches.open('v2').then(function(cache) {
			cache.put(event.request, response);
		});
		return response.clone();
	}).catch(function() {
		return caches.match('/images/favicon.png');
	}));
});
