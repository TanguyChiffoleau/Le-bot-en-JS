/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
import { displayNameAndID } from '../../util/util.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	data: new SlashCommandBuilder()
		.setName('vocal')
		.setDescription('Gère les salons vocaux')
		.addSubcommand(subcommand =>
			subcommand
				.setName('nomic')
				.setDescription(
					'Crée un salon textuel no-mic si tu es connecté dans un salon vocal personnalisé',
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription(
					'Défini le nombre maximum de participants autorisés à rejoindre le salon vocal (1 à 99)',
				)
				.addIntegerOption(option =>
					option
						.setName('participants')
						.setDescription('Nombre maximum de participants (1 à 99)')
						.setMinValue(1)
						.setMaxValue(99)
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('clearlimit')
				.setDescription('Supprime la limite de participants pour le salon vocal'),
		),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		const voiceChannel = interaction.member.voice.channel

		// Si l'utilisateur n'est pas dans un salon vocal
		if (!voiceChannel)
			return interaction.reply({
				content: 'Tu dois être dans un salon vocal pour utiliser cette commande 😕',
				ephemeral: true,
			})

		// Si l'utilisateur n'est pas dans un salon vocal personnalisé
		if (!client.voiceManager.has(voiceChannel.id))
			return interaction.reply({
				content:
					'Tu dois être dans un salon vocal personnalisé pour utiliser cette commande 😕',
				ephemeral: true,
			})

		switch (interaction.options.getSubcommand()) {
			case 'nomic':
				// Check si il y a déjà un salon no-mic
				const existingNoMicChannel = client.voiceManager.get(voiceChannel.id)
				if (existingNoMicChannel)
					return interaction.reply({
						content: `Il y a déjà un salon no-mic : ${existingNoMicChannel} 😕`,
						ephemeral: true,
					})

				// Crée le salon no mic
				const noMicChannel = await interaction.guild.channels.create(
					`No-mic ${voiceChannel.name}`,
					{
						type: 'GUILD_TEXT',
						topic: `Salon temporaire créé pour ${displayNameAndID(
							interaction.member,
							interaction.user,
						)}`,
						parent: voiceChannel.parent,
					},
				)

				// Suppression des permissions existantes sauf
				// pour les rôles qui peuvent supprimer les messages (modos)
				// ou qui ne peuvent pas envoyer de messages (muted)
				await Promise.all(
					noMicChannel.permissionOverwrites.cache
						.filter(
							permissionOverwrites =>
								!(
									permissionOverwrites.allow.has('MANAGE_MESSAGES') ||
									permissionOverwrites.deny.has('SEND_MESSAGES')
								),
						)
						.map(permission => permission.delete()),
				)

				// Setup des permissions
				await Promise.all([
					// Accès au salon pour les membres présents
					...voiceChannel.members.map(member =>
						noMicChannel.permissionOverwrites.edit(member, {
							CREATE_INSTANT_INVITE: false,
							VIEW_CHANNEL: true,
							SEND_MESSAGES: true,
							READ_MESSAGE_HISTORY: true,
						}),
					),
					// Setup les permissions (pas d'accès) pour le role everyone
					noMicChannel.permissionOverwrites.edit(interaction.guild.id, {
						CREATE_INSTANT_INVITE: false,
						MANAGE_CHANNELS: false,
						MANAGE_ROLES: false,
						MANAGE_WEBHOOKS: false,
						VIEW_CHANNEL: false,
						SEND_MESSAGES: false,
						SEND_TTS_MESSAGES: false,
						MANAGE_MESSAGES: false,
						EMBED_LINKS: false,
						ATTACH_FILES: false,
						READ_MESSAGE_HISTORY: false,
						MENTION_EVERYONE: false,
						USE_EXTERNAL_EMOJIS: false,
						ADD_REACTIONS: false,
					}),
				])

				// Ajout du salon dans la map
				client.voiceManager.set(voiceChannel.id, noMicChannel)

				return interaction.reply({
					content: `Ton salon a bien été créé : ${noMicChannel} 👌`,
					ephemeral: true,
				})
			case 'set':
				const participants = interaction.options.getInteger('participants')

				// Si l'utilisateur n'est pas dans un salon vocal
				if (!voiceChannel)
					return interaction.reply({
						content: 'Tu dois être dans un salon vocal pour utiliser cette commande 😕',
						ephemeral: true,
					})

				if (participants) {
					await voiceChannel.setUserLimit(participants)
					return participants > 1
						? interaction.reply({
								content: `Limite définie 👌\n${participants} participants autorisés à rejoindre le salon vocal`,
								ephemeral: true,
						  })
						: interaction.reply({
								content: `Limite définie 👌\n${participants} participant autorisé à rejoindre le salon vocal`,
								ephemeral: true,
						  })
				}
				break
			case 'clearlimit':
				await voiceChannel.setUserLimit(0)
				return interaction.reply({
					content: `Limite supprimée 👌`,
					ephemeral: true,
				})
		}
	},
}
