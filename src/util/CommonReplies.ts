import { Interaction } from "discord.js"

async function noPermission(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    await interaction.reply({ content: "❌ You don't have permission for this command.", ephemeral: true })
    return
}

async function somethingWrong(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    await interaction.reply({ content: "Something went wrong, try again? 🤔", ephemeral: true })
    return
}

export { noPermission, somethingWrong }
