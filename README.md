# Chizuru Bot

Chizuru Bot is a multipurpose Discord bot that was originally intended to notify when Twitch streams go live, but now offers additional commands and features including the ability to have multiple starboards per server.

## Commands

- Twitch notifications: `stream add`, `stream remove`, and `stream list`.
- Music: `play`, `skip`, `loop`, `nowplaying`, `shuffle`, and **4** more.
- Fun: `gnome` and `kanye`.
- Search: `lookup` and `youtube`.
- Settings: `settings log`, `starboard create`, and **5** more. 
- Util: `ping`, `stats`
- Admin: `module`

A full list of commands and how to use them can be found [here](https://github.com/aylamar/chizuru-bot/wiki/Commands).

## Requirements

* [Node.js](https://nodejs.org/en/) v16.14.0 or newer
* [Postgres](https://www.postgresql.org/) v14 or newer
  * [DigitalOcean](https://www.digitalocean.com/) has a great tutorial on how to set up a Postgres database [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-20-04).
  * [DigitalOcean](https://www.digitalocean.com/products/managed-databases-postgresql/) also offers managed Postgres databases.
* [Discord Bot Token](https://discord.com/developers/applications)
  * [discord.js](https://discordjs.guide/) has a tutorial on how to create a bot application and get a token [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).
* [Twitch Client ID](https://dev.twitch.tv/console/apps)
  * [Twitch](https://dev.twitch.tv/docs/api/) has a tutorial on how to create a client ID and secret [here](https://dev.twitch.tv/docs/api/get-started).

## Installation & Setup

1. Download a release and unzip it somewhere on your computer.
2. Navigate to where you extracted the folder in command prompt or terminal and run `npm i` to install the dependencies.
3. Rename `.default.env` to `.env`.
4. Fill out the `.env` file.
5. run `npx prisma db push` to generate the database schema.
6. Run `npm run build` to build the bot.
7. Run `npm run start` to launch the bot.

## Configuration

To configure this bot, create a file named `.env` in the root directory of the bot's files and use the following as a baseline.

```dotenv
DISCORD_CLIENT_ID=""
DISCORD_TOKEN=""
TWITCH_CLIENT_ID=""
TWITCH_SECRET=""
GUILD_ID=""
DATABASE_URL=""
NODE_ENV="production"
LAMAR_ID=""
```

Configuration option definitions:

| Key               | Description                                                  | Required |
|-------------------|--------------------------------------------------------------|----------|
| DISCORD_CLIENT_ID | The Client ID of your Discord bot                            | ☑️       |
| DISCORD_TOKEN     | Your bot token from the Discord developer portal             | ☑️       |
| TWITCH_CLIENT_ID  | Your client ID from the Twitch developer portal              | ☑️       |
| TWITCH_SECRET     | Your client secret from the Twitch developer portal          | ☑️       |
| GUILD_ID          | The guild ID of your test server                             | ☑️       |
| DATABASE_URL      | Connection string for Postgres server                        | ☑️       |
| NODE_ENV          | Mode to run the bot in, production to deploy global commands | ️        |
| LAMAR_ID          | Your Discord user ID                                         | ️        |

## Inviting Chizuru Bot

To invite Chizuru Bot to your server and have slash commands work, you'll need to ensure that the `applications.commands` scope is something that your Chizuru Bot has access to. Without it, slash commands will not appear on the server or work properly. You'll also want to make sure that `bot` is there as well, otherwise, Chizuru bot won't be in the server and will be unable to send messages back.

If you want to be lazy, you're welcome to use the following link. You'll just want to make sure to replace `<YOUR_BOT_CLIENT_id_here>` with your bot's client ID.

```bash
https://discord.com/oauth2/authorize?client_id=<YOUR_BOT_CLIENT_ID_HERE>&scope=bot+applications.commands&permissions=259846039632
```
