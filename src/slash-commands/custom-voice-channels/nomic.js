import { displayNameAndID } from '../../util/util.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	data: new SlashCommandBuilder()
		.setName('nomic')
		.setDescription(
			'Crée un channel textuel nomic si vous êtes connecté dans un salon vocal personnalisé',
		),
	requirePermissions: [],
	interaction: async (interaction, client) => {
		const voiceChannel = interaction.member.voice.channel

		// Si l'utilisateur n'est pas dans un channel vocal
		if (!voiceChannel)
			return interaction.reply({
				content: 'Tu dois être dans un channel vocal pour utiliser cette commande 😕',
				ephemeral: true,
			})

		// Si l'utilisateur n'est pas dans un channel vocal personnalisé
		if (!client.voiceManager.has(voiceChannel.id))
			return interaction.reply({
				content:
					'Tu dois être dans un channel vocal personnalisé pour utiliser cette commande 😕',
				ephemeral: true,
			})

		// Check si il y a déjà un channel no-mic
		const existingNoMicChannel = client.voiceManager.get(voiceChannel.id)
		if (existingNoMicChannel)
			return interaction.reply({
				content: `Il y a déjà un channel no-mic : ${existingNoMicChannel} 😕`,
				ephemeral: true,
			})

		// Crée le channel no mic
		const noMicChannel = await interaction.guild.channels.create(
			`no mic ${voiceChannel.name}`,
			{
				type: 'text',
				topic: `Channel temporaire créé pour ${displayNameAndID(
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
			// Accès au channel pour les membres présents
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

		// Ajout du channel dans la map
		client.voiceManager.set(voiceChannel.id, noMicChannel)

		return interaction.reply({
			content: `Ton channel a bien été créé : ${noMicChannel} 👌`,
			ephemeral: true,
		})
	},
}
