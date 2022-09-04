import fetch, { Response } from 'node-fetch';
import type { Logger } from 'winston';
import { ChannelData, StreamData } from '../interfaces';
import { ApiConnectionError, LocateStreamerError } from '../utils';

export default class Twitch {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly baseUrl: string;
    private readonly authUrl: string;
    private tokenType: string;
    private logger: Logger;
    private accessToken: string;
    private expireTime: number;

    public constructor(clientId: string, clientSecret: string, logger: Logger) {
        this.logger = logger;
        this.baseUrl = 'https://api.twitch.tv/helix';
        this.authUrl = 'https://id.twitch.tv/oauth2/token';
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = '';
        this.tokenType = '';
        this.expireTime = 0;
        void this.getToken();
    }

    public async getChannel(streamer: string): Promise<ChannelData> {
        let res: Response;
        let parsedRes: twitchChannelRequest;
        let headers = await this.getHeaders();
        try {
            res = await this.makeRequest(`${ this.baseUrl }/search/channels?query=${ streamer }`, 'GET', headers);
            parsedRes = await res.json();
        } catch (err) {
            this.logger.error(`Encounter error while calling twitch API  for ${ streamer }, please try again in a few minutes.`, { label: 'twitch' });
            throw new ApiConnectionError(`Encounter error while calling twitch API  for ${ streamer }, please try again in a few minutes.`);
        }
        const data: rawChannelData[] = parsedRes.data;
        if (!data) throw new LocateStreamerError(`Unable locate streamer ${ streamer }, please verify the username is correct.`);

        let streamerData: rawChannelData = data.filter((e: any) => e['broadcaster_login'].toLowerCase() === streamer.toLowerCase())[0];
        if (!streamerData) throw new LocateStreamerError(`Unable locate streamer ${ streamer }, please verify the username is correct.`);

        return {
            username: streamerData.broadcaster_login.toLowerCase(),
            displayName: streamerData.display_name,
            url: `https://www.twitch.tv/${ streamerData.broadcaster_login }`,
            thumbnailUrl: streamerData.thumbnail_url,
            gameName: streamerData.game_name,
            isLive: streamerData.is_live,
        };
    }

    public async checkStream(streamer: string): Promise<StreamData | false> {
        let res: Response;
        let parsedRes: twitchStreamRequest;
        let headers = await this.getHeaders();
        try {
            res = await this.makeRequest(`${ this.baseUrl }/streams?user_login=${ streamer }`, 'GET', headers);
        } catch (err) {
            this.logger.error(`Unable to check stream for ${ streamer }`, { label: 'twitch' });
            throw new ApiConnectionError(`Unable to fetch profile for ${ streamer }`);
        }
        parsedRes = await res.json();
        const data: rawStreamData[] = parsedRes.data;
        if (!data) throw new LocateStreamerError(`Unable to find stream for ${ streamer }`);

        const foundStreamer: rawStreamData | undefined = data.find((e: any) => e.user_login === streamer);
        if (!foundStreamer || foundStreamer.user_login.toLowerCase() != streamer.toLowerCase()) return false;

        return {
            id: foundStreamer.id,
            broadcasterLogin: foundStreamer.user_login.toLowerCase(),
            displayName: foundStreamer.user_name,
            streamThumbnailUrl: foundStreamer.thumbnail_url,
            viewerCount: foundStreamer.viewer_count,
            title: foundStreamer.title,
            gameName: foundStreamer.game_name,
        };
    }

    private async makeRequest(url: string, method: string, headers: object, body?: any): Promise<Response> {
        let res: Response;
        let attempt = 0;

        while (attempt < 3) {
            try {
                res = await fetch(url, { method: method, headers: { ...headers }, body: body });
                if (res.ok) return res;

                if (res.status === 401) {
                    this.logger.info('Twitch token expired, generating new token', { label: 'twitch' });
                    headers = await this.getHeaders();
                    attempt++;
                    continue;
                }

                if (res.status === 429) {
                    this.logger.warn('Twitch rate limit exceeded, sleeping for 30 seconds', { label: 'twitch' });
                    await new Promise(resolve => setTimeout(resolve, 30000));
                    attempt++;
                    continue;
                }

                this.logger.warn(`Failed to make successful request to Twitch on attempt number ${ attempt }, encountered ${ res.status }: ${ res.statusText }`, { label: 'twitch' });
                attempt++;
            } catch (err: any) {
                this.logger.error(`Unable to make request to ${ url }`, { label: 'twitch' });
                this.logger.error(err, { label: 'twitch' });
                attempt++;
            }
        }
        this.logger.error(`Unable to make request to ${ url } after ${ attempt } attempts`, { label: 'twitch' });
        throw new ApiConnectionError(`Unable to successfully make request to ${ url }`);
    }

    private async getToken(): Promise<string> {
        if (this.expireTime <= Date.now() || this.expireTime === undefined) {
            let res: Response;
            let data: any;
            let body = JSON.stringify({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
            });
            let headers = { 'Content-Type': 'application/json' };

            try {
                res = await this.makeRequest(`https://id.twitch.tv/oauth2/token`, 'POST', headers, body);

                data = await res.json();
                this.accessToken = data.access_token;
                this.expireTime = data.expires_in * 999 + Date.now();
                this.tokenType = data.token_type;
                this.logger.info('Successfully generated new Twitch token', { label: 'twitch' });
            } catch (err: any) {
                this.logger.error('Error generating new Twitch token', { label: 'twitch' });
                this.logger.error(err, { label: 'twitch' });
            }
            return this.accessToken;
        } else {
            return this.accessToken;
        }
    }

    private async getHeaders(): Promise<object> {
        return {
            'client-id': this.clientId,
            Authorization: `Bearer ${ await this.getToken() }`,
        };
    }
}

interface twitchChannelRequest {
    data: rawChannelData[];
    pagination: {};
}

interface rawChannelData {
    broadcaster_language: string;
    broadcaster_login: string,
    display_name: string,
    game_id: string,
    game_name: string,
    id: string,
    is_live: boolean,
    tag_ids: string[],
    thumbnail_url: string,
    title: string,
    started_at: string,
}

interface twitchStreamRequest {
    data: rawStreamData[];
    pagination: {};
}

interface rawStreamData {
    id: string,
    user_id: string,
    user_login: string,
    user_name: string,
    game_id: string,
    game_name: string,
    type: string,
    title: string,
    viewer_count: number,
    started_at: string,
    language: string,
    thumbnail_url: string,
    tag_ids: string[],
    is_mature: boolean
}