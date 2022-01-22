import { SlashCommandBuilder } from '@discordjs/builders'
import { Constants } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Débanni un utilisateur')
		.addStringOption(option =>
			option.setName('id').setDescription('Discord ID du membre').setRequired(true),
		),
	requirePermissions: ['BAN_MEMBERS'],
	interaction: async interaction => {
		// Acquisition de l'utilisateur
		const author = interaction.guild.members.cache.get(interaction.user.id)
		const userId = interaction.options.getString('id')

		if (!author.permissions.has('BAN_MEMBERS'))
			return interaction.reply({
				content: "tu n'as pas la permission d'effectuer cette commande 😬",
			})

		if (!interaction.options.getString('id'))
			return interaction.reply({
				content: "tu dois donner l'ID d'un utilisateur 😬",
			})

		if (interaction.options.getString('id') === interaction.user.id)
			return interaction.reply({
				content: 'tu ne peux pas te débannir toi-même 😬',
			})

		// Unban du membre
		const unbanAction = await interaction.guild.members
			.unban(interaction.options.getString('id'))
			.catch(async error => {
				switch (error.code) {
					case Constants.APIErrors.MISSING_PERMISSIONS:
						return interaction.reply({
							content: `tu n'as pas la permission de débannir cet utilisateur 😕`,
						})

					case Constants.APIErrors.UNKNOWN_BAN:
						return interaction.reply({
							content: "l'utilisateur n'est pas banni 😬",
						})

					default:
						await interaction.reply({
							content: `je n'arrive pas à débannir \`${userId}\` 😕`,
						})
				}

				return error
			})

		// Message de confirmation du ban
		await interaction.reply({ content: `🔓 \`${userId}\` a été débanni` })

		// Si au moins une erreur, throw
		if (unbanAction instanceof Error)
			throw new Error(
				'Sending message and/or banning member failed. See precedents logs for more informations.',
			)
	},
}
