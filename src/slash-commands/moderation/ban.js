import { interactionReply } from '../../util/util.js'
import { readFile } from 'fs/promises'
import { Constants, GuildMember } from 'discord.js'

export default {
	name: 'ban',
	description: 'Banni un membre',
	options: [
		{
			type: 'user',
			optDesc: 'Membre',
		},
		{
			type: 'input',
			name: 'raison',
			optDesc: 'Raison du bannissement',
		},
	],
	requirePermissions: ['BAN_MEMBERS'],
	interaction: async interaction => {
		// Acquisition du membre et de la raison du ban
		const user = interaction.options.getUser('user')
		const author = interaction.guild.members.cache.get(interaction.user.id)
		const reason = interaction.options.getString('raison')

		if (!author.permissions.has('BAN_MEMBERS'))
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

		if (user.id === interaction.user.id)
			return interactionReply({
				interaction,
				content: 'tu ne peux pas te bannir toi-même 😬',
			})

		if (!member.bannable)
			return interactionReply({
				interaction,
				content: 'tu ne peux pas bannir ce membre 😬',
			})

		// Lecture du message de ban
		const banDM = await readFile('./forms/ban.md', { encoding: 'utf8' })

		// Envoi du message de bannissement en message privé
		const DMMessage = await member
			.send({
				embeds: [
					{
						color: '#C27C0E',
						title: 'Bannissement',
						description: banDM,
						author: {
							name: interaction.guild.name,
							icon_url: interaction.guild.iconURL({ dynamic: true }),
							url: interaction.guild.vanityURL,
						},
						fields: [
							{
								name: 'Raison du bannissement',
								value: reason,
							},
						],
					},
				],
			})
			.catch(async error => {
				if (error.code === Constants.APIErrors.CANNOT_MESSAGE_USER)
					await interactionReply({
						interaction,
						content: `les messages privés sont bloqués 😕`,
					})

				console.error(error)
				return error
			})

		// Ban du membre
		const banAction = await member
			.ban({ days: 7, reason: `${interaction.user.tag} : ${reason}` })
			.catch(async error => {
				console.error(error)
				await interactionReply({
					interaction,
					content: `je n'arrive pas à bannir ${member} 😕`,
				})

				return error
			})

		// Si pas d'erreur, message de confirmation du ban
		if (banAction instanceof GuildMember)
			await interactionReply({
				interaction,
				content: `🔨 \`${user.tag}\` a été banni\n📄 **Raison :** ${reason}`,
			})

		// Si au moins une erreur, throw
		if (banAction instanceof Error || DMMessage instanceof Error)
			throw new Error(
				'Sending message and/or banning member failed. See precedents logs for more informations.',
			)
	},
}
