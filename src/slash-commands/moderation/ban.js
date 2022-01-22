import { SlashCommandBuilder } from '@discordjs/builders'
import { readFile } from 'fs/promises'
import { Constants, GuildMember } from 'discord.js'

export default {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Banni un membre')
		.addSubcommand(subcommand =>
			subcommand
				.setName('by-user')
				.setDescription('Banni un membre')
				.addUserOption(option =>
					option.setName('membre').setDescription('Membre').setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName('raison')
						.setDescription('Raison du bannissement')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('by-user-id')
				.setDescription('Banni un membre')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription("Discord ID de l'utilisateur")
						.setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName('raison')
						.setDescription('Raison du bannissement')
						.setRequired(true),
				),
		),
	requirePermissions: ['BAN_MEMBERS'],
	interaction: async interaction => {
		let user = ''
		let author = ''
		const reason = interaction.options.getString('raison')

		if (interaction.options.getSubcommand() === 'by-user') {
			user = interaction.options.getUser('membre')
			author = interaction.guild.members.cache.get(interaction.user.id)
		} else if (interaction.options.getSubcommand() === 'by-user-id') {
			user = interaction.options.getString('id')
			author = interaction.guild.members.cache.get(interaction.user.id)
		}

		if (!author.permissions.has('BAN_MEMBERS'))
			return interaction.reply({
				content: "tu n'as pas la permission d'effectuer cette commande 😬",
			})

		if (!user)
			return interaction.reply({
				content: 'tu dois donner un membre 😬',
			})

		if (!reason)
			return interaction.reply({
				content: 'tu dois donner une raison 😬',
			})

		const member = interaction.guild.members.cache.get(user.id)

		if (!member && interaction.options.getSubcommand() === 'by-user')
			return interaction.reply({
				content: "je n'ai pas trouvé cet utilisateur, vérifiez la mention ou l'ID 😕",
			})

		if (user.id === interaction.user.id)
			return interaction.reply({
				content: 'tu ne peux pas te bannir toi-même 😬',
			})

		if (interaction.options.getSubcommand() === 'by-user')
			if (!member.bannable)
				return interaction.reply({
					content: 'tu ne peux pas bannir ce membre 😬',
				})

		// Envoi du message de bannissement en message privé
		if (interaction.options.getSubcommand() === 'by-user') {
			// Lecture du message de ban
			const banDM = await readFile('./forms/ban.md', { encoding: 'utf8' })
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
						await interaction.reply({
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
					await interaction.reply({
						content: `je n'arrive pas à bannir ${member} 😕`,
					})

					return error
				})

			// Si pas d'erreur, message de confirmation du ban
			if (banAction instanceof GuildMember)
				await interaction.reply({
					content: `🔨 \`${user.tag}\` a été banni\n📄 **Raison :** ${reason}`,
				})

			// Si au moins une erreur, throw
			if (banAction instanceof Error || DMMessage instanceof Error)
				throw new Error(
					'Sending message and/or banning member failed. See precedents logs for more informations.',
				)
		} else {
			let userById = ''
			if (interaction.guild.members.cache.get(user))
				userById = interaction.guild.members.cache.get(user).user.tag
			else userById = user

			// Ban de l'utilisateur
			const banAction = await interaction.guild.members
				.ban(user, { days: 7, reason: `${interaction.user.tag} : ${reason}` })
				.catch(async error => {
					console.error(error)
					await interaction.reply({
						content: `je n'arrive pas à bannir \`${userById}\` 😕`,
					})

					return error
				})

			// Message de confirmation du ban
			await interaction.reply({
				content: `🔨 \`${userById}\` a été banni\n📄 **Raison :** ${reason}`,
			})

			// Si au moins une erreur, throw
			if (banAction instanceof Error)
				throw new Error(
					'Sending message and/or banning member failed. See precedents logs for more informations.',
				)
		}
	},
}
