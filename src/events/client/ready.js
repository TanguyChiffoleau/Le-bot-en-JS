/* eslint-disable no-await-in-loop */
import { readFile } from 'fs/promises'
import { db } from '../../util/util.js'
import { Constants } from 'discord.js'

export const once = true

export default async client => {
	console.log('The client is ready to start working')

	// Lecture et en place du système de réactions
	// puis ajout des émojis (peut prendre du temps)
	const reactionRoleConfig = JSON.parse(await readFile('./config/reactionRoleConfig.json'))
	client.reactionRoleMap = new Map()

	// Pour chaque salon
	for (const { channelID, messageArray } of reactionRoleConfig) {
		// Fetch du salon
		const channel = await client.channels.fetch(channelID)
		// Pour chaque message / réaction
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

	if (client.config.richPresenceText && client.config.richPresenceText !== '')
		await client.user.setPresence({
			activities: [
				{
					name: client.config.richPresenceText,
					type: 'PLAYING',
				},
			],
			status: 'online',
		})
	else await client.user.setPresence({ activities: [], status: 'online' })

	// Réactivation ou désactivation des mutes
	// s'il y en avait en fonction des durées
	const bdd = await db(client, 'userbot')
	if (!bdd) console.log('Une erreur est survenue lors de la connexion à la base de données')

	const sqlCheckMute = 'SELECT * FROM mute'
	const [resultsCheckMute] = await bdd.execute(sqlCheckMute)

	const sqlCheckReminders = 'SELECT * FROM reminders'
	const [resultsReminders] = await bdd.execute(sqlCheckReminders)

	const guild = await client.guilds.fetch(client.config.guildID)

	// Lecture du message d'unmute
	const unmuteDM = await readFile('./forms/unmute.md', { encoding: 'utf8' })

	const embed = {
		color: '#C27C0E',
		title: 'Mute terminé',
		description: unmuteDM,
		author: {
			name: guild.name,
			icon_url: guild.iconURL({ dynamic: true }),
			url: guild.vanityURL,
		},
	}

	const deleteMute = async id => {
		const member = guild.members.cache.get(id)
		const sqlDeleteMute = 'DELETE FROM mute WHERE discordID = ?'
		const dataDeleteMute = [member.id]
		const [resultDeleteMute] = await bdd.execute(sqlDeleteMute, dataDeleteMute)

		if (resultDeleteMute)
			member.send({ embeds: [embed] }).catch(error => {
				console.error(error)
				return error
			})
	}

	const deleteReminder = async id => {
		const member = guild.members.cache.get(id)
		const sqlDeleteReminder = 'DELETE FROM reminders WHERE discordID = ?'
		const dataDeleteReminder = [member.id]
		const [resultDeleteReminder] = await bdd.execute(sqlDeleteReminder, dataDeleteReminder)

		if (!resultDeleteReminder)
			console.log(
				'Une erreur est survenue lors de la suppression du rappel dans la base de données',
			)
	}

	// Mutes
	resultsCheckMute.forEach(async mutedMember => {
		const member = guild.members.cache.get(mutedMember.discordID)
		const mutedRole = client.config.mutedRoleID

		if (
			member.roles.cache.has(mutedRole) &&
			mutedMember.timestampEnd - Math.round(Date.now() / 1000) <= 0
		) {
			member.roles.remove(mutedRole).catch(error => {
				console.error(error)
			})

			await deleteMute()
		} else {
			// Suppression du rôle Muted après le temps écoulé
			// et envoi du message privé
			const removeRole = async () => {
				member.roles.remove(mutedRole).catch(error => {
					if (error.code !== Constants.APIErrors.UNKNOWN_MEMBER) throw error
				})

				await deleteMute()
			}

			setTimeout(
				removeRole,
				(mutedMember.timestampEnd - Math.round(Date.now() / 1000)) * 1000,
			)
		}
	})

	// Rappels
	resultsReminders.forEach(async reminder => {
		const member = guild.members.cache.get(reminder.discordID)

		if (reminder.timestampEnd - Math.round(Date.now() / 1000) <= 0) {
			await deleteReminder(reminder.discordID)

			return member
				.send({
					content: `Rappel : ${reminder.reminder}`,
				})
				.catch(error => {
					console.error(error)
					return error
				})
		}

		setTimeout(async () => {
			await deleteReminder(reminder.discordID)
			return member
				.send({
					content: `Rappel : ${reminder.reminder}`,
				})
				.catch(error => {
					console.error(error)
					return error
				})
		}, (reminder.timestampEnd - Math.round(Date.now() / 1000)) * 1000)
	})
}
