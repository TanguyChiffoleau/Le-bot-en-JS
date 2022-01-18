import { interactionReply } from '../../util/util.js'
import { Constants, GuildMember } from 'discord.js'

export default {
	name: 'unban',
	description: 'Débanni un membre',
	options: [
		{
			type: 'input',
			name: 'id',
			optDesc: 'Discord ID du membre',
		},
	],
	requirePermissions: ['BAN_MEMBERS'],
	interaction: async interaction => {
		// Acquisition de l'utilisateur
		const author = interaction.guild.members.cache.get(interaction.user.id)
		const userId = interaction.options.getString('id')

		if (!author.permissions.has('BAN_MEMBERS'))
			return interactionReply({
				interaction,
				content: "tu n'as pas la permission d'effectuer cette commande 😬",
			})

		if (!interaction.options.getString('id'))
			return interactionReply({
				interaction,
				content: "tu dois donner l'ID d'un utilisateur 😬",
			})

		if (interaction.options.getString('id') === interaction.user.id)
			return interactionReply({
				interaction,
				content: 'tu ne peux pas te débannir toi-même 😬',
			})

		// Unban du membre
		const unbanAction = await interaction.guild.members
			.unban(interaction.options.getString('id'))
			.catch(async error => {
				console.error(error)

				if (error.code === Constants.APIErrors.MISSING_PERMISSIONS)
					return interactionReply({
						interaction,
						content: `tu n'as pas la permission de débannir cet utilisateur 😕`,
					})

				if (error.code === Constants.APIErrors.UNKNOWN_BAN)
					return interactionReply({
						interaction,
						content: "l'utilisateur n'est pas banni 😬",
					})

				await interactionReply({
					interaction,
					content: `je n'arrive pas à débannir \`${userId}\` 😕`,
				})

				return error
			})

		// Si pas d'erreur, message de confirmation du ban
		if (unbanAction instanceof GuildMember)
			await interactionReply({ interaction, content: `🔓 \`${userId}\` a été débanni` })

		// Si au moins une erreur, throw
		if (unbanAction instanceof Error)
			throw new Error(
				'Sending message and/or banning member failed. See precedents logs for more informations.',
			)
	},
}
