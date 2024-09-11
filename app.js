const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");

const admin = require("firebase-admin");

const { initializeApp, applicationDefault } = require("firebase-admin/app");

const { getMessaging } = require("firebase-admin/messaging");
const chunkArray = require("./util").chunkArray;
const { validationResult } = require("express-validator");

const serviceAccount = require("link_to_your_firebase_admin_sdk_json_file.json");

const app = express();
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Push new notifications using firebase

app.post("./", async (req, res, next) => {
  try {
    const { Msgtitle, MsgBody } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).json({ message: errors.array()[0].msg });
    }

    // Fetch your FCM token from DB. I am using MYSQL this time
    db.query(
      `SELECT DeviceToken FROM fcmtokens`,
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "An internal error occurred, please try again",
            error: err,
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            message: "No device is registered for notification",
          });
        }

        // Extract the tokens from the result
        const deviceTokens = result.map((row) => row.DeviceToken);

        // Split deviceTokens into chunks of 500
        const registrationTokenGroups = chunkArray(deviceTokens, 500);

        // Prepare a list to hold the promises of each notification sending request
        const notificationPromises = [];

        registrationTokenGroups.forEach((registrationTokens) => {
          const message = {
            notification: { title: Msgtitle, body: MsgBody },
            tokens: registrationTokens,
          };

          // Push the promise returned by sendMulticast into the array
          notificationPromises.push(
            getMessaging()
              .sendMulticast(message)
              .then((response) => {
                if (response.failureCount > 0) {
                  const failedTokens = [];
                  response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                      failedTokens.push(registrationTokens[idx]);
                    }
                  });
                  console.log(
                    "List of tokens that caused failures: " + failedTokens
                  );
                }
              })
              .catch((error) => {
                console.error("Error sending notifications:", error);
              })
          );
        });

        // Wait for all notification requests to finish
        await Promise.all(notificationPromises);

        // Send a single response after all notifications have been processed
        return res.status(200).json({
          message: "Notifications sent successfully",
        });
      }
    );
  } catch (err) {
    console.error("Ooops, Something went wrong:", err);

    return res.status(500).json({
      message: "Ooops, Something went wrong",
      error: err ? err.message : "Ooops, Something went wrong",
    });
  }
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
