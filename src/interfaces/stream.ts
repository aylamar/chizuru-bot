export interface ChannelData {
    username: string;
    displayName: string;
    url: string;
    thumbnailUrl: string;
    gameName: string;
    isLive: boolean;
}

export interface StreamData {
    id: string;
    broadcasterLogin: string;
    displayName: string;
    streamThumbnailUrl: string;
    viewerCount: number;
    title: string;
    gameName: string;
}
