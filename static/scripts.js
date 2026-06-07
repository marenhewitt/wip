// FireBase KEEP AT TOP
const firebaseConfig = {
  apiKey: 'AIzaSyCyNONDPMTNmi9E_cUBf7qvYERwnUlJaec',
  authDomain: "weatherinsiderprep.firebaseapp.com",
  projectId: "weatherinsiderprep",
  storageBucket: "weatherinsiderprep.firebasestorage.app",
  messagingSenderId: "955489579251",
  appId: "1:955489579251:web:315c56fa69748aa24e4786",
  measurementId: "G-PXHE2HST1Q"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

//
function loadDoc(url, func){
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function(){
        if (xhttp.status != 200){
            console.log("Error");
        } else {
            func(xhttp.response);
        }
    }
    xhttp.open("GET", url);
    xhttp.send();
}

//PROFILE
function checkAccount(){ 
    const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        if (!user || user.isAnonymous) {
            alert("Create an account or login to view profile");
            window.location.href = '/login.html';
        } else {
            window.location.href = '/profile.html';
        }
    });
}

async function updateDisplayName(name) {
    try {
        const user = auth.currentUser;
        if (!name || name.trim() === '') {
            showError("Enter a display name");
            return;
        }
        
        await user.updateProfile({ displayName: name.trim() });
        await db.collection("users").doc(user.uid).set({ displayName: name.trim() }, { merge: true });
       
        const nameInput = document.getElementById('displayname');
        if (nameInput) nameInput.value = '';
           
    } catch (err) {
        showError(err.message);
    }
}

async function updateSavedZipcode(zip) {
    try {
        const user = auth.currentUser;
        if (!zip || zip.trim() === '') {
            showError("Enter a zipcode");
            return;
        }
        
        await db.collection("users").doc(user.uid).set({ zipcode: zip.trim() }, { merge: true });
        
        const zipInput = document.getElementById('zipcode');
        if (zipInput) zipInput.value = '';
    } catch(err){
        showError(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  const hourSelect = document.getElementById('time-hour');
  const minSelect = document.getElementById('time-min');
  const ampmSelect = document.getElementById('time-ampm');
  const hiddenInput = document.getElementById('notif-time');

  // Guard clause: make sure these elements exist on the current page before adding listeners
  if (!hourSelect || !minSelect || !ampmSelect || !hiddenInput) return;

  async function updateAndSaveTime() {
    let hour = parseInt(hourSelect.value, 10);
    const min = minSelect.value;
    const ampm = ampmSelect.value;

    // Convert 12-hour selection to standard 24-hour HH:MM format
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const formattedHour = String(hour).padStart(2, '0');
    const timeValue = `${formattedHour}:${min}`;
    
    // 1. Update the local hidden input value
    hiddenInput.value = timeValue;

    // 2. Save the time value directly into the user's Firestore document
    try {
        const user = auth.currentUser;
        if (user) {
            await db.collection("users").doc(user.uid).set({ 
                notifTime: timeValue 
            }, { merge: true });
            console.log("Time preference updated to:", timeValue);
        }
    } catch (err) {
        showError("Failed to save time preference: " + err.message);
    }
  }

  // Bind the change event listeners to auto-save adjustments
  hourSelect.addEventListener('change', updateAndSaveTime);
  minSelect.addEventListener('change', updateAndSaveTime);
  ampmSelect.addEventListener('change', updateAndSaveTime);
});

//LOGIN
//function showError(msg) {
  //  document.getElementById("error-msg").textContent = msg;
//}
function showError(msg) {
    const errEl = document.getElementById("error-msg");
    if (errEl) {
        errEl.textContent = msg;
    } else {
        alert(msg);
    }
}

//go to new page
//input email and 2 password fields 
//popup confirm account creation then redirect to home
async function handleCreateAccount(e) {
    e.preventDefault();
    showError('');

    const email = document.getElementById("email").value;
    const displayname = document.getElementById("display").value;
    const zipcode = document.getElementById("zip").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password2").value;

    if (password.length < 6) { 
        alert("Password too weak. Password should be at least 6 characters");
        return;
    }

    if (password != confirmPassword) {
        alert("Passwords do not match. Try again.");
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await db.collection("users").doc(user.uid).set({
            displayName: displayname,
            email: email,
            zipcode: zipcode,
            createdAt: new Date()
        });

        window.location.href = "index.html";
    } catch (err) {
        showError(err.message);
    }

}

async function handleEmailPasswordSubmit(e){
    e.preventDefault();
    showError('');

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = "index.html";
    } catch (err) {
        showError(err.message);
    }
}

async function handleGoogleSignIn() {
    showError('');
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const email = user.email; 

        await db.collection("users").doc(user.uid).set({
            displayName: "New User",
            zipcode: "00501",
            email: email,
            createdAt : new Date()
        });

        window.location.href = "index.html";

    } catch(err) {
        showError(err.message);
    }
}

async function handleAnonSignIn() {
    showError('');

    try {
        await auth.signInAnonymously();
        window.location.href = "index.html";    
    } catch(err) {
        showError(err.message);
    }
}

async function logout() {
    try {
        firebase.auth().signOut();
    } catch(err) {
        showError(err.message);
    }
}

auth.onAuthStateChanged(user => {
    if (user) {
        const nameEl = document.getElementById("user-displayname");
        const emailEl = document.getElementById("user-email");
        const zipcodeEl = document.getElementById("user-zipcode");
        const statusEl = document.getElementById("user-notification");
        const onBtn = document.getElementById("notif-btn-on");
        const displayTimeEl = document.getElementById("display-notif-time");

        if (nameEl) nameEl.textContent = user.displayName || (user.isAnonymous ? "Guest" : "User");
        if (emailEl) emailEl.textContent = user.email || (user.isAnonymous ? "No email (Anonymous)" : "");

        db.collection("users").doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                const savedZip = doc.data().zipcode;
                const savedName = data.displayName;
                const hasToken = data.fcmToken;
                const savedTime = data.notifTime;

                if (nameEl) nameEl.textContent = savedName || user.displayName || (user.isAnonymous ? "Guest" : "User");
                if (zipcodeEl) zipcodeEl.textContent = savedZip || "None Saved";
                if (statusEl) statusEl.textContent = hasToken ? "On" : "Off";
                
                if (onBtn) {
                    if (hasToken) {
                        onBtn.textContent = "Enabled";
                        onBtn.disabled = true;
                    } else {
                        onBtn.textContent = "Enable";
                        onBtn.disabled = false;                    
                    }
                }

                if (zipcodeEl) zipcodeEl.textContent = savedZip || "None Saved";
            
                if (savedTime){
                    const hiddenInput = document.getElementById("notif-time");
                    const hourSelect = document.getElementById("time-hour");
                    const minSelect = document.getElementById("time-min");
                    const ampmSelect = document.getElementById("time-ampm");
                
                    if (hiddenInput) hiddenInput.value = savedTime;

                    if (displayTimeEl) {
                        const [h, m] = savedTime.split(':');
                        let hr = parseInt(h, 10);
                        let suff = hr >= 12 ? 'PM' : 'AM';
                        hr = hr % 12 || 12;
                        displayTimeEl.textContent = `${hr}:${m} ${suff}`;
                    }

                    const [hhStr, mmStr] = savedTime.split(':');
                    let rawHour = parseInt(hhStr, 10);
                    let ampm = 'AM';

                    if (rawHour >= 12) {
                        ampm = 'PM';
                        if (rawHour > 12) rawHour -= 12;
                    } else if (rawHour === 0) {
                        rawHour = 12;
                    }

                    const formattedHourStr = String(rawHour).padStart(2, '0');

                    if (hourSelect && hourSelect.value !== formattedHourStr) hourSelect.value = formattedHourStr;
                    if (minSelect && minSelect.value !== mmStr) minSelect.value = mmStr;
                    if (ampmSelect && ampmSelect.value !== ampm) ampmSelect.value = ampm;
                }
            } 
        });

    } else {
        const signedOutMsg = document.getElementById("signed-out-msg");
        const signedInContent = document.getElementById("signed-in-content");
        if (signedOutMsg) signedOutMsg.style.display = 'block';
        if (signedInContent) signedInContent.style.display = 'none';
    }
});


//checkout
function checkout(e) {
    if (e) e.preventDefault();
    try {
        alert('WIP is currently not taking orders. Apologies for the inconvenience.');
    } catch(err) {
        showError(err.message);
    }
}


console.log("Script Loaded!");