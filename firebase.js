// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyNONDPMTNmi9E_cUBf7qvYERwnUlJaec",
  authDomain: "weatherinsiderprep.firebaseapp.com",
  projectId: "weatherinsiderprep",
  storageBucket: "weatherinsiderprep.firebasestorage.app",
  messagingSenderId: "955489579251",
  appId: "1:955489579251:web:315c56fa69748aa24e4786",
  measurementId: "G-PXHE2HST1Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);