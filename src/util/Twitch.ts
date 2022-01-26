import { Consola } from 'consola'
import { Config } from '../interfaces/Config'
import fetch from 'node-fetch'

export default class Twitch {
    public clientID: string
    public token_type: string
    private config: Config
    private logger: Consola
    private access_token: string
    private expire_time: number

    public constructor(config: Config, logger: Consola) {
        this.config = config
        this.logger = logger
        this.clientID = config.twitchClientID
        // noinspection JSIgnoredPromiseFromCall
        this.getToken()
    }

    public async getToken() {
        if (this.expire_time <= Date.now() || this.expire_time === undefined) {
            try {
                const res: any = await fetch(
                    `https://id.twitch.tv/oauth2/token?&client_id=${this.config.twitchClientID}&client_secret=${this.config.twitchClientSecret}&grant_type=client_credentials`,
                    { method: 'POST' }
                )
                const data = await res.json()

                this.access_token = data.access_token
                this.expire_time = data.expires_in * 999 + Date.now()
                this.token_type = data.token_type
                this.logger.success('Successfully generated new Twitch token')
                return this.access_token
            } catch (err) {
                this.logger.error(err)
            }
        } else {
            return this.access_token
        }
    }

    public async getProfile(channel_name: string) {
        try {
            let res: any = await fetch(`https://api.twitch.tv/helix/search/channels?query=${channel_name}`, {
                method: 'GET',
                headers: {
                    'client-id': this.clientID,
                    Authorization: `Bearer ${await this.getToken()}`
                }
            })

            let parsedRes: any = await res.json()
            let data = await parsedRes.data.filter((e: any) => e['broadcaster_login'] === channel_name)

            if (data[0].broadcaster_login == channel_name) {
                // returns id, display_name, thumbnail_irl (profile picture), is_live (true/false)
                return data[0]
            } else {
                return 'Unable to locate'
            }
        } catch (err) {
            this.logger.error(err)
            return 'Unable to locate'
        }
    }

    public async checkStream(channel_name: string) {
        try {
            let res: any
            try {
                res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channel_name}`, {
                    method: 'GET',
                    headers: {
                        'client-id': this.clientID,
                        Authorization: `Bearer ${await this.getToken()}`
                    }
                })
            } catch (err) {
                this.logger.error(err)
                return 'error'
            }
            let parsedRes: any = await res.json()
            try {
                if (parsedRes.data[0] == undefined) {
                    return undefined
                }
            } catch (err) {
                return undefined
            }

            if (parsedRes.data[0].user_name.toLowerCase() == channel_name.toLowerCase()) {
                return parsedRes.data[0]
            } else {
                return undefined
            }
        } catch (err) {
            this.logger.error('Unable to check stream', channel_name)
            this.logger.error(err)
            return 'error'
        }
    }
}
