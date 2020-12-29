/* eslint-disable no-await-in-loop */
const reactionRoleConfig = require('../../../config/reactionRoleConfig.json')

module.exports = async client => {
	console.log('The client is ready to start working')

	// Lecture et en place du système de réactions
	// puis ajout des émojis (peut prendre du temps)
	client.reactionRoleMap = new Map()

	for (const { channelID, messageArray } of reactionRoleConfig) {
		const channel = await client.channels.fetch(channelID)
		for (const { messageID, emojiRoleMap } of messageArray) {
			client.reactionRoleMap.set(messageID, emojiRoleMap)
			const message = await channel.messages.fetch(messageID)
			for (const emoji of Object.keys(emojiRoleMap)) await message.react(emoji)
		}
	}

	console.log('Startup finished !')
}
