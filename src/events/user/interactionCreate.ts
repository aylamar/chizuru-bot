import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    if (!client.commands.has(interaction.commandName)) return
    if (!interaction.guild) return

    const command = client.commands.get(interaction.commandName)

    // Check if bot has required permissions
    if (!interaction.guild.me.permissionsIn(interaction.channelId).has(command.botPermissions, true)) {
        let difference = command.botPermissions.filter((x) => !interaction.guild.me.permissionsIn(interaction.channelId).toArray().includes(x))

        if (difference.length > 1) {
            let missing = difference.slice(0, -1).join(',') +' and ' + difference.slice(-1)
            missing = missing.toLocaleLowerCase().replace(/_/g, ' ')
            interaction.reply({ content: `I need the ${missing} permissions to run this command.`, ephemeral: true })
        } else {
            let missing = difference.toString()
            missing = missing.toLocaleLowerCase().replace(/_/g, ' ')
            interaction.reply({ content: `I need the ${missing} permission to run this command.`, ephemeral: true, })
        }
        return
    }
    
    // Check if user has required permissions
    if (typeof interaction.member.permissions === "string") return
    if (!interaction.member.permissions.has(command.userPermissions, true)) {
        let arr = interaction.member.permissions.toArray()
        let difference = command.userPermissions.filter((x) => !arr.includes(x))

        if (difference.length > 1) {
            let missing = difference.slice(0, -1).join(',') +' and ' + difference.slice(-1)
            missing = missing.toLocaleLowerCase().replace(/_/g, ' ')
            interaction.reply({ content: `❌ You need the ${missing} permissions to run this command.`, ephemeral: true })
        } else {
            let missing = difference.toString()
            missing = missing.toLocaleLowerCase().replace(/_/g, ' ')
            interaction.reply({ content: `❌ You need the ${missing} permission to run this command.`, ephemeral: true, })
        }
        return
    }

    try {
        command.run(client, interaction)
    } catch (err) {
        client.logger.error(err)
    }
}

export const name: string = 'interactionCreate'
