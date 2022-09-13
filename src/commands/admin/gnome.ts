import { Queue } from 'discord-music-player';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command, CommandModule } from '../../classes/command';
import { replyMessage } from '../../utils';

export default new Command({
    name: 'gnome',
    description: 'Plays a gnome sound effect',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: CommandModule.Admin,
    options: [{
        name: 'channel',
        description: 'The channel to gnome',
        type: ApplicationCommandOptionType.Channel,
        required: true,
    }],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return false;
        let channel = interaction.options.getChannel('channel');
        if (!channel || !channel.isVoiceBased) return await replyMessage(interaction, 'Please provide a valid voice channel.', true);
        if (interaction.user.id !== process.env.LAMAR_ID) return await replyMessage(interaction, 'https://www.youtube.com/watch?v=6n3pFFPSlW4', true);

        let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
        if (queue) return;
        queue = client.player.createQueue(interaction.guildId, { data: { channelId: channel.id } });

        await queue.join(channel.id);
        await queue.play('https://www.youtube.com/watch?v=6n3pFFPSlW4');

        await replyMessage(interaction, `<#${ channel.id }> has been gnomed`, true);
    },
})
