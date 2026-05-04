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
        await auth.currentUser.reload();
        location.reload();
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
        location.reload();
    } catch (err) {
        showError(err.message);
    }
}

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
    } catch {
        showError(err.message);
    }
}

//MISC
auth.onAuthStateChanged(user => {
    if (user) {
        const nameEl = document.getElementById("user-displayname");
        const emailEl = document.getElementById("user-email");
        const zipcodeEl = document.getElementById("user-zipcode");
        //const zipInput = document.getElementById("zip");
        const statusEl = document.getElementById("user-notification");
        const onBtn = document.getElementById("notif-btn-on");

        // anonymous users
        if (nameEl) nameEl.textContent = user.displayName || (user.isAnonymous ? "Guest" : "User");
        if (emailEl) emailEl.textContent = user.email || (user.isAnonymous ? "No email (Anonymous)" : "");

        db.collection("users").doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                const savedZip = doc.data().zipcode;
                //const zipInput = document.getElementById("zip");
                const data = doc.data();
                const hasToken = data.fcmToken;

                if (statusEl) {
                    statusEl.textContent = hasToken ? "On" : "Off";
                    //statusEl.style.color = hasToken ? "green" : "red";
                }

                if (onBtn) {
                    if (hasToken) {
                        onBtn.textContent = "Enabled";
                        onBtn.disabled = true;
                    } else {
                        onBtn.textContent = "Enabled";
                        onBtn.disabled = false;                    
                    }
                }

                if (zipcodeEl) {
                    zipcodeEl.textContent = savedZip || "None Saved";
                }
                
                //if (document.getElementById("user-zipcode")) {
                //    document.getElementById("user-zipcode").textContent = savedZip || "None Saved";
                //}

                // automatically load weather data if a zipcode is found
                //if (savedZip && zipInput && zipInput.value === "") {
                //    grab_location_data(savedZip); 
                //}
            } 

            // Check if the token field exists and is not empty
            //const hasToken = doc.data().fcmToken;
            //const notifStatusEl = document.getElementById("user-notification");

            //if (notifStatusEl) {
            //    notifStatusEl.textContent = hasToken ? "On" : "Off";
            //    notifStatusEl.style.color = hasToken ? "green" : "red";
            //}

            // Optional: Automatically disable the "Enable" button if already on
            //if (hasToken && document.getElementById("notif-btn-on")) {
            //    document.getElementById("notif-btn-on").textContent = "Enabled";
            //    document.getElementById("notif-btn-on").disabled = true;
            //}
                        
        });
    }
});


//checkout
function checkout(e) {
    if (e) e.preventDefault();
    try {
        alert("Order Recieved! Redirecting to profile")
        window.location.href = "profile.html" 
    } catch(err) {
        showError(err.message);
    }
}


console.log("Script Loaded!");