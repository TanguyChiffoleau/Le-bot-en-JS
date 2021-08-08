const handleLeave = (oldState, newState, client) => {
	// S'il quitte un channel non personnalisé, on return
	if (!client.voiceManager.has(oldState.channelId)) return

	// S'il le channel qu'il a quitté est vide
	if (oldState.channel.members.size === 0) {
		// Acquisition du channel nomic
		const noMicChannel = client.voiceManager.get(oldState.channelId)
		// S'il existe
		if (noMicChannel)
			// On supprime le channel nomic
			noMicChannel.delete()

		// On supprime le channel de la map
		client.voiceManager.delete(oldState.channelId)

		// Suppression du channel vocal
		// Catch si le channel est déjà supprimé
		return oldState.channel.delete().catch(() => null)
	}

	// S'il n'est pas vide et qu'il quitte un channel avec un no_mic
	if (client.voiceManager.get(oldState.channelId))
		// Suppression des permissions du membre pour le channel no_mic
		return client.voiceManager
			.get(oldState.channelId)
			.permissionOverwrites.get(newState.id)
			.delete()
}

const handleJoin = async (newState, client) => {
	// S'il rejoint un channel qui doit créer un nouveau channel
	if (client.config.voiceManagerChannelsIDs.includes(newState.channelId)) {
		const member = newState.member

		const permissions = newState.channel.permissionOverwrites.clone().set(member, {
			id: member,
			type: 'member',
			allow: ['VIEW_CHANNEL', 'CONNECT', 'MANAGE_CHANNELS', 'MOVE_MEMBERS'],
		})

		// Création du channel vocal
		const createdChannel = await newState.guild.channels.create(
			`vocal de ${member.displayName}`,
			{
				type: 'voice',
				parent: newState.channel.parent,
				permissionOverwrites: permissions,
			},
		)

		// Déplacement du membre dans son nouveau channel vocal
		const moveAction = await member.voice.setChannel(createdChannel).catch(() => null)

		// Si l'utilisateur ne peut pas être move dans le channel créé,
		// on supprime le channel créé
		if (!moveAction) return createdChannel.delete()

		// Ajout de l'id du channel vocal perso dans la liste
		return client.voiceManager.set(createdChannel.id, null)
	}

	// S'il rejoint un channel perso qui a un no_mic
	const noMicChannel = client.voiceManager.get(newState.channelId)
	if (noMicChannel)
		// On lui donne la permission de voir le channel
		return noMicChannel.updateOverwrite(newState.id, {
			CREATE_INSTANT_INVITE: false,
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
			READ_MESSAGE_HISTORY: true,
		})
}

export default (oldState, newState, client) => {
	// Pour uniquement garder les changements de channels et non d'état
	if (oldState.channelId === newState.channelId) return

	// Si l'utilisateur quitte un channel
	if (oldState.channel) handleLeave(oldState, newState, client)

	// Si l'utilisateur rejoint un channel
	if (newState.channel) handleJoin(newState, client)
}
