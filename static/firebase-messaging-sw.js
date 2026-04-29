importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCyNONDPMTNmi9E_cUBf7qvYERwnUlJaec',
  authDomain: "weatherinsiderprep.firebaseapp.com",
  projectId: "weatherinsiderprep",
  storageBucket: "weatherinsiderprep.firebasestorage.app",
  messagingSenderId: "955489579251",
  appId: "1:955489579251:web:315c56fa69748aa24e4786",
  measurementId: "G-PXHE2HST1Q"
});

const messaging = firebase.messaging();

// 3. Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title || 'Weather Update';
  const notificationOptions = {
    body: payload.notification.body || 'Check your daily forecast!',
    icon: '/static/images/cloud_icon.png' // Ensure this path is correct
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});