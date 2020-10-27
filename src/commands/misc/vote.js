const { convertDate } = require('../../util/util')

module.exports = {
	name: 'vote',
	description: 'Créer un embed avec la proposition et des émojis pour voter',
	aliases: [],
	isEnabled: true,
	needArguments: true,
	guildOnly: true,
	requirePermissions: [],
	execute: async (client, message, args) => {
		message.delete()

		const sentMessage = await message.channel.send({
			embed: {
				color: '00FF00',
				author: {
					name: message.author.tag,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				title: 'Nouveau vote',
				description: `\`\`\`${args.join(' ')}\`\`\``,
				footer: {
					text: convertDate(new Date()),
				},
			},
		})
		await sentMessage.react('✅')
		await sentMessage.react('🤷')
		return sentMessage.react('❌')
	},
}
