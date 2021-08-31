var CACHE_NAME = 'my-site-cache';
var urlsToCache = [];

const fetchAndCache = async () => {
  const url = `https://randomuser.me/api/`;
  const response = await fetch(url);
  const responseNormalized = await getResponse(response);
  const cache = await caches.open('cache-news');
  await cache.put(url, responseNormalized);
};

const getResponse = async (response) => {
  const responseBody = await response.json();
  return new Response(JSON.stringify({ ...responseBody }));
};

self.addEventListener('install', function(event) {
	// Perform install steps
	console.log('[install] Kicking off service worker registration!');
	event.waitUntil(
		caches.open(CACHE_NAME)
		  .then(function(cache) {
			console.log('Opened cache');
			return fetch('/manifest.json').then(function(response) {
				return response.json(); // Once the contents are loaded, convert the raw text to a JavaScript object
			}).then(function(files) {
				console.log('[install] Adding files from JSON file: ', files); // this will log the cached json file
			})
			return cache.addAll(urlsToCache);
		  })
	);
});

self.addEventListener('activate', function(event) {
	console.log('Activate event')
	event.waitUntil(
		Promise.all(
		  caches.keys().then(cacheNames => {
			return cacheNames.map(name => {
			  if (name !== cacheStorageKey) {
				return caches.delete(name)
			  }
			})
		  })
		).then(() => {
		  console.log('Clients claims.')
		  return self.clients.claim()
		})
	)
});

self.addEventListener('fetch', function(event) {
	console.log("fecth listener");
	event.respondWith(
		caches.match(event.request)
		.then(
			(response)=>
			{
				if (response)
				{
					return response;
				}
				return fetch(event.request);
			}
		)
	)
});

self.addEventListener('periodicsync', function(event) {
	console.log("periodicsync listener");
	if (event.tag === 'news') {
		console.log('Fetching news in the background!');
		console.log(Notification.permission);
		event.waitUntil(fetchAndCache());
		// Notification.permission == 'granted'
		/*
		Notification.requestPermission(function(status) {
			console.log('Notification permission status:', status);
		});
		*/
	}
});