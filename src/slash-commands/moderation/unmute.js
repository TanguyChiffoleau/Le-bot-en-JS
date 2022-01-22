import { SlashCommandBuilder } from '@discordjs/builders'
import { Constants, GuildMember } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute un utilisateur')
		.addUserOption(option =>
			option.setName('membre').setDescription('Membre').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('raison').setDescription("Raison de l'unmute").setRequired(true),
		),
	requirePermissions: ['MUTE_MEMBERS'],
	interaction: async (interaction, client) => {
		// Acquisition du membre et de la raison du ban
		const user = interaction.options.getUser('membre')
		const author = interaction.guild.members.cache.get(interaction.user.id)
		const reason = interaction.options.getString('raison')

		if (!author.permissions.has('MUTE_MEMBERS'))
			return interaction.reply({
				content: "tu n'as pas la permission d'effectuer cette commande 😬",
			})

		if (!user)
			return interaction.reply({
				content: 'tu dois mentionner un membre 😬',
			})

		if (!reason)
			return interaction.reply({
				content: 'tu dois donner une raison 😬',
			})

		const member = interaction.guild.members.cache.get(user.id)

		if (!member)
			return interaction.reply({
				content: "je n'ai pas trouvé cet utilisateur, vérifiez la mention ou l'ID 😕",
			})

		if (user.id === interaction.user.id)
			return interaction.reply({
				content: "tu ne peux pas t'unmute toi-même 😬",
			})

		// Acquisition du rôle muted
		const mutedRole = client.config.mutedRoleID
		if (!mutedRole)
			return interaction.reply({
				content: "il n'y a pas de rôle muted 😕",
			})

		// Suppression du rôle muted et envoi du message privé
		if (member.roles.cache.has(mutedRole)) {
			const unmuteAction = await member.roles.remove(mutedRole)

			// Si pas d'erreur, message de confirmation du mute
			if (unmuteAction instanceof GuildMember) {
				const unmuteMessage = await interaction.reply({
					content: `🔊 \`${user.tag}\` est unmute\n📄 **Raison :** ${reason}`,
					fetchReply: true,
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
							return unmuteMessage.react('⛔')

						console.error(error)
						await unmuteMessage.react('⚠️')
						return error
					})
			}

			// Si au moins une erreur, throw
			if (unmuteAction instanceof Error)
				throw new Error(
					'Sending message and/or banning member failed. See precedents logs for more informations.',
				)
		} else {
			return interaction.reply({
				content: "le membre n'est pas muté 😕",
			})
		}
	},
}
