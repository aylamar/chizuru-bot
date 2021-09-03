import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    if (!client.commands.has(interaction.commandName)) return
    if (!interaction.guild) return

    const command = client.commands.get(interaction.commandName)
    try {
        command.run(client, interaction)
    } catch (err) {
        client.logger.error(err)
    }
}

export const name: string = 'interactionCreate'
