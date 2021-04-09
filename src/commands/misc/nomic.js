import { displayNameAndID } from '../../util/util.js'

export default {
	name: 'nomic',
	description:
		"Créé un channel textuel nomic si vous êtes connecté dans un salon vocal personnalisé. N'est visible que par les membres connectés au salon vocal personnalisé",
	aliases: [],
	usage: {
		arguments: null,
		informations: 'Créé un channel textuel pour les utilisateurs sans microphone',
		examples: [],
	},
	needArguments: false,
	guildOnly: true,
	requirePermissions: [],
	execute: async (client, message) => {
		const voiceChannel = message.member.voice.channel

		// Si l'utilisateur n'est pas dans un channel vocal
		if (!voiceChannel)
			return message.reply(
				'tu dois être dans un channel vocal pour utiliser cette commande 😕',
			)

		// Si l'utilisateur n'est pas dans un channel vocal personnalisé
		if (!client.voiceManager.has(voiceChannel.id))
			return message.reply(
				'tu dois être dans un channel vocal personnalisé pour utiliser cette commande 😕',
			)

		// Check si il y a déjà un channel no-mic
		const existingNoMicChannel = client.voiceManager.get(voiceChannel.id)
		if (existingNoMicChannel)
			return message.reply(`il y a déjà un channel no-mic : ${existingNoMicChannel} 😕`)

		// Crée le channel no mic
		const noMicChannel = await message.guild.channels.create(`no mic ${voiceChannel.name}`, {
			type: 'text',
			topic: `Channel temporaire créé pour ${displayNameAndID(message.member)})`,
			parent: voiceChannel.parent,
		})

		// Suppression des permissions existantes sauf
		// pour les rôles qui peuvent supprimer les messages (modos)
		// ou qui ne peuvent pas envoyer de messages (muted)
		await Promise.all(
			noMicChannel.permissionOverwrites
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
				noMicChannel.updateOverwrite(member, {
					CREATE_INSTANT_INVITE: false,
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
					READ_MESSAGE_HISTORY: true,
				}),
			),
			// Setup les permissions (pas d'accès) pour le role everyone
			noMicChannel.updateOverwrite(message.guild.id, {
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

		return message.reply(`ton channel a bien été créé : ${noMicChannel} 👌`)
	},
}
