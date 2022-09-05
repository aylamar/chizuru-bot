import { GuildAuditLogs } from 'discord.js';

export async function getRecentAuditLog(logs: GuildAuditLogs, id: string): Promise<string> {
    const log = logs.entries.first();
    if (!log) return ', but we don\'t know by who';
    if (log.executor?.id === id) return ` by ${ log.executor.tag }`;

    return ', but we don\'t know by who';
}
