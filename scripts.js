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

function grab_location_data(){
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function(){
        if (xhttp.status != 200){
            console.log("Error");
        } else {
            grab_location_data_response(xhttp.response);
        }
    }

}

function grab_location_data_response(){
    location.reload();

    let divResuls = document.getElementById("divResults");

    temp = "test";

    divResuls.innerHTML = temp;
}



console.log("Script Loaded!");