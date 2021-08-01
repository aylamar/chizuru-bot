# Chizuru Bot

This is a Discord stream notification bot that *might* have additional features added over time.

## Installation

1. Download, extract & build
2. Rename `tokens.default.json` to `tokens.json`.
3. Rename `config.default.json` to `config.json`.
4. Fill out the `config.json` file.
5. run `npm run start`.

## TODO

1. Move embed out of GetChannelStatus.ts and use seperate thing.
2. Create state state system that checks all streams with GetChannelStatus.ts and stores current states during startup.
3. Check streams every minute and update states, if state changes, post message.
4. Add way to list streams.
5. Add way to delete streams.
