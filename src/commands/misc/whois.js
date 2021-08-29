import { convertDateForDiscord, diffDate } from '../../util/util.js'

const getMember = (message, mentionOrID) => {
	if (!mentionOrID) return message.member

	const matches = mentionOrID.match(/^<@!?(\d{17,19})>$|^(\d{17,19})$/)
	if (!matches) return

	const targetID = matches[1] || matches[2]
	return message.guild.members.cache.get(targetID)
}

export default {
	name: 'whois',
	description: 'Donne des infos sur soit ou un autre utilisateur',
	aliases: [],
	usage: {
		arguments: '[id|mention]',
		informations: null,
		examples: [
			{
				command: 'whois 208328464216883200',
				explaination: null,
			},
			{
				command: 'whois @Tanguy#3760',
				explaination: null,
			},
		],
	},
	needArguments: false,
	guildOnly: true,
	requirePermissions: [],
	execute: (client, message, args) => {
		// Acquisition du membre avec la mention/l'ID
		const member = getMember(message, args[0])
		if (!member)
			return message.reply({
				content: "je n'ai pas trouvé cet utilisateur, vérifiez la mention ou l'ID 😕",
			})

		// Création de l'embed
		const embed = {
			color: member.displayColor,
			author: {
				name: `${member.displayName} (ID ${member.id})`,
				icon_url: member.user.displayAvatarURL({ dynamic: true }),
			},
			fields: [
				{
					name: "Compte de l'utilisateur",
					value: member.user.tag,
					inline: true,
				},
				{
					name: 'Compte créé le',
					value: convertDateForDiscord(member.user.createdAt),
					inline: true,
				},
				{
					name: 'Âge du compte',
					value: diffDate(member.user.createdAt),
					inline: true,
				},
				{
					name: 'Mention',
					value: member.toString(),
					inline: true,
				},
				{
					name: 'Serveur rejoint le',
					value: convertDateForDiscord(member.joinedAt),
					inline: true,
				},
				{
					name: 'Est sur le serveur depuis',
					value: diffDate(member.joinedAt),
					inline: true,
				},
			],
		}

		// Ajout d'un field si l'utilisateur boost le serveur
		if (member.premiumSince)
			embed.fields.push({
				name: 'Boost Nitro depuis',
				value: diffDate(member.premiumSince),
				inline: true,
			})

		return message.channel.send({ embeds: [embed] })
	},
}
