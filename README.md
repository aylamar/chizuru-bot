# Chizuru Bot

Chizuru Bot is a Twitch notification bot that notifies Discord channels on status changes, which *might* have additional features added over time.

NOTE: Running from source is not recommended. Treat running from source as a nightly build where things may or may not work properly.
Releases *should* be stable and are reccommended to be used instead.

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

## Inviting Chizuru Bot

To invite Chiziru Bot to your server and have slash commands work, you'll need to ensure that the `applications.commands` scope is something that your Chizuru Bot has access to. Without it, slash commands will not appear on the server or work properly. You'll also want to make sure that `bot` is there as well, otherwise, Chizuru bot won't be in the server and will be unable to send messages back.

If you want to be lazy, you're welcome to use the following link. You'll just want to make sure to replace `<YOUR_BOT_CLIENT_id_here>` with your bot's client ID.

```bash
https://discord.com/oauth2/authorize?client_id=<YOUR_BOT_CLIENT_ID_HERE>&scope=bot+applications.commands&permissions=259846039632
```

## Commands

### /help

Lists all of the avaiable commands

### /addstream [stream]

Requires: the MANAGE_CHANNELS permission, and begins monitoring mentioned stream in the channel that the command was executed in.

### /deletestream [stream]

Requires: the MANAGE_CHANNELS permission, and stops tracking the mentioned stream in the channel that the command was executed in.

### /liststream [stream]

Lists all streams that are currently being monitored in this channel.

### /stats

Displays stats about the Chizuru Bot

### /kanye

Makes a call to [kanye.rest](https://kanye.rest/) to deliver a random Kanye quote.
