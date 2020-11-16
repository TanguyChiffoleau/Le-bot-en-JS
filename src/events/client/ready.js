/* eslint-disable no-await-in-loop */
const reactionRoleConfig = require('../../../config/reactionRoleConfig.json')

module.exports = async client => {
	console.log('The client is ready to start working')

	// Lecture et en place du système de réactions
	// puis ajout des émojis (peut prendre du temps)
	client.reactionRoleMap = new Map()
	for (const reactionRole of reactionRoleConfig) {
		client.reactionRoleMap.set(reactionRole.messageId, reactionRole)
		const channel = await client.channels.fetch(reactionRole.channelId)
		const message = await channel.messages.fetch(reactionRole.messageId)

		for (const emoji of Object.keys(reactionRole.emojiRoleMap)) await message.react(emoji)
	}
	console.log('Startup finished !')
}
