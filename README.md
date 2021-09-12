# Chizuru Bot

Chizuru Bot is a multi-purpose Discord bot that was originally intended to notify when Twitch streams go live, but now offers additional commands and features.

## Commmands

- Twitch notifications: `addstream`, `delstream`, and `/liststreams`.
- Music: `play`, `skip`, `loop`, `nowplaying`, `shuffle`, and **4** more.
- Fun: `activity` and `kanye`.
- Search: `lookup` and `youtube`.

A full list of commands and how to use them can be found [here](https://github.com/aylamar/chizuru-bot/wiki/Commands).

## Installation

1. Download a release and unzip it somewhere on your computer.
2. Navigate to where you extracted the folder in command prompt or terminal and run `npm i` to install the dependencies.
3. Navigate to the `src` folder and rename `config.default.json` to `config.json`.
4. Fill out the `config.json` file.
5. Run `npm run deploy` to deploy the commands, or `npm run deployGuild` to clear global commands and deploy to a specific guild.
6. Run `npm run start` to launch the bot.

## Configuration

To configure this bot, rename the included `config.default.json` file to `config.json`, then enter in the values.

```json
{
    "guildID": "",
    "clientID": "",
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
| clientID           | The Client ID of your Discord bot                   | ☑️       |
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
