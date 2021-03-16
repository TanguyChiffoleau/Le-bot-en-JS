import { GuildChannel, VoiceChannel } from 'discord.js'

export default (client, oldChannel, newChannel) => {
	if (!(oldChannel instanceof GuildChannel) || !(newChannel instanceof GuildChannel)) return

	if (!(oldChannel instanceof VoiceChannel) || !(newChannel instanceof VoiceChannel)) return

	if (oldChannel.name === newChannel.name) return

	const { id: voiceChannelID, name: voiceChannelName } = newChannel
	const noMicChannel = client.voiceManager.get(voiceChannelID)
	if (!noMicChannel) return

	return noMicChannel.edit({ name: `no mic ${voiceChannelName}` })
}
