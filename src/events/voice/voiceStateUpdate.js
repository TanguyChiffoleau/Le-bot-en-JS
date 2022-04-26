import { Permissions, Constants } from 'discord.js'

const colors = ['⚪', '⚫', '🔵', '🟤', '🟢', '🟠', '🟣', '🔴', '🟡']
const colorPool = []

for (const i of colors) for (const j of colors) if (i !== j) colorPool.push(i + j)

const getColor = () => {
	// S'il reste des couleurs unitaires, couleur unique
	if (colors.length) return colors.splice(Math.floor(Math.random() * colors.length), 1)[0]

	// Sinon couple de couleurs
	return colorPool.splice(Math.floor(Math.random() * colorPool.length), 1)[0]
}

const addColor = color => {
	// Si couleur unique
	if (color.charAt(1) === ' ') return colors.push(color)

	// Sinon couple de couleurs
	return colorPool.push(color)
}

const getChannelColor = channelName => channelName.slice(0, 3)

const handleLeave = (oldState, newState, client) => {
	// S'il quitte un salon non personnalisé, on return
	if (!client.voiceManager.has(oldState.channelId)) return

	// S'il le salon qu'il a quitté est vide
	if (oldState.channel.members.size === 0) {
		// Acquisition du salon no-mic
		const noMicChannel = client.voiceManager.get(oldState.channelId)
		// S'il existe
		if (noMicChannel)
			// On supprime le salon no-mic
			noMicChannel.delete()

		// On supprime le salon de la map
		client.voiceManager.delete(oldState.channelId)
		addColor(getChannelColor(oldState.channel.name))

		// Suppression du salon vocal
		// Catch si le salon est déjà supprimé
		return oldState.channel.delete().catch(() => null)
	}

	// S'il n'est pas vide et qu'il quitte un salon avec un no-mic
	if (client.voiceManager.get(oldState.channelId))
		// Suppression des permissions du membre pour le salon no-mic
		return client.voiceManager.get(oldState.channelId).permissionOverwrites.delete(newState.id)
}

const handleJoin = async (newState, client) => {
	// S'il rejoint un salon qui doit créer un nouveau salon
	if (client.config.voiceManagerChannelsIDs.includes(newState.channelId)) {
		const member = newState.member

		// Setup des permissions
		const permissions = newState.channel.permissionOverwrites.cache.clone().set(member, {
			id: member,
			type: Constants.OverwriteTypes.member,
			allow: [
				Permissions.FLAGS.VIEW_CHANNEL,
				Permissions.FLAGS.CONNECT,
				Permissions.FLAGS.MOVE_MEMBERS,
			],
		})

		// Création du salon vocal
		const createdChannel = await newState.guild.channels.create(`${getColor()} vocal`, {
			type: Constants.ChannelTypes.GUILD_VOICE,
			parent: newState.channel.parent,
			permissionOverwrites: permissions,
		})

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
		return noMicChannel.permissionOverwrites.edit(newState.id, {
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
			READ_MESSAGE_HISTORY: true,
		})
}

export default (oldState, newState, client) => {
	// Pour uniquement garder les changements de salon et non d'état
	if (oldState.channelId === newState.channelId) return

	// Si l'utilisateur quitte un salon
	if (oldState.channel) handleLeave(oldState, newState, client)

	// Si l'utilisateur rejoint un salon
	if (newState.channel) handleJoin(newState, client)
}
