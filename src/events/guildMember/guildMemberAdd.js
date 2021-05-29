import { convertDate, diffDate, modifyWrongUsernames } from '../../util/util.js'

export default async (guildMember, client) => {
	const guild = guildMember.guild
	if (guildMember.user.bot || guild.id !== client.config.guildID || !guild.available) return

	modifyWrongUsernames(guildMember).catch(() => null)

	// Acquisition du channel de logs
	const leaveJoinChannel = guild.channels.cache.get(client.config.leaveJoinChannelID)
	if (!leaveJoinChannel) return

	// Envoi du message de join
	const sentMessage = await leaveJoinChannel.send({
		embed: {
			color: '57C92A',
			author: {
				name: `${guildMember.displayName} (ID ${guildMember.id})`,
				icon_url: guildMember.user.displayAvatarURL({ dynamic: true }),
			},
			fields: [
				{
					name: 'Mention',
					value: guildMember,
					inline: true,
				},
				{
					name: 'Date de création du compte',
					value: convertDate(guildMember.user.createdAt),
					inline: true,
				},
				{
					name: 'Âge du compte',
					value: diffDate(guildMember.user.createdAt),
					inline: true,
				},
			],
			footer: {
				text: 'Un utilisateur a rejoint le serveur',
			},
			timestamp: new Date(),
		},
	})

	// Ajout de la réaction pour ban
	const hammerReaction = await sentMessage.react('🔨')

	// Filtre pour la réaction de ban
	const banReactionFilter = (messageReaction, user) =>
		messageReaction.emoji.name === '🔨' &&
		guild.member(user).permissionsIn(leaveJoinChannel).has('BAN_MEMBERS')

	// Création du collecteur de réactions de ban
	const banReactions = await sentMessage.awaitReactions(banReactionFilter, {
		// Une seule réaction/émoji/user
		max: 1,
		maxEmojis: 1,
		maxUsers: 1,
		// 12 heures = 4,32e+7 ms
		idle: 43200000,
	})

	// Si pas de réaction , suppression de la réaction "hammer"
	if (!banReactions.size) return hammerReaction.remove()

	// Acquisition de la réaction de ban et de son user
	const banReaction = banReactions.first()
	const banReactionUser = banReaction.users.cache.filter(user => !user.bot).first()

	// Ajout de la réaction de confirmation
	const checkReaction = await sentMessage.react('✅')

	// Filtre pour la réqction de confirmation
	const confirmReactionFilter = (messageReaction, user) =>
		messageReaction.emoji.name === '✅' && user === banReactionUser

	// Création du collecteur de réactions de confirmation
	const confirmReaction = await sentMessage.awaitReactions(confirmReactionFilter, {
		// Une seule réaction/émoji/user
		max: 1,
		maxEmojis: 1,
		maxUsers: 1,
		// 5 minutes = 300000 ms
		idle: 300000,
	})

	// Suppression des émotes précédentes
	await Promise.all([hammerReaction.remove(), checkReaction.remove()])

	// Si pas de réaction return
	if (!confirmReaction) return

	// Si le membre n'est pas bannisable, réaction avec ❌
	if (!guildMember.bannable) return sentMessage.react('❌')

	// Ban du membre
	const banAction = guildMember.ban({ days: 7, reason: 'Le-bot-en-JS - Raid' }).catch(() => null)

	// Si erreur lors du ban, réaction avec ⚠️
	if (!banAction) return sentMessage.react('⚠️')

	// Sinon réaction avec 🚪 pour confirmer le ban
	return sentMessage.react('🚪')
}
