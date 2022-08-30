export class LocateStreamerError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'LocateStreamerError';
    }
}

export class ApiConnectionError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'ApiConnectionError';
    }
}

export class NonTextChannelError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'NonTextChannelError';
    }
}
