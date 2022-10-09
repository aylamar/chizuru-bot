import { CommandModule } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { prisma } from '../../services';
import { Command } from '../../structures/command';
import { deferReply, generateEmbed, replyEmbed } from '../../utils';

export default new Command({
    name: 'module',
    description: 'Update modules enabled for a guild',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['ManageGuild'],
    module: Chizuru.CommandModule.Admin,
    options: [
        {
            name: 'guild',
            description: 'The id of the guild to update the module settings for',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'module',
            description: 'The module to enable or disable',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [{ name: 'Music', value: 'Music' }],
        },
        {
            name: 'enabled',
            description: 'Whether to enable or disable the module',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
        },
    ],

    execute: async (client, interaction) => {
        const guildId = interaction.options.getString('guild', true);
        const module = interaction.options.getString('module', true) as keyof typeof Chizuru.CommandModule;
        const enabled = interaction.options.getBoolean('enabled', true);
        const defer = deferReply(interaction);

        // check to see if the guild exists
        const guild = await client.guilds.fetch(guildId);
        if (!guild)
            return await interaction.reply({
                content: `Guild not found, is this bot in ${guildId}?`,
                ephemeral: true,
            });

        // convert module to enum
        const moduleEnum = Chizuru.CommandModule[module];

        const dbGuild = await prisma.guild.findUnique({
            where: { id: guildId },
        });
        if (!dbGuild)
            return await interaction.reply({
                content: `Guild not found in database, is this bot in ${guildId}`,
                ephemeral: true,
            });

        const moduleArray = await updateArray(dbGuild.modules, await convertToDbEnum(moduleEnum), enabled);
        const commandModuleArray = await Promise.all(moduleArray.map(async module => await convertToEnum(module)));
        let commands = client.getCommandsByModule(commandModuleArray);

        await prisma.guild.update({
            where: { id: guildId },
            data: { modules: moduleArray },
        });

        const moduleString = commandModuleArray.length === 0 ? 'None' : commandModuleArray.join(', ');
        const embed = generateEmbed({
            title: 'Module Update',
            msg: `Successfully updated module settings for ${guild.name}\n` + `Enabled modules: ${moduleString}\n`,
            color: client.colors.success,
        });

        await client.deployGuildCommands(await commands, guild);
        await client.cleanGuildCommands(await commands, guild);

        await defer;
        await replyEmbed(interaction, await embed);
    },
});

export async function updateArray(
    idArray: CommandModule[],
    id: CommandModule,
    enabled: boolean | null
): Promise<CommandModule[]> {
    // if item is in list and enabled is false, remove it
    if (idArray.includes(id) && !enabled) {
        idArray.splice(idArray.indexOf(id), 1);
        return idArray;
        // if item is not in array and enabled is true, add it
    } else if (!idArray.includes(id) && enabled) {
        return [...idArray, id];
        // otherwise, do nothing
    } else {
        return idArray;
    }
}

async function convertToEnum(module: CommandModule) {
    switch (module) {
        case CommandModule.admin:
            return Chizuru.CommandModule.Admin;
        case CommandModule.music:
            return Chizuru.CommandModule.Music;
        default:
            throw new Error('Invalid module');
    }
}

// convert Chizuru.CommandModule to CommandModule
async function convertToDbEnum(module: Chizuru.CommandModule) {
    switch (module) {
        case Chizuru.CommandModule.Admin:
            return CommandModule.admin;
        case Chizuru.CommandModule.Music:
            return CommandModule.music;
        default:
            throw new Error('Invalid module');
    }
}
