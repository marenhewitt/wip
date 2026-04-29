const VAPID_KEY = "BC84xt4kNQgj1s3qzje7wuD5ZHjJ2SNMFlxzi2YTiRgCO3GlWEHxE8VE7F-_5CC0CNCChv9yyoSGTnS8kCoUwwM";

async function notifsPerm() {
    console.log("Button clicked!");
    try {
        // 1. Request Permission first
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // 2. Register Service Worker explicitly
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Worker Registered');

            // 3. Get the Token using that registration
            const messaging = firebase.messaging();
            const token = await messaging.getToken({ 
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration 
            });
            
            if (token) {
                const user = firebase.auth().currentUser;
                if (user) {
                    await firebase.firestore().collection("users").doc(user.uid).set({
                        fcmToken: token
                    }, { merge: true });
                    
                    document.getElementById("notif-btn").textContent = "Notifications Enabled";
                    document.getElementById("notif-btn").disabled = true;
                    console.log("Token saved:", token);
                }
            }
        } else {
            alert("Permission was not granted.");
        }
    } catch (err) {
        console.error("Setup Error:", err);
    }
}