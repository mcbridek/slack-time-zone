# Slack Timezone Bot

A Slack bot that helps teams coordinate across different time zones by tracking team member locations and displaying current times.

## Features

- **Set Your Timezone**: Use `/timezone-set <timezone>` to register your timezone with support for aliases like EST, PST
- **View Team Timezones**: Use `/timezone` to see all team member timezones and current times
- **Quick Time Check**: Use `/time` for a fast overview of current times across all registered zones
- **Time Conversion**: Convert times between any timezones with `/timezone-convert`
- **Meeting Planner**: Find optimal meeting times across all team timezones
- **Timezone Search**: Search and browse available timezones
- **User Preferences**: Customize time/date formats and display options
- **Smart Reminders**: Get notified about daylight saving time changes
- **Persistent Storage**: All user preferences and data persist across bot restarts

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/timezone-set <timezone>` | Set your timezone (supports aliases) | `/timezone-set America/New_York` or `/timezone-set EST` |
| `/timezone` | Show all team timezones | `/timezone` |
| `/time` | Quick time check for all zones | `/time` |
| `/timezone-convert <time> <from> <to>` | Convert time between timezones | `/timezone-convert 14:30 EST PST` |
| `/timezone-meeting` | Find best meeting times for team | `/timezone-meeting` |
| `/timezone-list [search]` | List/search available timezones | `/timezone-list` or `/timezone-list america` |
| `/timezone-preferences [setting] [value]` | Set display preferences | `/timezone-preferences timeFormat 12h` |
| `/timezone-reminder <action>` | Manage DST reminders | `/timezone-reminder enable` |

### Supported Timezone Aliases
- **EST/EDT** → America/New_York
- **CST/CDT** → America/Chicago  
- **MST/MDT** → America/Denver
- **PST/PDT** → America/Los_Angeles
- **GMT** → Europe/London
- **UTC** → UTC
- **JST** → Asia/Tokyo
- **IST** → Asia/Kolkata
- **CET/CEST** → Europe/Paris

### User Preferences
- **Time Format**: 12h or 24h display
- **Date Format**: YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY  
- **Show Seconds**: Include seconds in time display
- **DST Reminders**: Notifications for daylight saving changes

## Setup

### Prerequisites

- Node.js 16.0.0 or higher
- A Slack workspace where you can install apps
- Slack app with appropriate permissions (see setup guide)

### Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/mcbridek/slack-time-zone.git
   cd slack-time-zone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Follow the detailed setup instructions in [SETUP.md](./SETUP.md) to:
   - Create your Slack app
   - Get required tokens
   - Configure environment variables

4. Start the bot:
   ```bash
   npm run dev
   ```

## Configuration

Copy `.env.example` to `.env` and fill in your Slack app credentials:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
PORT=3000
```

## Docker Support

You can also run the bot using Docker:

```bash
docker-compose up -d
```

## Technology Stack

- **Framework**: Slack Bolt for JavaScript
- **Runtime**: Node.js
- **Timezone Handling**: Moment.js with timezone support
- **Storage**: File-based persistent storage
- **Container**: Docker support included

## Project Structure

```
├── src/
│   ├── app.js              # Main application and command handlers
│   ├── storage.js          # Persistent storage for user data and preferences
│   └── timezone-utils.js   # Timezone conversion utilities and aliases
├── SETUP.md               # Detailed setup instructions
├── Dockerfile             # Docker container configuration
├── docker-compose.yml     # Docker Compose setup
└── slack-app-manifest.yaml # Slack app configuration with all commands
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For setup help, see [SETUP.md](./SETUP.md). For issues or feature requests, please open an issue on GitHub.