export interface Field {
    name: string
    value: string
    inline: boolean
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
