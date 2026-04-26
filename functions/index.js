/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// 1. New v2 Imports
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// 2. The v2 Schedule Syntax
exports.dailyWeatherNotification = onSchedule("0 8 * * *", async (event) => {
    const db = admin.firestore();
    const usersSnap = await db.collection("users").get();
    const notifications = [];

    for (const doc of usersSnap.docs) {
        const userData = doc.data();
        const token = userData.fcmToken;
        const zip = userData.zipcode;

        if (token && zip) {
            try {
                // Fetching weather (replace with your actual API key)
                const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=YOUR_API_KEY&units=imperial`);
                const temp = Math.round(weatherRes.data.main.temp);
                const desc = weatherRes.data.weather[0].description;

                const message = {
                    notification: {
                        title: "Daily Weather Update",
                        body: `It's ${temp}°F with ${desc} in ${zip}.`,
                    },
                    token: token,
                };

                notifications.push(admin.messaging().send(message));
                logger.log(`Notification queued for user: ${doc.id}`);
            } catch (err) {
                logger.error(`Error for zip ${zip}:`, err);
            }
        }
    }

    // Wait for all messages to send
    await Promise.all(notifications);
    logger.log("All daily notifications processed.");
});