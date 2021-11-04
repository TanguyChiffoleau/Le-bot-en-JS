import { convertDateForDiscord, diffDate } from '../../util/util.js'

export default async (ban, client) => {
	if (
		ban.user.bot ||
		ban.guild.id !== client.config.guildID ||
		!ban.guild.available
	)
		return

	const logsBansChannel = ban.guild.channels.cache.get(client.config.logsBansChannelID)
	if (!logsBansChannel) return

	// Fetch du membre banni
	const fetchedLog = (
		await ban.guild.fetchAuditLogs({
			type: 'MEMBER_BAN_REMOVE',
			limit: 1,
		})
	).entries.first()
	if (!fetchedLog) return

	const logEmbed = {
		author: {
			name: `${ban.user.username} (ID ${ban.user.id})`,
			icon_url: ban.user.displayAvatarURL({ dynamic: true }),
		},
		fields: [
			{
				name: 'Mention',
				value: ban.user.toString(),
				inline: true,
			},
			{
				name: 'Date de création du compte',
				value: convertDateForDiscord(ban.user.createdAt),
				inline: true,
			},
			{
				name: 'Âge du compte',
				value: diffDate(ban.user.createdAt),
				inline: true,
			},
		],
		timestamp: new Date(),
	}

	const { executor, target } = fetchedLog
	
	if (
		target.id === ban.user.id &&
		fetchedLog.createdTimestamp > Date.now() - 5000
	) {
		logEmbed.color = '17419E'
		logEmbed.footer = {
			icon_url: executor.displayAvatarURL({ dynamic: true }),
			text: `Membre débanni par ${executor.tag}`,
		}
	} else {
		logEmbed.color = '17419E'
		logEmbed.footer = {
			text: `Membre débanni`,
		}
	}

	return logsBansChannel.send({ embeds: [logEmbed] })
}
