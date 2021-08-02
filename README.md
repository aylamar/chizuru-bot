# Chizuru Bot

Chizuru Bot is a Twitch notification bot that notifies Discord channels on status changes, which *might* have additional features added over time.

## Installation

1. Download a copy of the repository and unzip it somewhere.
2. Navigate to the `src` folder and rename `config.default.json` to `config.json`.
3. Fill out the `config.json` file.
4. run `npm run start` to launch the bot.

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
| discordToken       | Your bot token from the Discord developer portal    | ☑️        |
| prefix             | The prefix for any of this bot's commands           | ☑️        |
| channelID          | Channel ID to restrict the bot to                   |           |
| twitchClientID     | Your client ID from the Twitch developer portal     | ☑️        |
| twitchClientSecret | Your client secret from the Twitch developer portal | ☑️        |

## Commands

### !addstream [stream]

Begins monitoring mentioned stream in the channel that the command was executed in.

### !deletestream [stream]

Stops tracking the mentioned stream in the channel that the command was executed in.

### !liststream [stream]

Lists all streams that are currently being monitored in this channel.
