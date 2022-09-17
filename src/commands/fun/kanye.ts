import fetch, { Response } from 'node-fetch';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { generateEmbed, generateErrorEmbed, replyEmbed } from '../../utils';

export default new Command({
    name: 'kanye',
    description: 'Need some words of wisdom from Kanye?',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: Chizuru.CommandModule.Global,
    options: [],
    execute: async (client, interaction) => {
        let res: Response;
        let parsedRes: { quote: string };
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
            msg: `"${parsedRes.quote}"`,
        });
        await replyEmbed(interaction, embed);
    },
});
