import { convertDateForDiscord, diffDate, interactionReply } from '../../util/util.js'

export default {
	name: 'whois',
	description: 'Donne des infos sur soit ou un autre utilisateur',
	aliases: [],
	options: [
		{
			type: 'user',
			optDesc: 'Membre',
		},
	],
	usage: {
		arguments: 'user',
		informations: null,
		examples: [
			{
				command: 'whois user',
				explaination: null,
			},
		],
	},
	needArguments: true,
	guildOnly: true,
	requirePermissions: [],
	interaction: interaction => {
		// Acquisition du membre
		const user = interaction.options.getUser('user') || interaction.user
		const member = interaction.guild.members.cache.get(user.id)
		if (!member)
			return interactionReply({
				interaction,
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

		return interactionReply({ interaction, embeds: [embed] })
	},
}
