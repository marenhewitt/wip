import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();
require('dotenv').config();
const vapidKey = process.env.VAPID_KEY;

getToken(messaging, {vapidKey: vapidKey});

function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
        console.log('Notification permission granted.');
    }
    })
}