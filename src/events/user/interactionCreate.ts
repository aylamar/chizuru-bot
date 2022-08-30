import { Channel, ChatInputCommandInteraction } from 'discord.js';
import { Bot } from '../../classes/bot.js';
import { RunEvent } from '../../interfaces';
import { replyMessage } from '../../utils';

export const run: RunEvent = async (client: Bot, interaction: ChatInputCommandInteraction) => {
    const start = process.hrtime.bigint();
    if (!interaction.isChatInputCommand() || !client.isReady()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        client.logger.info(`No command found named ${ interaction.commandName }`, { label: 'event' });
        return;
    }

    const channel: Channel | undefined = client.channels.cache.get(interaction.channelId);
    if (!channel || !channel.isTextBased() || channel.isDMBased() || !interaction.inCachedGuild()) return;

    // check for permissions
    // let botMember = await interaction.guild.members.cache.get(client.user.id)?.fetch();
    // if (!botMember) return;
    //
    // // check if the bot has the required permissions
    // let messingPerms = [];
    // const botPerms = botMember.permissions.toArray();
    // for (const idx in command.permissions) {
    //     if (!botPerms.includes(command.permissions[idx])) messingPerms.push(command.permissions[idx]);
    // }
    //
    // if (messingPerms.length > 0) {
    //     let msg = `❌ I need the these permissions to run this command: ${ messingPerms.join(', ') }`;
    //     return await replyMessage(interaction, msg, true);
    // }

    try {
        await command.run(client, interaction);
    } catch (err) {
        client.logger.error(`Error sending message in ${ interaction.channelId }`, { label: 'event' });
        client.logger.error(err);
        return await replyMessage(interaction, `❌ Something went wrong, please try again in a few minutes`);
    }
    const result = process.hrtime.bigint();
    client.logger.debug(`Spent ${ ((result - start) / BigInt(1000000)) }ms processing ${ command.name } interaction for ${ interaction.user.tag }`, { label: 'event' });
};

export const name = 'interactionCreate';
