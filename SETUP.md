# Slack Timezone Bot Setup

## 1. Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From an app manifest"
3. Select your workspace
4. Copy and paste the contents of `slack-app-manifest.yaml`
5. Click "Create"

## 2. Get Required Tokens

After creating the app, you'll need these tokens:

### Bot Token (SLACK_BOT_TOKEN)
- Go to "OAuth & Permissions" in your app settings
- Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Signing Secret (SLACK_SIGNING_SECRET)
- Go to "Basic Information" in your app settings
- Copy the "Signing Secret" from the "App Credentials" section

### App Token (SLACK_APP_TOKEN)
- Go to "Basic Information" in your app settings
- Scroll down to "App-Level Tokens"
- Click "Generate Token and Scopes"
- Add the `connections:write` scope
- Copy the token (starts with `xapp-`)

## 3. Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your tokens:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
PORT=3000
```

## 4. Install and Run

```bash
npm install
npm run dev
```

## 5. Install App to Workspace

1. Go to "OAuth & Permissions" in your app settings
2. Click "Install to Workspace"
3. Authorize the app

## Available Commands

- `/timezone` - Show all team member timezones
- `/timezone-set <timezone>` - Set your timezone (e.g., `America/New_York`)
- `/time` - Quick time check for all zones