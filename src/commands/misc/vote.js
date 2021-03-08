import { convertDate } from '../../util/util.js'

export default {
	name: 'vote',
	description: 'Créé un embed avec la proposition et des émojis pour voter',
	aliases: [],
	usage: {
		arguments: '<texte>',
		informations: null,
		examples: [],
	},
	needArguments: true,
	guildOnly: true,
	requirePermissions: [],
	execute: async (client, message, args) => {
		// Suppression du message
		client.cache.deleteMessagesID.add(message.id)
		message.delete()

		// Envoie du message de vote
		const sentMessage = await message.channel.send({
			embed: {
				color: '00FF00',
				author: {
					name: `${message.member.displayName} (ID ${message.member.id})`,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				title: 'Nouveau vote',
				description: `\`\`\`${args.join(' ')}\`\`\``,
				footer: {
					text: convertDate(new Date()),
				},
			},
		})

		// Ajout des réactions pour voter
		await sentMessage.react('✅')
		await sentMessage.react('🤷')
		return sentMessage.react('❌')
	},
}
