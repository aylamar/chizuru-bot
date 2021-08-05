# Chizuru Bot

Chizuru Bot is a Twitch notification bot that notifies Discord channels on status changes, which *might* have additional features added over time.

## Installation

1. Download a release and unzip it somewhere on your computer.
2. Navigate to where you extracted the folder in command prompt or terminal and run `npm i` to install the dependencies.
3. Navigate to the `src` folder and rename `config.default.json` to `config.json`.
4. Fill out the `config.json` file.
5. Run `npm run start` to launch the bot.

## Configuration

To configure this bot, rename the included `config.default.json` file to `config.json`, then enter in the values.

```json
{
    "guildID": "",
    "mongoURI": "",
    "discordToken": "",
    "twitchClientID": "",
    "twitchClientSecret": "",
}
```

Configuration option definitions:

| Key                | Description                                         | Required |
|--------------------|-----------------------------------------------------|----------|
| guildID            | The guild ID of your test server                    | ☑️       |
| discordToken       | Your bot token from the Discord developer portal    | ☑️       |
| mongoURI           | URL for mongoDB server with username & password     | ☑️       |
| twitchClientID     | Your client ID from the Twitch developer portal     | ☑️       |
| twitchClientSecret | Your client secret from the Twitch developer portal | ☑️       |

## Commands

### /help

Lists all of the avaiable commands

### /addstream [stream]

Requires: the MANAGE_CHANNELS permission, and begins monitoring mentioned stream in the channel that the command was executed in.

### /deletestream [stream]

Stops tracking the mentioned stream in the channel that the command was executed in.

### /liststream [stream]

Lists all streams that are currently being monitored in this channel.

### /stats

Displays stats about the Chizuru Bot
