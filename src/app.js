const { App } = require('@slack/bolt');
const moment = require('moment-timezone');
const TimezoneStorage = require('./storage');
const TimezoneUtils = require('./timezone-utils');
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

// Helper function to get current time in timezone with user preferences
async function getCurrentTime(timezone, userId = null) {
  let preferences = { timeFormat: '24h', dateFormat: 'YYYY-MM-DD', showSeconds: false };
  if (userId) {
    preferences = await storage.getPreferences(userId);
  }
  return TimezoneUtils.formatTime(timezone, preferences);
}

// Helper function to format timezone display
async function formatTimezoneDisplay(userId, timezone, displayName) {
  const currentTime = await getCurrentTime(timezone, userId);
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

  const timezonePromises = Array.from(userTimezones.entries())
    .map(async ([userId, data]) => await formatTimezoneDisplay(userId, data.timezone, data.displayName));
  const timezoneList = (await Promise.all(timezonePromises)).join('\n');

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
      text: 'Please provide a timezone. Example: `/timezone-set America/New_York` or `/timezone-set EST`',
      response_type: 'ephemeral'
    });
    return;
  }

  // Resolve timezone (handles aliases)
  const resolvedTimezone = TimezoneUtils.resolveTimezone(timezone);
  if (!resolvedTimezone) {
    const suggestions = TimezoneUtils.searchTimezones(timezone).slice(0, 5);
    let errorText = `Invalid timezone "${timezone}". Please use a valid timezone.`;
    if (suggestions.length > 0) {
      errorText += `\n\nDid you mean one of these?\n${suggestions.join('\n')}`;
    }
    await respond({
      text: errorText,
      response_type: 'ephemeral'
    });
    return;
  }

  await storage.set(command.user_id, {
    timezone: resolvedTimezone,
    displayName: resolvedTimezone.split('/').pop().replace(/_/g, ' ')
  });

  const currentTime = await getCurrentTime(resolvedTimezone, command.user_id);
  await respond({
    text: `Your timezone has been set to ${resolvedTimezone}. Current time: ${currentTime}`,
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

  const timePromises = Array.from(userTimezones.entries())
    .map(async ([userId, data]) => await formatTimezoneDisplay(userId, data.timezone, data.displayName));
  const timeList = (await Promise.all(timePromises)).join('\n');

  await respond({
    text: `Current Times:\n${timeList}`,
    response_type: 'in_channel'
  });
});

// Slash command: /timezone-convert - Convert time between timezones
app.command('/timezone-convert', async ({ command, ack, respond }) => {
  await ack();
  
  const args = command.text.trim().split(/\s+/);
  if (args.length < 3) {
    await respond({
      text: 'Usage: `/timezone-convert <time> <from-timezone> <to-timezone>`\\nExample: `/timezone-convert 14:30 EST PST`',
      response_type: 'ephemeral'
    });
    return;
  }

  const [timeStr, fromTz, toTz] = args;
  const convertedTime = TimezoneUtils.convertTime(timeStr, fromTz, toTz);
  
  if (!convertedTime) {
    await respond({
      text: 'Invalid time format or timezone. Please check your input and try again.',
      response_type: 'ephemeral'
    });
    return;
  }

  const fromTimezone = TimezoneUtils.resolveTimezone(fromTz);
  const toTimezone = TimezoneUtils.resolveTimezone(toTz);
  
  await respond({
    text: `🕐 Time Conversion:\\n${timeStr} in ${fromTimezone} = ${convertedTime.format('HH:mm')} in ${toTimezone}\\n\\nFull times:\\n• From: ${convertedTime.tz(fromTimezone).format('dddd, MMMM Do YYYY [at] HH:mm z')}\\n• To: ${convertedTime.format('dddd, MMMM Do YYYY [at] HH:mm z')}`,
    response_type: 'ephemeral'
  });
});

// Slash command: /timezone-meeting - Find best meeting times
app.command('/timezone-meeting', async ({ command, ack, respond }) => {
  await ack();
  
  const userTimezones = await storage.getAll();
  
  if (userTimezones.size === 0) {
    await respond({
      text: 'No timezones registered yet. Use `/timezone-set <timezone>` to register timezones first.',
      response_type: 'ephemeral'
    });
    return;
  }

  const bestTimes = TimezoneUtils.findBestMeetingTime(userTimezones);
  
  if (!bestTimes || bestTimes.length === 0) {
    await respond({
      text: 'No suitable meeting times found within business hours (9 AM - 5 PM) for all team members.',
      response_type: 'ephemeral'
    });
    return;
  }

  let response = '📅 **Best Meeting Times (Business Hours 9-17):**\\n\\n';
  bestTimes.forEach((slot, index) => {
    response += `**Option ${index + 1}:** ${slot.baseTime}\\n`;
    slot.userTimes.forEach(userTime => {
      response += `• <@${userTime.userId}>: ${userTime.time} (${userTime.timezone})\\n`;
    });
    response += '\\n';
  });

  await respond({
    text: response,
    response_type: 'in_channel'
  });
});

// Slash command: /timezone-list - Show available timezones
app.command('/timezone-list', async ({ command, ack, respond }) => {
  await ack();
  
  const query = command.text.trim();
  
  if (query) {
    // Search for specific timezones
    const results = TimezoneUtils.searchTimezones(query);
    if (results.length === 0) {
      await respond({
        text: `No timezones found matching "${query}". Try a different search term.`,
        response_type: 'ephemeral'
      });
      return;
    }
    
    await respond({
      text: `🌍 Timezones matching "${query}":\\n${results.join('\\n')}`,
      response_type: 'ephemeral'
    });
  } else {
    // Show popular timezones
    const popular = TimezoneUtils.getPopularTimezones();
    await respond({
      text: `🌍 **Popular Timezones:**\\n${popular.join('\\n')}\\n\\n💡 *Tip: Use \`/timezone-list <search>\` to search for specific timezones*`,
      response_type: 'ephemeral'
    });
  }
});

// Slash command: /timezone-preferences - Set user preferences
app.command('/timezone-preferences', async ({ command, ack, respond }) => {
  await ack();
  
  const args = command.text.trim().split(/\s+/);
  
  if (args.length === 0 || args[0] === '') {
    // Show current preferences
    const preferences = await storage.getPreferences(command.user_id);
    await respond({
      text: `⚙️ **Your Timezone Preferences:**\\n• Time Format: ${preferences.timeFormat}\\n• Date Format: ${preferences.dateFormat}\\n• Show Seconds: ${preferences.showSeconds}\\n\\n**Usage:**\\n\`/timezone-preferences timeFormat 12h\` or \`24h\`\\n\`/timezone-preferences dateFormat YYYY-MM-DD\` or \`MM/DD/YYYY\`\\n\`/timezone-preferences showSeconds true\` or \`false\``,
      response_type: 'ephemeral'
    });
    return;
  }

  if (args.length < 2) {
    await respond({
      text: 'Usage: `/timezone-preferences <setting> <value>`\\nSettings: timeFormat, dateFormat, showSeconds',
      response_type: 'ephemeral'
    });
    return;
  }

  const [setting, value] = args;
  const preferences = {};

  switch (setting.toLowerCase()) {
    case 'timeformat':
      if (!['12h', '24h'].includes(value)) {
        await respond({
          text: 'Time format must be either "12h" or "24h"',
          response_type: 'ephemeral'
        });
        return;
      }
      preferences.timeFormat = value;
      break;
    case 'dateformat':
      if (!['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'].includes(value)) {
        await respond({
          text: 'Date format must be "YYYY-MM-DD", "MM/DD/YYYY", or "DD/MM/YYYY"',
          response_type: 'ephemeral'
        });
        return;
      }
      preferences.dateFormat = value;
      break;
    case 'showseconds':
      if (!['true', 'false'].includes(value.toLowerCase())) {
        await respond({
          text: 'Show seconds must be either "true" or "false"',
          response_type: 'ephemeral'
        });
        return;
      }
      preferences.showSeconds = value.toLowerCase() === 'true';
      break;
    default:
      await respond({
        text: 'Unknown setting. Available settings: timeFormat, dateFormat, showSeconds',
        response_type: 'ephemeral'
      });
      return;
  }

  await storage.setPreferences(command.user_id, preferences);
  
  await respond({
    text: `✅ Preference updated: ${setting} = ${value}`,
    response_type: 'ephemeral'
  });
});

// Slash command: /timezone-reminder - Set timezone change reminders
app.command('/timezone-reminder', async ({ command, ack, respond }) => {
  await ack();
  
  const args = command.text.trim().split(/\s+/);
  
  if (args.length === 0 || args[0] === '') {
    await respond({
      text: '⏰ **Timezone Reminders**\\n\\nSet reminders for daylight saving time changes:\\n\`/timezone-reminder enable\` - Enable DST reminders\\n\`/timezone-reminder disable\` - Disable DST reminders\\n\`/timezone-reminder status\` - Check current status',
      response_type: 'ephemeral'
    });
    return;
  }

  const action = args[0].toLowerCase();
  const userData = await storage.get(command.user_id) || {};
  
  switch (action) {
    case 'enable':
      await storage.setPreferences(command.user_id, { dstReminders: true });
      await respond({
        text: '✅ Timezone change reminders enabled. You\\'ll be notified about daylight saving time changes.',
        response_type: 'ephemeral'
      });
      break;
    case 'disable':
      await storage.setPreferences(command.user_id, { dstReminders: false });
      await respond({
        text: '❌ Timezone change reminders disabled.',
        response_type: 'ephemeral'
      });
      break;
    case 'status':
      const preferences = await storage.getPreferences(command.user_id);
      const status = preferences.dstReminders ? 'enabled' : 'disabled';
      await respond({
        text: `⏰ Timezone reminders are currently **${status}**.`,
        response_type: 'ephemeral'
      });
      break;
    default:
      await respond({
        text: 'Usage: `/timezone-reminder <enable|disable|status>`',
        response_type: 'ephemeral'
      });
  }
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