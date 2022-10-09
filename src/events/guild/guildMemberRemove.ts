import { Events, GuildMember } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.GuildMemberRemove,
    execute: async (client: Bot, member: GuildMember) => {
        if (!member || !member.id) return;
        try {
            await prisma.guildUser.delete({
                where: { userId_guildId: { userId: member.id, guildId: member.guild.id } },
            });

            client.logger.info(
                `${member.user.tag} (${member.user.id}) left ${member.guild.name}, successfully disconnected them from the guild`,
                { label: 'event' }
            );
        } catch (err) {
            client.logger.error(
                `Left ${member.guild.name} (${member.guild.id}), errored while disconnected a user in the database`,
                { label: 'event' }
            );
            client.logger.error(err);
        }
    },
});
