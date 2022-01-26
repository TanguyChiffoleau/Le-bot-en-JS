/* eslint-disable no-await-in-loop */
import { readFile } from 'fs/promises'

export const once = true

export default async client => {
	console.log('The client is ready to start working')

	// Lecture et en place du système de réactions / boutons
	// puis ajout des émojis (peut prendre du temps)
	const interactionRoleConfig = JSON.parse(await readFile('./config/interactionRoleConfig.json'))
	client.interactionRoleMap = new Map()
	const reactionRoleConfig = JSON.parse(await readFile('./config/reactionRoleConfig.json'))
	client.reactionRoleMap = new Map()

	// Pour chaque message / boutons
	// Ajout dans la map pour être utilisé dans les events
	for (const { messageArray } of interactionRoleConfig)
		for (const { messageID, interactionRoleMap } of messageArray)
			client.interactionRoleMap.set(messageID, interactionRoleMap)

	// Pour chaque channel
	for (const { channelID, messageArray } of reactionRoleConfig) {
		// Fetch du channel
		const channel = await client.channels.fetch(channelID)
		// Pour chaque message/réactions
		for (const { messageID, emojiRoleMap } of messageArray) {
			// Ajout dans la map pour être utilisé dans les events
			client.reactionRoleMap.set(messageID, emojiRoleMap)
			// Fetch du message
			const message = await channel.messages.fetch(messageID)
			// Ajout des émojis sur le message
			for (const emoji of Object.keys(emojiRoleMap)) await message.react(emoji)
		}
	}

	console.log('Startup finished !')
}
