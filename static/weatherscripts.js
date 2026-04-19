async function grab_location_data(passedZip) {
    const zipInput = document.getElementById("zip").value;
    const divResults = document.getElementById("divResults");
    const zip = zipInput || passedZip;

    if (!zip) {
        divResults.innerHTML = "Please enter a zipcode.";
        return;
    }

    divResults.innerHTML = "Loading...";

    try {
        const response = await fetch(`/get_weather?zip=${zip}`);
        const data = await response.json();

        if (data.error) {
            divResults.innerHTML = `Error: ${data.error}`;
        } else {
            divResults.innerHTML = `
                <h3>Current Weather</h3>
                <p>Temperature: ${data.temp}°F</p>
                <p>Feels Like: ${data.feels_like}°F</p>
                <p>Humidity: ${data.humidity}%</p>
                <small>Location: ${data.city_coords}</small>
            `;
            document.getElementById("zip").value = "";
        }
    } catch (err) {
        console.error(err);
        divResults.innerHTML = "Failed to fetch weather data.";
    }
}

async function grab_default_data() {
    const divResults = document.getElementById("divResults");
    const user = auth.currentUser;

    if (!user || user.isAnonymous) {
        divResults.innerHTML = "Please <a href='/login.html'>login</a> to use your saved zipcode.";
        return;
    }

    divResults.innerHTML = "Loading...";

    try {
        const doc = await db.collection("users").doc(user.uid).get();

        if (!doc.exists || !doc.data().zipcode) {
            divResults.innerHTML = "No saved zipcode found in your profile.";
            return;
        }
        const savedZip = doc.data().zipcode;

        const response = await fetch(`/get_weather?zip=${savedZip}`);
        const data = await response.json();

        if (data.error) {
            divResults.innerHTML = `Error: ${data.error}`;
        } else {
            divResults.innerHTML = `
                <h3>Current Weather</h3>
                <p>Temperature: ${data.temp}°F</p>
                <p>Feels Like: ${data.feels_like}°F</p>
                <p>Humidity: ${data.humidity}%</p>
                <small>Location: ${data.city_coords}</small>`;
        }
    } catch (err) {
        console.error(err);
        divResults.innerHTML = "Failed to fetch weather data.";
    }
}