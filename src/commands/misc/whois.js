const { convertDate, diffDate } = require('../../util/util')

module.exports = {
	name: 'whois',
	description: 'Donne des infos sur soit ou un autre utilisateur',
	aliases: [],
	isEnabled: true,
	needArguments: false,
	guildOnly: true,
	execute: (client, message, args) => {
		// eslint-disable-next-line init-declarations
		let member
		if (args.length === 0) {
			member = message.member
		} else {
			const matches = args[0].match(/^<@!?(\d+)>$|^(\d{16,18})$/)
			if (!matches) return message.reply("je n'ai pas trouvé de mention ou d'ID valable.")

			const targetID = matches[1] || matches[2]
			member = message.guild.members.cache.get(targetID)
		}

		if (!member) return message.reply("je n'ai pas trouvé cet utilisateur.")

		const embed = {
			color: member.displayColor,
			author: {
				name: member.user.tag,
				icon_url: member.user.displayAvatarURL({ dynamic: true }),
			},
			fields: [
				{
					name: 'ID',
					value: member.user.id,
					inline: true,
				},
				{
					name: 'Compte créé le',
					value: convertDate(member.user.createdAt),
					inline: true,
				},
				{
					name: 'Âge du compte',
					value: diffDate(member.user.createdAt),
					inline: true,
				},
				{
					name: 'Mention',
					value: member,
					inline: true,
				},
				{
					name: 'Serveur rejoint le',
					value: convertDate(member.joinedAt),
					inline: true,
				},
				{
					name: 'Est sur le serveur depuis',
					value: diffDate(member.joinedAt),
					inline: true,
				},
			],
		}

		if (member.nickname)
			embed.fields.push({
				name: 'Pseudo',
				value: member.nickname,
				inline: true,
			})

		if (member.premiumSince)
			embed.fields.push({
				name: 'Boost Nitro depuis',
				value: diffDate(member.premiumSince),
				inline: true,
			})

		return message.channel.send({ embed })
	},
}
