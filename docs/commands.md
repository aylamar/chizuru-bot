# Commands

## Fun

* Default requirements: `Send Messages`

| Command | Description                         | Usage    |
|---------|-------------------------------------|----------|
| `kanye` | Retrieves a random Kanye West quote | `/kanye` |

## Music

* Default requirements: `Speak`
* Requires the "Music" module has been enabled for your server via the `/module` command

| Command    | Description                                                          | Usage                                         | 
|:-----------|:---------------------------------------------------------------------|:----------------------------------------------|
| loop       | Swap between different loop modes                                    | `/loop {mode}`                                |
| nowplaying | Shows information about the current song                             | `/nowplaying`                                 |
| pause      | Pauses the current song                                              | `/pause`                                      |
| play       | Adds a playlist or song to the queue                                 | <code>/play {playlist&vert;song} {url}</code> |
| queue      | Lists the current queue                                              | `queue`                                       |
| resume     | Resumes the current song                                             | `resume`                                      |
| skip       | Skips the current song                                               | `skip`                                        |
| stop       | Clears the current queue and causes the Chizuru to leave the channel | `stop`                                        |

## Search

* Default requirements: `Send Messages`

| Command   | Description                                                        | Usage                                           |
|-----------|--------------------------------------------------------------------|-------------------------------------------------|
| `youtube` | Search for a video on [YouTube](https://www.youtube.com/) by title | `/youtube <title>`                              |
| lookup    | Looks up a manga or anime on [Anilist](https://anilist.co/home)    | <code>/lookup {manga&vert;anime} {title}</code> |

## Settings

### /settings

Contains sub commands to update server settings for the bot.

Default requirements: `Manage Server`

| Sub Command   | Description                                                    | Usage                                                                     |
|---------------|----------------------------------------------------------------|---------------------------------------------------------------------------|
| list          | Lists all settings                                             | `/settings list`                                                          |
| filter        | Filter or unfiltered a string or attachment extension          | <code>/settings filter {string&vert;attachment} {filter} {enabled}</code> |
| stream-ping   | Enable or disable stream pings for a specific role or everyone | `/settings stream-ping {role} {enabled}`                                  |
| log           | Enable or disable logging in a specific channel                | `/settings log {setting} {enabled}`                                       |
| music-channel | Set the music channel for the server                           | `/settings music-channel {channel}`                                       |

### /starboard

Contains sub commands for creating and managing starboards.

Default requirements: `Manage Server`

| Sub Command | Description                                    | Usage                                                                           |
|-------------|------------------------------------------------|---------------------------------------------------------------------------------|
| create      | Create a starboard in a channel                | `/starboard channel {channel} {emote} {threshold}`                              |
| delete      | Delete a starboard in a channel                | `/starboard delete {channel}`                                                   |
| blacklist   | Blacklist a channel or user from the starboard | <code>/starboard blacklist <channel&vert;user> {starboard} {blacklisted}</code> |

### /stream

Contains sub commands for managing followed streams and listing the active streams.

Default requirements: `Manage Server`

| Sub Command | Description                                                      | Usage                                                  |
|-------------|------------------------------------------------------------------|--------------------------------------------------------|
| list        | List all streams currently followed in the server                | `/stream list`                                         |
| add         | Enable notifications for when a streamer goes live in a channel  | `/stream add {platform} {username} {alert channel}`    |
| remove      | Disable notifications for when a streamer goes live in a channel | `/stream remove {platform} {username} {alert channel}` |


## Util

* Default requirements: `Send Messages`

| Sub Command | Description                                               | Usage           |
|-------------|-----------------------------------------------------------|-----------------|
| ping        | Replies with the latency between the bot and Discord      | `/ping`         |
| bot         | Shows the stats for the bot                               | `/stats bot`    |
| server      | Shows the stats for the server the command is executed in | `/stats server` |
| user        | Shows the stats for the user executing the command        | `/stats user`   |

## Admin

* Default requirements: Set as LAMAR_ID in the `.env` file

| Sub Command | Description                                                                               | Usage                                      |
|-------------|-------------------------------------------------------------------------------------------|--------------------------------------------|
| gnome       | Joins a voice channel and plays [this video](https://www.youtube.com/watch?v=6n3pFFPSlW4) | `/gnome {chanenl id}`                      |
| module      | Enable or disable a module in a server                                                    | `/module {guild id} {module id} {enabled}` |
