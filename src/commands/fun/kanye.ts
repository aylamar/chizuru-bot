import { PermissionFlagsBits, PermissionsString, SlashCommandBuilder } from 'discord.js';
import fetch, { Response } from 'node-fetch';
import { RunCommand } from '../../interfaces';
import { generateEmbed, generateErrorEmbed, replyEmbed } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    let res: Response;
    let parsedRes: KanyeResponse;
    try {
        res = await fetch('https://api.kanye.rest');
        parsedRes = await res.json();
    } catch (err: any) {
        let embed = await generateErrorEmbed(err, client.colors.error, client.logger);
        return await replyEmbed(interaction, embed);
    }

    const embed = await generateEmbed({
        author: 'Kanye West',
        authorIcon: 'https://i.imgur.com/ywPk81X.jpeg',
        authorUrl: 'https://twitter.com/kanyewest/',
        color: client.colors.success,
        msg: `"${ parsedRes.quote }"`,
    });
    await replyEmbed(interaction, embed);
};

export const name: string = 'kanye';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('kanye')
    .setDescription('Need some words of wisdom from Kanye?')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel)
    .setDMPermission(false);


interface KanyeResponse {
    quote: string;
}
