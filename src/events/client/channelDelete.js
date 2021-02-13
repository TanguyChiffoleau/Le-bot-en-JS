const { VoiceChannel } = require('discord.js')

module.exports = (client, channel) => {
	if (channel instanceof VoiceChannel) return client.voiceManager.delete(channel.id)
}
