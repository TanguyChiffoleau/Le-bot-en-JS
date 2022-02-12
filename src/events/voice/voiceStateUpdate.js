import { Permissions } from 'discord.js'

const handleLeave = (oldState, newState, client) => {
	// S'il quitte un salon non personnalisé, on return
	if (!client.voiceManager.has(oldState.channelId)) return

	// S'il le salon qu'il a quitté est vide
	if (oldState.channel.members.size === 0) {
		// Acquisition du salon nomic
		const noMicChannel = client.voiceManager.get(oldState.channelId)
		// S'il existe
		if (noMicChannel)
			// On supprime le salon nomic
			noMicChannel.delete()

		// On supprime le salon de la map
		client.voiceManager.delete(oldState.channelId)

		// Suppression du salon vocal
		// Catch si le salon est déjà supprimé
		return oldState.channel.delete().catch(() => null)
	}

	// S'il n'est pas vide et qu'il quitte un salon avec un no-mic
	if (client.voiceManager.get(oldState.channelId))
		// Suppression des permissions du membre pour le salon no-mic
		return client.voiceManager.get(oldState.channelId).permissionOverwrites.set([
			{
				id: newState.id,
				deny: [
					Permissions.FLAGS.VIEW_CHANNEL,
					Permissions.FLAGS.SEND_MESSAGES,
					Permissions.FLAGS.READ_MESSAGE_HISTORY,
				],
			},
		])
}

const handleJoin = async (newState, client) => {
	// S'il rejoint un salon qui doit créer un nouveau salon
	if (client.config.voiceManagerChannelsIDs.includes(newState.channelId)) {
		const member = newState.member

		// Création du salon vocal
		const createdChannel = await newState.guild.channels.create(
			`Vocal de ${member.displayName}`,
			{
				type: 'GUILD_VOICE',
				parent: newState.channel.parent,
				permissionOverwrites: [
					{
						id: newState.id,
						allow: [
							Permissions.FLAGS.VIEW_CHANNEL,
							Permissions.FLAGS.CONNECT,
							Permissions.FLAGS.MOVE_MEMBERS,
						],
					},
				],
			},
		)

		// Déplacement du membre dans son nouveau salon vocal
		const moveAction = await member.voice.setChannel(createdChannel).catch(() => null)

		// Si l'utilisateur ne peut pas être move dans le salon créé,
		// on supprime le salon créé
		if (!moveAction) return createdChannel.delete()

		// Ajout de l'id du salon vocal perso dans la liste
		return client.voiceManager.set(createdChannel.id, null)
	}

	// S'il rejoint un salon perso qui a un no-mic
	const noMicChannel = client.voiceManager.get(newState.channelId)
	if (noMicChannel)
		// On lui donne la permission de voir le salon
		return noMicChannel.permissionOverwrites.set([
			{
				id: newState.id,
				allow: [
					Permissions.FLAGS.VIEW_CHANNEL,
					Permissions.FLAGS.SEND_MESSAGES,
					Permissions.FLAGS.READ_MESSAGE_HISTORY,
				],
				deny: [Permissions.FLAGS.CREATE_INSTANT_INVITE],
			},
		])
}

export default (oldState, newState, client) => {
	// Pour uniquement garder les changements de salon et non d'état
	if (oldState.channelId === newState.channelId) return

	// Si l'utilisateur quitte un salon
	if (oldState.channel) handleLeave(oldState, newState, client)

	// Si l'utilisateur rejoint un salon
	if (newState.channel) handleJoin(newState, client)
}
