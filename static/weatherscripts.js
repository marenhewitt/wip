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
            document.getElementById('cards-container').style.display = 'flex';
            document.getElementById('weather-summary').innerHTML = `
                <p class="weather-feels" style="font-size: 1.2rem;">Invalid Zipcode</p>
                <p class="weather-temp">Please enter a valid US zip code</p>
            `;
            return;
        }
        
        divResults.innerHTML = `
            <h3>Current Weather</h3>
            <p>Time: ${new Date(data.current.time * 1000).toLocaleString()}</p>
            <p>Temperature: ${data.current.temp}°F</p>
            <p>Feels Like: ${data.current.feels_like}°F</p>
            <p>Humidity: ${data.current.humidity}%</p>
            <hr>
        `;

// next 5 hours / needs formatting to show time not elapsed
        let hourlyHtml = '<h4>Hourly Forecast</h4><ul>';
        for (let i = 0; i < 5; i++) {
            const time = data.hourly.times[i].split('T')[1].slice(0, 5);
            const temp = data.hourly.temp[i];
            hourlyHtml += `<li>${time}: ${temp}°F</li>`;
        }
        hourlyHtml += '</ul>';
        divResults.innerHTML += hourlyHtml;

// daily
        let dailyHtml = '<h4>Daily Forecast</h4><ul>';
        data.daily.dates.forEach((date, index) => {
            const day = new Date(date).toLocaleDateString();
            const max = data.daily.temp_max[index];
            const min = data.daily.temp_min[index];
            dailyHtml += `<li>${day}: High ${max}°F / Low ${min}°F</li>`;
        });
        dailyHtml += '</ul>';
        divResults.innerHTML += dailyHtml;
            
        document.getElementById("zip").value = "";
    

        // rec
        document.getElementById("cards-container").style.display = "flex";
        document.getElementById("weather-summary").innerHTML = `
            <p class="weather-feels">Feels like ${data.current.feels_like}°F</p>
            <p class="weather-temp">Actual ${data.current.temp}°F</p>
        `;
        updateRecommendation(data.current.feels_like, data.precip_prob);
    
    
    } catch (err) {
        console.error(err);
        divResults.innerHTML = "Failed to fetch weather data.";
    }
}

async function grab_default_data() {
    const divResults = document.getElementById("divResults");
    const user = auth.currentUser;

    if (!user || user.isAnonymous) {
        document.getElementById('cards-container').style.display = 'flex';
        document.getElementById('weather-summary').innerHTML = `
            <p class="weather-feels" style="font-size: 1.2rem;">Sign in for saved location</p>
            <a href="/login.html" style="color: #fff; font-weight: 600;">Login or create an account →</a>
        `;
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
                <p>Temperature: ${data.current.temp}°F</p>
                <p>Feels Like: ${data.current.feels_like}°F</p>
                <p>Humidity: ${data.current.humidity}%</p>
                <small>Location: ${data.city_coords}</small>`;
        }

        // rec
        document.getElementById("cards-container").style.display = "flex";
        document.getElementById("weather-summary").innerHTML = `
            <p class="weather-feels">Feels like ${data.current.feels_like}°F</p>
            <p class="weather-temp">Actual ${data.current.temp}°F</p>
        `;
        updateRecommendation(data.current.feels_like, data.precip_prob);

    } catch (err) {
        console.error(err);
        divResults.innerHTML = "Failed to fetch weather data.";
    }
}