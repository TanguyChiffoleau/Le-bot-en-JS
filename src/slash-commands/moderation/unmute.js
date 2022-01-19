import { interactionReply } from '../../util/util.js'
import { Constants, GuildMember } from 'discord.js'

export default {
	name: 'unmute',
	description: 'Unmute un utilisateur',
	options: [
		{
			type: 'user',
			optDesc: 'Membre',
		},
		{
			type: 'input',
			name: 'raison',
			optDesc: "Raison de l'unmute",
		},
	],
	requirePermissions: ['MUTE_MEMBERS'],
	interaction: async (interaction, client) => {
		// Acquisition du membre et de la raison du ban
		const user = interaction.options.getUser('user')
		const author = interaction.guild.members.cache.get(interaction.user.id)
		const reason = interaction.options.getString('raison')

		if (!author.permissions.has('MUTE_MEMBERS'))
			return interactionReply({
				interaction,
				content: "tu n'as pas la permission d'effectuer cette commande 😬",
			})

		if (!user)
			return interactionReply({
				interaction,
				content: 'tu dois mentionner un membre 😬',
			})

		if (!reason)
			return interactionReply({
				interaction,
				content: 'tu dois donner une raison 😬',
			})

		const member = interaction.guild.members.cache.get(user.id)

		if (!member)
			return interactionReply({
				interaction,
				content: "je n'ai pas trouvé cet utilisateur, vérifiez la mention ou l'ID 😕",
			})

		// if (user.id === interaction.user.id)
		// 	return interactionReply({
		// 		interaction,
		// 		content: "tu ne peux pas t'unmute toi-même 😬",
		// 	})

		// Acquisition du rôle muted
		const mutedRole = client.config.mutedRoleID
		if (!mutedRole)
			return interactionReply({
				interaction,
				content: "il n'y a pas de rôle muted 😕",
			})

		// Suppression du rôle muted et envoi du message privé
		if (member.roles.cache.has(mutedRole)) {
			const unmuteAction = await member.roles.remove(mutedRole)

			// Si pas d'erreur, message de confirmation du mute
			if (unmuteAction instanceof GuildMember) {
				await interactionReply({
					interaction,
					content: `🔊 \`${user.tag}\` est unmute\nRaison : ${reason}`,
				})
				await member
					.send({
						embeds: [
							{
								color: '#C27C0E',
								title: 'Mute',
								description: 'Votre mute est terminé',
								author: {
									name: interaction.guild.name,
									icon_url: interaction.guild.iconURL({ dynamic: true }),
									url: interaction.guild.vanityURL,
								},
								fields: [
									{
										name: 'Raison',
										value: reason,
									},
								],
							},
						],
					})
					.catch(async error => {
						if (error.code === Constants.APIErrors.CANNOT_MESSAGE_USER)
							return interactionReply({
								interaction,
								content: 'les messages privés sont bloqués 😕',
							})

						console.error(error)
						await interactionReply({
							interaction,
							content: "le message privé n'a pas été envoyé 😕",
						})
						return error
					})
			}

			// Si au moins une erreur, throw
			if (unmuteAction instanceof Error)
				throw new Error(
					'Sending message and/or banning member failed. See precedents logs for more informations.',
				)
		} else {
			return interactionReply({
				interaction,
				content: "le membre n'est pas muté 😕",
			})
		}
	},
}
