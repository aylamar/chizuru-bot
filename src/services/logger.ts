import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, colorize, printf } = format;

const logFormat = printf(({ label, level, message, stack, timestamp }) => {
    let service = '';
    if (label) service = `[${label}] `;
    return `${timestamp} ${level}: ${service}${stack || message}`;
});

const devLogger = createLogger({
    level: 'debug',
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        logFormat
    ),
    transports: [new transports.Console()],
});

export function getLogger(): Logger {
    return devLogger;
}
