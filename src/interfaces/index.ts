export type { Event, PlayerEvent, RunEvent, RunPlayerEvent } from './event';

export namespace Chizuru {
    export interface EmbedColors {
        error: number;
        warn: number;
        success: number;
        purple: number;
        blurple: number;
        twitch: number;
        anilist: number;
    }

    export interface Field {
        name: string;
        value: string;
        inline: boolean;
    }

    export interface MessageData {
        title?: string
        msg?: string,
        color?: number,
        author?: string,
        authorIcon?: string,
        authorUrl?: string,
        timestamp?: boolean | string,
        footer?: string,
        fields?: Field[],
        image?: string,
        titleUrl?: string
        footerIcon?: string
    }

    export interface ChannelData {
        username: string;
        platformId: string;
        displayName: string;
        url: string;
        thumbnailUrl: string;
        gameName: string;
        isLive: boolean;
    }

    export interface BulkChannelData {
        username: string,
        platformId: string,
        displayName: string,
        url: string,
        gameName: string,
    }

    export interface StreamData {
        id: string;
        username: string;
        platformId: string;
        displayName: string;
        streamThumbnailUrl: string;
        viewerCount: number;
        title: string;
        gameName: string;
    }

    export enum CommandModule {
        Global = 'Global',
        Admin = 'Admin',
        Music = 'Music',
    }
}
