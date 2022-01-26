export default async (interaction, client) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (command) await command.interaction(interaction, client)
		else
			return interaction.reply({
				content: `Impossible de trouver la commande "${interaction.commandName}"`,
			})
	}

	if (interaction.isButton())
		if (client.interactionRoleMap.has(interaction.message.id)) {
			// Partie système de réaction/role
			const interactionRoleMap = client.interactionRoleMap.get(interaction.message.id)
			const roleID = interactionRoleMap[interaction.customId]
			const guildMember = await interaction.guild.members.fetch(interaction.user)

			if (guildMember.roles.cache.has(roleID)) await guildMember.roles.remove(roleID)
			else guildMember.roles.add(roleID)

			// deferUpdate() afin que le bouton ne réponde pas une erreur
			// mais agisse comme un système de switch
			return interaction.deferUpdate()
		}
}
