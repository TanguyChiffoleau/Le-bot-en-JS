const { sql } = require('slonik')
const { getPool } = require('../../util/database')

module.exports = {
	name: 'editcommand',
	description: "Modifie le contenu d'une commande",
	aliases: ['editcommande'],
	usage: {
		arguments: '<nom_commande> <nouveau_contenu>',
		informations: null,
		examples: [
			{
				command: 'editcommand ma_commande mon nouveau contenu',
				explaination:
					'modifie la commande `ma_commande`, le bot répondra dorénavant "mon nouveau contenu" lors de l\'utilisation de la commande',
			},
		],
	},
	needArguments: true,
	guildOnly: true,
	requirePermissions: ['MANAGE_MESSAGES'],
	execute: async (client, message, args) => {
		const [nameRaw, ...contentArr] = args
		const name = nameRaw.toLowerCase()
		const content = contentArr.join(' ')

		// On return si la commande n'existe pas
		const command =
			client.commands.get(name) ||
			client.commands.find(({ aliases }) => aliases.includes(name))
		if (!command) return message.reply("cette commande n'existe pas 😕")

		// ou s'il n'y a pas de contenu
		if (!content) return message.reply("tu n'as pas donné de contenu 😕")

		// Query pour modifier le contenu de la commande
		const updatedCommand = await getPool().one(
			sql`UPDATE custom_commands SET content = ${content} WHERE id = ${command.id} RETURNING *;`,
		)

		// Update de la commande
		client.commands.set(updatedCommand.name, updatedCommand)

		// Suppression du message
		client.cache.deleteMessagesID.add(message.id)
		message.delete()

		// et envoie de l'embed récapitulatif
		return message.channel.send({
			embed: {
				color: 'ffff00',
				author: {
					name: `${message.member.displayName} (ID ${message.member.id})`,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				title: `Commande **${name}** a été modifié avec succès 👌`,
				description: updatedCommand.content,
			},
		})
	},
}
