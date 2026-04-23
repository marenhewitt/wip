import { getMessaging, getToken } from "firebase/messaging";

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyCyNONDPMTNmi9E_cUBf7qvYERwnUlJaec',
  authDomain: "weatherinsiderprep.firebaseapp.com",
  projectId: "weatherinsiderprep",
  storageBucket: "weatherinsiderprep.firebasestorage.app",
  messagingSenderId: "955489579251",
  appId: "1:955489579251:web:315c56fa69748aa24e4786",
  measurementId: "G-PXHE2HST1Q"
});

const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, (payload) => {

   console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };
  self.registration.showNotification(notificationTitle,  notificationOptions).then(() => {
    console.log("Notification Complete")
  }).catch(error => {
    console.log(error)
  });
})

getToken(messaging, { vapidKey: '<YOUR_PUBLIC_VAPID_KEY_HERE>' }).then((currentToken) => {
  if (currentToken) {
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});