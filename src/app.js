const { App } = require('@slack/bolt');
const moment = require('moment-timezone');
const TimezoneStorage = require('./storage');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// Persistent storage for user timezones
const storage = new TimezoneStorage();

// Helper function to get current time in timezone
function getCurrentTime(timezone) {
  return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss z');
}

// Helper function to format timezone display
function formatTimezoneDisplay(userId, timezone, displayName) {
  const currentTime = getCurrentTime(timezone);
  return `<@${userId}> (${displayName || timezone}): ${currentTime}`;
}

// Slash command: /timezone - Show all team timezones
app.command('/timezone', async ({ command, ack, respond }) => {
  await ack();
  
  const userTimezones = await storage.getAll();
  
  if (userTimezones.size === 0) {
    await respond({
      text: 'No timezones registered yet. Use `/timezone-set <timezone>` to register your timezone.',
      response_type: 'ephemeral'
    });
    return;
  }

  const timezoneList = Array.from(userTimezones.entries())
    .map(([userId, data]) => formatTimezoneDisplay(userId, data.timezone, data.displayName))
    .join('\n');

  await respond({
    text: `Team Timezones:\n${timezoneList}`,
    response_type: 'in_channel'
  });
});

// Slash command: /timezone set - Set your timezone
app.command('/timezone-set', async ({ command, ack, respond }) => {
  await ack();
  
  const timezone = command.text.trim();
  if (!timezone) {
    await respond({
      text: 'Please provide a timezone. Example: `/timezone-set America/New_York`',
      response_type: 'ephemeral'
    });
    return;
  }

  // Validate timezone
  if (!moment.tz.zone(timezone)) {
    await respond({
      text: `Invalid timezone "${timezone}". Please use a valid timezone like "America/New_York", "Europe/London", etc.`,
      response_type: 'ephemeral'
    });
    return;
  }

  await storage.set(command.user_id, {
    timezone: timezone,
    displayName: timezone.split('/').pop().replace(/_/g, ' ')
  });

  await respond({
    text: `Your timezone has been set to ${timezone}. Current time: ${getCurrentTime(timezone)}`,
    response_type: 'ephemeral'
  });
});

// Slash command: /time - Quick time check for all zones
app.command('/time', async ({ command, ack, respond }) => {
  await ack();
  
  const userTimezones = await storage.getAll();
  
  if (userTimezones.size === 0) {
    await respond({
      text: 'No timezones registered yet. Use `/timezone-set <timezone>` to register your timezone.',
      response_type: 'ephemeral'
    });
    return;
  }

  const timeList = Array.from(userTimezones.entries())
    .map(([userId, data]) => formatTimezoneDisplay(userId, data.timezone, data.displayName))
    .join('\n');

  await respond({
    text: `Current Times:\n${timeList}`,
    response_type: 'in_channel'
  });
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack Timezone Bot is running!');
  } catch (error) {
    console.error('Failed to start app:', error);
  }
})();