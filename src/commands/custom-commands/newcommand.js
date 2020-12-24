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
		if (contenuArr.length < 1) return message.reply("tu n'as pas donné de contenu 😕")

		const name = nameRaw.toLowerCase()
		const contenu = contenuArr.join(' ')
		const author_id = message.author.id
		const timestamp = message.createdAt.toISOString()

		const pool = getPool()

		const { rowCount } = await pool
			.query(
				sql`INSERT INTO "Custom commands" (name, texte, author_id, created_at) VALUES (${name}, ${contenu}, ${author_id}, ${timestamp})`,
			)
			.catch(error => {
				if (error instanceof UniqueIntegrityConstraintViolationError)
					return message.reply('cette commande existe déjà 😕')
				throw error
			})

		if (rowCount === 1) {
			client.cache.deleteMessagesID.add(message.id)
			message.delete()

			return message.reply({
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
		}
	},
}
