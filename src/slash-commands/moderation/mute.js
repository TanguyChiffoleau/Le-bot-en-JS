import { interactionReply } from '../../util/util.js'
import { readFile } from 'fs/promises'
import { Constants, GuildMember } from 'discord.js'

export default {
	name: 'mute',
	description: 'Mute un utilisateur',
	options: [
		{
			type: 'user',
			optDesc: 'Membre',
		},
		{
			type: 'int',
			name: 'durée',
			optDesc: 'Nombre de minutes de la durée',
		},
		{
			type: 'input',
			name: 'raison',
			optDesc: 'Raison du mute',
		},
	],
	requirePermissions: ['MUTE_MEMBERS'],
	interaction: async (interaction, client) => {
		// Acquisition du membre et de la raison du ban
		const user = interaction.options.getUser('user')
		const author = interaction.guild.members.cache.get(interaction.user.id)
		const duree = interaction.options.getInteger('durée')
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

		if (duree === null)
			return interactionReply({
				interaction,
				content: 'tu dois entrer une valeur de durée 😬',
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
		// 		content: 'tu ne peux pas te mute toi-même 😬',
		// 	})

		// Acquisition du rôle muted
		const mutedRole = client.config.mutedRoleID
		if (!mutedRole)
			return interactionReply({
				interaction,
				content: "il n'y a pas de rôle muted 😕",
			})

		// Lecture du message de mute
		const muteDM = await readFile('./forms/mute.md', { encoding: 'utf8' })

		// Envoi du message de mute en message privé
		const DMMessage = await member
			.send({
				embeds: [
					{
						color: '#C27C0E',
						title: 'Mute',
						description: muteDM,
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
							{
								name: 'Durée',
								value: `${duree} minute(s)`,
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

		// Ajout du rôle muted
		const muteAction = await member.roles.add(mutedRole)

		// Suppression du rôle muted après le temps écoulé
		// et envoi du message privé
		await setTimeout(() => {
			if (member.roles.cache.has(mutedRole)) {
				member.roles.remove(mutedRole)
				member
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
		}, `${duree * 60000}`)

		// Si pas d'erreur, message de confirmation du mute
		if (muteAction instanceof GuildMember)
			await interactionReply({
				interaction,
				content: `🔇 \`${user.tag}\` est mute pendant ${duree} minute(s)\nRaison : ${reason}`,
			})

		// Si au moins une erreur, throw
		if (muteAction instanceof Error || DMMessage instanceof Error)
			throw new Error(
				'Sending message and/or banning member failed. See precedents logs for more informations.',
			)
	},
}
