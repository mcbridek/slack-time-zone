# Slack Timezone Bot

A Slack bot that helps teams coordinate across different time zones by tracking team member locations and displaying current times.

## Features

- **Set Your Timezone**: Use `/timezone-set <timezone>` to register your timezone
- **View Team Timezones**: Use `/timezone` to see all team member timezones and current times
- **Quick Time Check**: Use `/time` for a fast overview of current times across all registered zones
- **Persistent Storage**: User timezone preferences are saved and persist across bot restarts

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/timezone-set <timezone>` | Set your timezone | `/timezone-set America/New_York` |
| `/timezone` | Show all team timezones | `/timezone` |
| `/time` | Quick time check for all zones | `/time` |

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
│   ├── app.js          # Main application and command handlers
│   └── storage.js      # Persistent storage for user timezones
├── SETUP.md           # Detailed setup instructions
├── Dockerfile         # Docker container configuration
├── docker-compose.yml # Docker Compose setup
└── slack-app-manifest.yaml # Slack app configuration
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