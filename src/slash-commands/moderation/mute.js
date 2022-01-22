import { SlashCommandBuilder } from '@discordjs/builders'
import { readFile } from 'fs/promises'
import { Constants, GuildMember } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute un membre')
		.addUserOption(option =>
			option.setName('membre').setDescription('Membre').setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('durée').setDescription('Durée du mute (en minutes)').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('raison').setDescription('Raison du mute').setRequired(true),
		),
	requirePermissions: ['MUTE_MEMBERS'],
	interaction: async (interaction, client) => {
		// Acquisition du membre et de la raison du ban
		const user = interaction.options.getUser('membre')
		const author = interaction.guild.members.cache.get(interaction.user.id)
		const duree = interaction.options.getInteger('durée')
		const reason = interaction.options.getString('raison')

		if (!author.permissions.has('MUTE_MEMBERS'))
			return interaction.reply({
				content: "tu n'as pas la permission d'effectuer cette commande 😬",
			})

		const member = interaction.guild.members.cache.get(user.id)

		if (!member)
			return interaction.reply({
				content: "je n'ai pas trouvé cet utilisateur, vérifiez la mention ou l'ID 😕",
			})

		if (user.id === interaction.user.id)
			return interaction.reply({
				content: 'tu ne peux pas te mute toi-même 😬',
			})

		// Acquisition du rôle muted
		const mutedRole = client.config.mutedRoleID
		if (!mutedRole)
			return interaction.reply({
				content: "il n'y a pas de rôle muted 😕",
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
						await console.error(error)
						return error
					})
			}
		}, `${duree * 60000}`)

		// Si pas d'erreur, message de confirmation du mute
		if (muteAction instanceof GuildMember) {
			const muteMessage = await interaction.reply({
				content: `🔇 \`${user.tag}\` est mute pendant **${duree} minute(s)**\n📄 **Raison :** ${reason}`,
				fetchReply: true,
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
						return muteMessage.react('⛔')

					console.error(error)
					await muteMessage.react('⚠️')
					return error
				})

			// Si au moins une erreur, throw
			if (muteAction instanceof Error || DMMessage instanceof Error)
				throw new Error(
					'Sending message and/or banning member failed. See precedents logs for more informations.',
				)
		}
	},
}
