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
