import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();

getToken(messaging, {vapidKey: "BC84xt4kNQgj1s3qzje7wuD5ZHjJ2SNMFlxzi2YTiRgCO3GlWEHxE8VE7F-_5CC0CNCChv9yyoSGTnS8kCoUwwM"});

function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
        console.log('Notification permission granted.');
    }
    })
}