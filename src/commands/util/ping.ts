import { Command, CommandModule } from '../../classes/command';
import { replyMessage } from '../../utils';

export default new Command({
    name: 'ping',
    description: 'Replies with pong',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: CommandModule.Global,
    options: [],

    execute: async (client, interaction) => {
        let curTime = Date.now();
        let ping = curTime - interaction.createdTimestamp;

        let msg = `:ping_pong: ~${ ping }ms delay between when you ran the command and when I received it.`;
        return await replyMessage(interaction, msg);
    },
});
