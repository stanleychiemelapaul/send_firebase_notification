# Firebase Push Notifications Service

This is a Node.js service that sends push notifications to registered devices using Firebase Cloud Messaging (FCM). The service retrieves FCM tokens from a MySQL database, and sends notifications to the devices in chunks of up to 500 tokens per multicast request, as per Firebase's limitations.

## Features

- **Express**: Used for setting up a REST API to handle requests.
- **Firebase Admin SDK**: Used to send push notifications through Firebase Cloud Messaging (FCM).
- **MySQL**: Fetches device tokens from a MySQL database.
- **Chunking**: Handles the maximum limit of 500 tokens per FCM multicast request by splitting large arrays of device tokens. The function has been added in the util.js [util.js](util.js)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js and npm.
- You have a Firebase project and access to its Firebase Admin SDK.
- You have a MySQL database with a table `fcmtokens` that stores the device tokens.
- You have the Firebase Admin SDK service account key (JSON format).

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/stanleychiemelapaul/send_firebase_notification.git
    cd send_firebase_notification
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Set up your MySQL database and ensure it contains a table named `fcmtokens` with the column `DeviceToken`.

4. Add your Firebase Admin SDK JSON file and update the reference in the code:

    ```javascript
    const serviceAccount = require("path/to/your-firebase-admin-sdk.json");
    ```

## Usage

1. Start the server:

    ```bash
    node index.js
    ```

2. Send a POST request to the server to push notifications:

    - **Endpoint**: `/`
    - **Method**: `POST`
    - **Request Body**:

      ```json
      {
        "Msgtitle": "Notification Title",
        "MsgBody": "Notification Body"
      }
      ```

3. The service will retrieve FCM tokens from your MySQL database, split them into chunks of 500, and send the notifications using Firebase.

## Error Handling

- The service will log failed FCM tokens in case of errors during the notification process.
- In case of internal server errors, the response will return a 500 status code with an error message.

## License

This project is open-source and available under the [MIT License](LICENSE).
