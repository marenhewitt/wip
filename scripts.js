// FireBase KEEP AT TOP
// Your web app's Firebase configuration
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

async function grab_location_data(){
    //error checking for wrong zipcode format

}

function grab_location_data_response(){
    location.reload();

    let divResuls = document.getElementById("divResults");

    temp = "test";

    divResuls.innerHTML = temp;
}

//PROFILE
async function updateDisplayName(name) {
    try {
        const user = auth.currentUser;
        if (!user) {
            showError("No user is signed in");
            return;
        } 
        if (!name || name.trim() === '') {
            showError("Enter a display name");
            return;
        }
        
        await user.updateProfile({ displayName: name.trim() });
        await auth.currentUser.reload();
        console.log("Name Changed", auth.currentUser.displayName);
    } catch (err) {
        showError(err.message);
    }
}

async function updateSavedZipcode(zip) {
    try {
        const user = auth.currentUser;
        if (!user) {
            showError("No user is signed in");
            return;
        } 
        if (!zip || zip.trim() === '') {
            showError("Enter a zipcode");
            return;
        }
        
        await db.collection("users").doc(user.uid).set({ zipcode: zip.trim() }, { merge: true });
        console.log("Zip Changed", zip.trim());
    } catch (err) {
        showError(err.message);
    }
}

//LOGIN
function showError(msg) {
    document.getElementById("error-msg").textContent = msg;
}

//go to new page
//input email and 2 password fields 
//popup confirm account creation then redirect to home
async function handleCreateAccount(e) {
    e.preventDefault();
    showError('');

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log("Account Created");
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
        await auth.signInWithPopup(provider);
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

//MISC
auth.onAuthStateChanged(user => {
    if (user) {
        // Auto-fill any element with these ids if they exist on the page
        const nameEl = document.getElementById("user-displayname");
        const emailEl = document.getElementById("user-email");
        const zipcodeEl = document.getElementById("user-zipcode");

        if (nameEl) nameEl.textContent = user.displayName || "User";
        if (emailEl) emailEl.textContent = user.email || "";

        // Zipcode comes from Firestore
        if (zipcodeEl) {
            db.collection("users").doc(user.uid).get().then(doc => {
                if (doc.exists) zipcodeEl.textContent = doc.data().zipcode || "";
            });
        }
    }
});

console.log("Script Loaded!");