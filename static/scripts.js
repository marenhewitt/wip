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

async function grab_location_data() {
    const zip = document.getElementById("zip").value;
    const divResults = document.getElementById("divResults");

    if (!zip) {
        divResults.innerHTML = "Please enter a zipcode.";
        return;
    }

    divResults.innerHTML = "Loading...";

    try {
        // Fetch from our Flask route with the zip as a query parameter
        const response = await fetch(`/get_weather?zip=${zip}`);
        const data = await response.json();

        if (data.error) {
            divResults.innerHTML = `Error: ${data.error}`;
        } else {
            // Display the data in the div
            divResults.innerHTML = `
                <h3>Current Weather</h3>
                <p>Temperature: ${data.temp}°F</p>
                <p>Feels Like: ${data.feels_like}°F</p>
                <p>Humidity: ${data.humidity}%</p>
                <small>Location: ${data.city_coords}</small>
            `;
        }
    } catch (err) {
        console.error(err);
        divResults.innerHTML = "Failed to fetch weather data.";
    }
}

function grab_location_data_response(){
    location.reload();

    let divResuls = document.getElementById("divResults");

    temp = "test";

    divResuls.innerHTML = temp;
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

//MISC
auth.onAuthStateChanged(user => {
    if (user) {
        const nameEl = document.getElementById("user-displayname");
        const emailEl = document.getElementById("user-email");
        const zipcodeEl = document.getElementById("user-zipcode");

        // Provide fallback text for Anonymous users
        if (nameEl) nameEl.textContent = user.displayName || (user.isAnonymous ? "Guest Traveler" : "User");
        if (emailEl) emailEl.textContent = user.email || (user.isAnonymous ? "No email (Anonymous)" : "");

        if (zipcodeEl) {
            db.collection("users").doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    zipcodeEl.textContent = doc.data().zipcode || "None saved";
                } else {
                    zipcodeEl.textContent = "None saved";
                }
            });
        }
    }
});

console.log("Script Loaded!");