const { App, ExpressReceiver } = require("@slack/bolt");
require("dotenv").config();
const bodyParser = require("body-parser");
const { SlackEventType, SlackUserPresenceStatus } = require("./config");

// Create a Bolt Receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Create the Bolt App, using the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

/* to-do:
 - post message to app channel when snooze is on/off?
 - if snooze is already on when the user joins a meeting, do not overwrite it and do not unset when they leave meeting?
*/

// Slack interactions are methods on app
app.client.auth.test({ token: process.env.SLACK_USER_TOKEN }).then((res) => {
  // Find and store the slack app user's email
  const userId = res.user_id;
  app.client.users
    .info({ token: process.env.SLACK_USER_TOKEN, user: userId })
    .then((res) => {
      receiver.app.locals.userEmail = res.user.profile.email;
    });
});

// Other web requests are methods on receiver.router
receiver.router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      event = JSON.parse(req.body);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.event === SlackEventType.USER.PRESENCE_STATUS_UPDATED) {
      const { presence_status: currentPresenceStatus, email: currentEmail } =
        event.payload.object;

      if (
        currentEmail === receiver.app.locals.userEmail &&
        req.headers.authorization === process.env.ZOOM_VERIFICATION_TOKEN
      ) {
        if (currentPresenceStatus === SlackUserPresenceStatus.IN_MEETING) {
          console.log(`${currentEmail} joined a meeting`);
          // Store inMeeting: true in express app locals object so it persist within the application
          receiver.app.locals.inMeeting = true;
          app.client.dnd
            .setSnooze({
              token: process.env.SLACK_USER_TOKEN,
              // is_indefinite: true, // not working
              num_minutes: 120,
            })
            .then((res) =>
              console.log(
                `Set user slack snooze: ${res.snooze_enabled ? "✅" : "⚠️"}`
              )
            );
        } else if (
          (currentPresenceStatus === SlackUserPresenceStatus.AVAILABLE ||
            currentPresenceStatus === SlackUserPresenceStatus.OFFLINE ||
            currentPresenceStatus ===
              SlackUserPresenceStatus.IN_CALENDAR_EVENT) &&
          // Check if the user was in a meeting before
          receiver.app.locals.inMeeting
        ) {
          console.log(`${currentEmail} left a meeting`);
          receiver.app.locals.inMeeting = false;
          app.client.dnd
            .endSnooze({
              token: process.env.SLACK_USER_TOKEN,
            })
            .then((res) =>
              console.log(
                `End user slack snooze: ${res.snooze_enabled ? "⚠️" : "✅"}`
              )
            );
        }
      }
    }
  }
);

(async () => {
  const port = 3000;
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();