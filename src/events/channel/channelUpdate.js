import { GuildChannel, VoiceChannel } from 'discord.js'

export default (oldChannel, newChannel, client) => {
	// Si le salon n'est pas un salon de guild, return
	if (!(oldChannel instanceof GuildChannel) || !(newChannel instanceof GuildChannel)) return

	// Si le salon n'est pas un salon vocal, return
	if (!(oldChannel instanceof VoiceChannel) || !(newChannel instanceof VoiceChannel)) return

	// Si son nom n'a pas changé, return
	if (oldChannel.name === newChannel.name) return

	const { id: voiceChannelID, name: voiceChannelName } = newChannel

	// Acquisition du salon no-mic, et return s'il n'y en a pas
	const noMicChannel = client.voiceManager.get(voiceChannelID)
	if (!noMicChannel) return

	// Rename du salon avec no-mic + le nouveau nom du vocal
	return noMicChannel.edit({ name: `No-mic ${voiceChannelName}` })
}
