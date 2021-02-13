module.exports = async (client, oldState, newState) => {
	if (oldState.channelID === newState.channelID) return

	// Si l'utilisateur rejoint un channel
	if (newState.channel) {
		// S'il rejoint un channel qui doit créer un nouveau channel
		if (client.config.voiceManagerChannelsIDs.includes(newState.channelID)) {
			const member = newState.member

			// Création du channel vocal
			const createdChannel = await newState.guild.channels.create(
				`${member.user.username}'s channel`,
				{
					type: 'voice',
					parent: newState.channel.parent,
					permissionOverwrites: newState.channel.permissionOverwrites.set(member, {
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
					}),
				},
			)

			// Déplacement du membre dans son nouveau channel vocal
			await member.voice.setChannel(createdChannel)
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
			})
	}

	// S'il quitte un channel

	// Si le channel quitté est un channel pour créer un channel perso
	// ou si le channel n'est pas un channel perso on return
	if (
		client.config.voiceManagerChannelsIDs.includes(oldState.channelID) ||
		!client.voiceManager.has(oldState.channelID)
	)
		return

	// S'il le channel qu'il a quitté est vide
	if (oldState.channel.members.size === 0) {
		const noMicChannel = client.voiceManager.get(oldState.channelID)
		// S'il avait un channel nomic
		if (noMicChannel)
			// On supprime le channel nomic
			noMicChannel.delete()

		// On supprime le channel de la map
		client.voiceManager.delete(oldState.channelID)

		// Suppression du channel vocal
		// Catch si le channel est déjà supprimé
		return oldState.channel.delete().catch(() => null)
	}

	// S'il n'est pas vide et qu'il quitte un channel avec un no_mic
	if (client.voiceManager.get(oldState.channelID))
		// Suppression des permissions du membre pour le channel no_mic
		return client.voiceManager
			.get(oldState.channelID)
			.permissionOverwrites.get(newState.id)
			.delete()
}
