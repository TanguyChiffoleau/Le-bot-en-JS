const { sql, UniqueIntegrityConstraintViolationError } = require('slonik')
const { getPool } = require('../../util/database')

module.exports = {
	name: 'newcommand',
	description: 'Créé une commande',
	aliases: ['nouvellecommande', 'newcommande'],
	usage: null,
	needArguments: true,
	guildOnly: true,
	requirePermissions: ['MANAGE_MESSAGES'],
	execute: async (client, message, args) => {
		const [nameRaw, ...contenuArr] = args
		const name = nameRaw.toLowerCase()
		if (contenuArr.length < 1) return message.reply("tu n'as pas donné de contenu 😕")
		if (
			client.commands.get(name) ||
			client.commands.find(({ aliases }) => aliases.includes(name))
		)
			return message.reply('cette commande existe déjà 😕')

		const contenu = contenuArr.join(' ')
		const author_id = message.author.id
		const timestamp = message.createdAt.toISOString()

		const pool = getPool()

		try {
			await pool.query(
				sql`INSERT INTO "Custom commands" (name, texte, author_id, created_at) VALUES (${name}, ${contenu}, ${author_id}, ${timestamp})`,
			)
		} catch (error) {
			if (error instanceof UniqueIntegrityConstraintViolationError)
				return message.reply('cette commande existe déjà 😕')
			throw error
		}

		// Suppression du message
		client.cache.deleteMessagesID.add(message.id)
		message.delete()

		// Et envoie de l'embed récapitulatif
		return message.channel.send({
			embed: {
				color: '00ff00',
				author: {
					name: `${message.member.displayName} (ID ${message.member.id})`,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				title: `Commande **${name}** créée avec succès 👌`,
				description: contenu,
			},
		})
	},
}
