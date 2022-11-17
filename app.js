const { App, ExpressReceiver } = require("@slack/bolt");
require("dotenv").config();
const bodyParser = require("body-parser");
const { ZoomEventType, ZoomUserPresenceStatus } = require("./config");

// Create a Bolt Receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Create the Slack Bolt App, using the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

/* to-do:
 - post message to app channel when snooze is on/off?
*/

const userToken = { token: process.env.SLACK_USER_TOKEN };

// Slack interactions are methods on app
app.client.auth.test(userToken).then((res) => {
  // Find and store the Slack app user's email
  const userId = res.user_id;
  app.client.users.info({ ...userToken, user: userId }).then((res) => {
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

    if (event.event === ZoomEventType.USER.PRESENCE_STATUS_UPDATED) {
      const { presence_status: currentPresenceStatus, email: currentEmail } =
        event.payload.object;

      if (
        currentEmail === receiver.app.locals.userEmail &&
        req.headers.authorization === process.env.ZOOM_VERIFICATION_TOKEN
      ) {
        if (currentPresenceStatus === ZoomUserPresenceStatus.IN_MEETING) {
          console.log(`${currentEmail} joined a Zoom meeting`);

          // Shim to filter out consecutive in-meeting status getting reported (Zoom glitch)
          if (receiver.app.locals.inMeeting) return;

          // Store in meeting status in express app via locals, so it persist within the application
          receiver.app.locals.inMeeting = true;

          // If the user already has DND turned on, do not overwrite it
          app.client.dnd.info(userToken).then((res) => {
            receiver.app.locals.alreadySnoozed = res.snooze_enabled;
            if (res.snooze_enabled) return;
            app.client.dnd
              .setSnooze({
                ...userToken,
                // is_indefinite: true, // not working
                num_minutes: 120,
              })
              .then((res) =>
                console.log(
                  `Slack snooze ON: ${res.snooze_enabled ? "✅" : "⚠️"}`
                )
              );
          });
        } else if (
          (currentPresenceStatus === ZoomUserPresenceStatus.AVAILABLE ||
            currentPresenceStatus === ZoomUserPresenceStatus.OFFLINE ||
            currentPresenceStatus ===
              ZoomUserPresenceStatus.IN_CALENDAR_EVENT) &&
          // Check if the user was in a meeting before
          receiver.app.locals.inMeeting
        ) {
          console.log(`${currentEmail} left a Zoom meeting`);
          receiver.app.locals.inMeeting = false;

          // If the user had DND on before joining the meeting, do not turn it off
          if (receiver.app.locals.alreadySnoozed) return;

          app.client.dnd
            .endSnooze(userToken)
            .then((res) =>
              console.log(
                `Slack snooze OFF: ${res.snooze_enabled ? "⚠️" : "✅"}`
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
