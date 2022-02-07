export default async (interaction, client) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (command) await command.interaction(interaction, client)
		else
			return interaction.reply({
				content: `Impossible de trouver la commande "${interaction.commandName}"`,
			})
	}
}
