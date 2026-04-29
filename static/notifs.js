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
                    //console.log("Saving token: ", user.uid);
                    await firebase.firestore().collection("users").doc(user.uid).set({
                        fcmToken: token
                    }, { merge: true });
                    
                    //document.getElementById("notif-btn-on").textContent = "Notifications Enabled";
                    //document.getElementById("notif-btn-on").disabled = true;
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

async function disableNotifs() {
    try {
        const messaging = firebase.messaging();
        
        // 1. Tell Firebase to invalidate this token
        await messaging.deleteToken();
        console.log("Token deleted from Firebase");

        // 2. Remove the token from the User's Firestore document
        const user = firebase.auth().currentUser;
        if (user) {
            await firebase.firestore().collection("users").doc(user.uid).update({
                fcmToken: firebase.firestore.FieldValue.delete()
            });
            
            alert("Notifications disabled.");
            
            // 3. Reset UI buttons
            document.getElementById("notif-btn-on").disabled = false;
            document.getElementById("notif-btn-on").textContent = "Enable";
        }
    } catch (err) {
        console.error("Error disabling notifications:", err);
    }
}