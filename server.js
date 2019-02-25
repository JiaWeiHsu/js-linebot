// Dependencies
const https = require("https");
const express = require("express");
const line = require("@line/bot-sdk");
const cf = require("config");
const { privateKey, certificate, ca } = require("./config/config.js");

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

// create LINE SDK config from env variables
const config = cf.get("bot");

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
        .then(result => res.json(result))
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {
    if (event.type !== "message" || event.message.type !== "text") {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // create a echoing text message
    const echo = { type: "text", text: event.message.text };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
}

// listen on port
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
    console.log("HTTPS Server running on port 443");
});
