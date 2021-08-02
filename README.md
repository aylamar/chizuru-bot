# Chizuru Bot

Chizuru Bot is a Twitch notification bot that notifies Discord channels on status changes, which *might* have additional features added over time.

## Current plans

### Stop storing stream data in json files, move to mongodb using mongoose

Potential schema:
    - Streamer db with streamer as key, profile picture url, offline image url, and current state
    - Channel db with channel as id and all followed streamers

1. Iterate through streamer db pulling name (key), and previous state.
2. If state changed, pull profile picture url & offline image url if needed.
3. Generate embed based on new state
4. Get all channels with streamer in array & send embed to those channels

## Installation

1. Download a copy of the repository and unzip it somewhere.
2. Navigate to the `src` folder and rename `config.default.json` to `config.json`.
3. Fill out the `config.json` file.
4. Run `npm i` to install all dependencies.
5. Run `npm run start` to launch the bot.

## Configuration

To configure this bot, rename the included `config.default.json` file to `config.json`, then enter in the values.

```json
{
    "discordToken": "",
    "prefix": "!",
    "channelID": "",
    "twitchClientID": "",
    "twitchClientSecret": "",
}
```

Configuration option definitions:

| Key                | Description                                         | Required |
|--------------------|-----------------------------------------------------|----------|
| discordToken       | Your bot token from the Discord developer portal    | ☑️       |
| prefix             | The prefix for any of this bot's commands           | ☑️       |
| channelID          | Channel ID to restrict the bot to                   |          |
| twitchClientID     | Your client ID from the Twitch developer portal     | ☑️       |
| twitchClientSecret | Your client secret from the Twitch developer portal | ☑️       |

## Commands

### !addstream [stream]

Begins monitoring mentioned stream in the channel that the command was executed in.

### !deletestream [stream]

Stops tracking the mentioned stream in the channel that the command was executed in.

### !liststream [stream]

Lists all streams that are currently being monitored in this channel.
