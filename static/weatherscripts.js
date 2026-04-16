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