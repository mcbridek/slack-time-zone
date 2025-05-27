const moment = require('moment-timezone');

// Common timezone aliases
const TIMEZONE_ALIASES = {
  'EST': 'America/New_York',
  'EDT': 'America/New_York',
  'CST': 'America/Chicago',
  'CDT': 'America/Chicago',
  'MST': 'America/Denver',
  'MDT': 'America/Denver',
  'PST': 'America/Los_Angeles',
  'PDT': 'America/Los_Angeles',
  'GMT': 'Europe/London',
  'UTC': 'UTC',
  'JST': 'Asia/Tokyo',
  'IST': 'Asia/Kolkata',
  'CET': 'Europe/Paris',
  'CEST': 'Europe/Paris'
};

// Popular timezones for suggestions
const POPULAR_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'UTC'
];

class TimezoneUtils {
  static resolveTimezone(input) {
    if (!input) return null;
    
    const upperInput = input.toUpperCase();
    
    // Check if it's an alias
    if (TIMEZONE_ALIASES[upperInput]) {
      return TIMEZONE_ALIASES[upperInput];
    }
    
    // Check if it's a valid timezone
    if (moment.tz.zone(input)) {
      return input;
    }
    
    return null;
  }

  static formatTime(timezone, preferences = {}) {
    const { timeFormat = '24h', dateFormat = 'YYYY-MM-DD', showSeconds = false } = preferences;
    
    let format = timeFormat === '12h' ? 'hh:mm A' : 'HH:mm';
    if (showSeconds) {
      format = format.replace(':mm', ':mm:ss');
    }
    
    const fullFormat = `${dateFormat} ${format} z`;
    return moment().tz(timezone).format(fullFormat);
  }

  static convertTime(timeStr, fromTz, toTz, inputFormat = 'HH:mm') {
    const fromTimezone = this.resolveTimezone(fromTz);
    const toTimezone = this.resolveTimezone(toTz);
    
    if (!fromTimezone || !toTimezone) {
      return null;
    }
    
    // Parse the time in the source timezone
    const sourceMoment = moment.tz(timeStr, inputFormat, fromTimezone);
    
    if (!sourceMoment.isValid()) {
      return null;
    }
    
    // Convert to target timezone
    return sourceMoment.tz(toTimezone);
  }

  static findBestMeetingTime(userTimezones, startHour = 9, endHour = 17) {
    if (userTimezones.size === 0) return null;
    
    const timeSlots = [];
    
    // Generate time slots for the next 7 days
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const baseTime = moment().add(day, 'days').hour(hour).minute(0).second(0);
        
        let validForAll = true;
        const timeDisplay = [];
        
        for (const [userId, userData] of userTimezones) {
          const userTime = baseTime.clone().tz(userData.timezone);
          const userHour = userTime.hour();
          
          if (userHour < startHour || userHour >= endHour || userTime.day() === 0 || userTime.day() === 6) {
            validForAll = false;
            break;
          }
          
          timeDisplay.push({
            userId,
            time: userTime.format('ddd HH:mm'),
            timezone: userData.timezone
          });
        }
        
        if (validForAll) {
          timeSlots.push({
            baseTime: baseTime.format('dddd, MMMM Do YYYY [at] HH:mm UTC'),
            userTimes: timeDisplay
          });
        }
        
        // Return first 5 good slots
        if (timeSlots.length >= 5) break;
      }
      if (timeSlots.length >= 5) break;
    }
    
    return timeSlots;
  }

  static getPopularTimezones() {
    return POPULAR_TIMEZONES;
  }

  static getAllTimezones() {
    return moment.tz.names();
  }

  static searchTimezones(query) {
    const allTimezones = this.getAllTimezones();
    const lowerQuery = query.toLowerCase();
    
    return allTimezones
      .filter(tz => tz.toLowerCase().includes(lowerQuery))
      .slice(0, 10);
  }
}

module.exports = TimezoneUtils;