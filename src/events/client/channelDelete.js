import { VoiceChannel } from 'discord.js'

export default (client, channel) => {
	if (channel instanceof VoiceChannel) return client.voiceManager.delete(channel.id)
}
