const fetchUser = async () => {
  const url = `https://randomuser.me/api/`;
  const response = await fetch(url);
  return response.json();
};
async function main () {
	if (!'serviceWorker' in navigator) {
		return false;
	}
	navigator.serviceWorker.register('/sw.js').then(function(registration) {
		console.log("Berhasil registrasi service worker dengan scope:", registration.scope);
	}).catch(function(err) { 
		console.log('registrasi gagal');
	});
	const users = await fetchUser();
	console.log(users);
	const registration = await navigator.serviceWorker.ready;
	if ('periodicSync' in registration) {
		const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
		console.log(status)
		if (status.state === 'granted') {
			try {
				await registration.periodicSync.register('news', { minInterval: 24 * 60 * 60 * 1000 });
				console.log('Periodic background sync registered!');
			} catch(e) {
				console.error(`Periodic background sync failed:\n${e}`);
			}
		}
	}
	Notification.requestPermission(function(status) {
		console.log('Notification permission status:', status);
	});
	if (Notification.permission == 'granted') {
		navigator.serviceWorker.getRegistration().then(function(reg) {
		  var options = {
			body: 'Here is a notification body!',
			icon: 'images/android-chrome-192x192.png',
			data: {
			  dateOfArrival: Date.now(),
			  primaryKey: 1
			}
		  };
		  reg.showNotification('Hello world!', options);
		});
	}
}

main();