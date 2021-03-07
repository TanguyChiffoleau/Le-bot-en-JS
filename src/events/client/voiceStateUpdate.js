module.exports = async (client, oldState, newState) => {
	if (oldState.channelID === newState.channelID) return

	// S'il quitte un channel personnalisé
	if (oldState.channel && client.voiceManager.has(oldState.channelID))
		if (oldState.channel.members.size === 0) {
			// S'il le channel qu'il a quitté est vide

			// Acquisition du channel nomic
			const noMicChannel = client.voiceManager.get(oldState.channelID)
			// S'il existe
			if (noMicChannel)
				// On supprime le channel nomic
				noMicChannel.delete()

			// On supprime le channel de la map
			client.voiceManager.delete(oldState.channelID)

			// Suppression du channel vocal
			// Catch si le channel est déjà supprimé
			oldState.channel.delete().catch(() => null)
		} else if (client.voiceManager.get(oldState.channelID)) {
			// S'il n'est pas vide et qu'il quitte un channel avec un no_mic

			// Suppression des permissions du membre pour le channel no_mic
			client.voiceManager
				.get(oldState.channelID)
				.permissionOverwrites.get(newState.id)
				.delete()
		}

	// Si l'utilisateur rejoint un channel
	if (newState.channel) {
		// S'il rejoint un channel qui doit créer un nouveau channel
		if (client.config.voiceManagerChannelsIDs.includes(newState.channelID)) {
			const member = newState.member

			const permissions = newState.channel.permissionOverwrites.clone().set(member, {
				id: member,
				type: 'member',
				allow: [
					'VIEW_CHANNEL',
					'CONNECT',
					'MANAGE_CHANNELS',
					'MUTE_MEMBERS',
					'DEAFEN_MEMBERS',
					'MOVE_MEMBERS',
				],
			})

			// Création du channel vocal
			const createdChannel = await newState.guild.channels.create(
				`channel de ${member.user.username}`,
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
		const noMicChannel = client.voiceManager.get(newState.channelID)

		if (noMicChannel)
			// On lui donne la permission de voir le channel
			return noMicChannel.updateOverwrite(newState.id, {
				CREATE_INSTANT_INVITE: false,
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				READ_MESSAGE_HISTORY: true,
			})
	}
}
