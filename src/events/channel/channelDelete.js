import { VoiceChannel } from 'discord.js'

export default (channel, client) => {
	if (channel instanceof VoiceChannel) return client.voiceManager.delete(channel.id)
}
