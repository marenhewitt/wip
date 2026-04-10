import { db } from "firebase.js";
import { collection, addDoc } from "firebase/firestore";

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


//LOGIN
let email = '';
let password = '';
let isSignUp = false;
let error = '';
let loading = false;

async function handleEmailPasswordSubmit(e){
    e.preventDefault();
    error = '';
    loading = true;

    try {
        if (isSignUp){
            await createUserWithEmailAndPassword(auth, email, password);
        } else {
            await signInUserWithEmailAndPassword(auth, email, password);
        }
    } catch (err) {
        error = err.message;
    } finally {
        loading = false;
    }
}

async function handleGoogleSignIn() {
    error = '';
    loading = true;
    const provider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, provider);
    } catch(err) {
        error = err.message;
    } finally {
        loading = false;
    }
}

async function handleAnonSignIn() {
    error = '';
    loading = true;
     provider = new GoogleAuthProvider();

    try {
        await signInAnonymously(auth);
    } catch(err) {
        error = err.message;
    } finally {
        loading = false;
    }
}

console.log("Script Loaded!");