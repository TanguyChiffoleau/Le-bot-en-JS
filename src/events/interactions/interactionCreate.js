export default async (interaction, client) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName)
        if (!command) {
            interaction.reply({ content: `Impossible de trouver la commande "${interaction.commandName}"`})
        } else {
            command.interaction(interaction, client)
        }
    }
}