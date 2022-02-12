export default (interaction, client) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command)
			return interaction.reply({
				content: `Impossible de trouver la commande "${interaction.commandName}"`,
			})

		if (
			command.requirePermissions.length > 0 &&
			!interaction.member.permissionsIn(interaction.channel).has(command.requirePermissions)
		)
			return interaction.reply({
				content: "Tu n'as pas les permissions pour effectuer cette commande 😕",
				ephemeral: true,
			})

		return command.interaction(interaction, client)
	}
}
