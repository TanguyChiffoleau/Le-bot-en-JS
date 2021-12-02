import { convertDateForDiscord, diffDate, modifyWrongUsernames } from '../../util/util.js'
import { readFile } from 'fs/promises'
const removeAddedReactions = reactions => Promise.all(reactions.map(reaction => reaction.remove()))

export default async (guildMember, client) => {
	const guild = guildMember.guild
	if (guildMember.user.bot || guild.id !== client.config.guildID || !guild.available) return

	modifyWrongUsernames(guildMember).catch(() => null)

	// Acquisition du channel de logs
	const leaveJoinChannel = guild.channels.cache.get(client.config.leaveJoinChannelID)
	if (!leaveJoinChannel) return

	// Envoi du message de join
	const sentMessage = await leaveJoinChannel.send({
		embeds: [
			{
				color: '57C92A',
				author: {
					name: `${guildMember.displayName} (ID ${guildMember.id})`,
					icon_url: guildMember.user.displayAvatarURL({ dynamic: true }),
				},
				fields: [
					{
						name: 'Mention',
						value: guildMember.toString(),
						inline: true,
					},
					{
						name: 'Date de création du compte',
						value: convertDateForDiscord(guildMember.user.createdAt),
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
		],
	})

	// Si le membre n'est pas bannisable, réaction avec ❌
	if (!guildMember.bannable) return sentMessage.react('❌')

	// Lecture des fichiers de configuration
	const emotesConfig = new Map(JSON.parse(await readFile('./config/banEmotesAtJoin.json')))
	const banDM = await readFile('./forms/ban.md', { encoding: 'utf8' })

	const reactionsList = []
	for (const [emoji] of emotesConfig) {
		// eslint-disable-next-line no-await-in-loop
		const sentReaction = await sentMessage.react(emoji)
		reactionsList.push(sentReaction)
	}

	// Filtre pour la réaction de ban
	const banReactionFilter = ({ _emoji: emoji }, user) =>
		(emotesConfig.has(emoji.name) || emotesConfig.has(emoji.id)) &&
		guild.members.cache.get(user.id).permissionsIn(leaveJoinChannel).has('BAN_MEMBERS') &&
		!user.bot

	// Création du collecteur de réactions de ban
	const banReactions = await sentMessage.awaitReactions({
		filter: banReactionFilter,
		// Une seule réaction/émoji/user
		max: 1,
		maxEmojis: 1,
		maxUsers: 1,
		// 12 heures = 4,32e+7 ms
		idle: 43200000,
	})

	// Si réaction correcte ajoutée ou temps écoulé,
	// on supprime les réactions ajoutées
	await removeAddedReactions(reactionsList)

	// Si pas de réaction, return
	if (!banReactions.size) return

	// Acquisition de la réaction de ban et de son user
	const { users: banReactionUsers, _emoji: banReactionEmoji } = banReactions.first()
	const banReactionUser = banReactionUsers.cache.filter(user => !user.bot).first()

	// Ajout de la réaction de confirmation
	const confirmationReaction = await sentMessage.react('✅')

	// Filtre pour la réaction de confirmation
	const confirmReactionFilter = (messageReaction, user) =>
		messageReaction.emoji.name === '✅' && user === banReactionUser

	// Création du collecteur de réactions de confirmation
	const confirmationReactions = await sentMessage.awaitReactions({
		filter: confirmReactionFilter,
		// Une seule réaction/émoji/user
		max: 1,
		maxEmojis: 1,
		maxUsers: 1,
		// 5 minutes = 300000 ms
		idle: 300000,
	})

	// Si réaction correcte ajoutée ou temps écoulé,
	// on supprime la réaction de confirmation
	await confirmationReaction.remove()

	// Si pas de réaction de confirmation return
	if (!confirmationReactions) return

	// Définition de la variable "reason" suivant la réaction cliquée
	const reason = emotesConfig.get(banReactionEmoji.name) || emotesConfig.get(banReactionEmoji.id)

	// Création de l'embed
	const embed = {
		color: '#C27C0E',
		title: 'Bannissement',
		description: banDM,
		author: {
			name: guild.name,
			icon_url: guild.iconURL({ dynamic: true }),
			url: guild.vanityURL,
		},
		fields: [
			{
				name: 'Raison du bannissement',
				value: reason,
			},
		],
	}

	// Envoi du message de bannissement en message privé
	try {
		await guildMember.send({ embeds: [embed] })
	} catch (error) {
		await sentMessage.react('❌')
	}

	// Ban du membre
	const banAction = guildMember
		.ban({ days: 7, reason: `${client.user.tag} - ${reason}` })
		.catch(() => null)

	// Si erreur lors du ban, réaction avec ⚠️
	if (!banAction) return sentMessage.react('⚠️')

	// Sinon réaction avec 🚪 pour confirmer le ban
	return sentMessage.react('🚪')
}
