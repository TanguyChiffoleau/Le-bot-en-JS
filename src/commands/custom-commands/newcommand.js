const { sql, UniqueIntegrityConstraintViolationError } = require('slonik')
const { getPool } = require('../../util/database')

module.exports = {
	name: 'newcommand',
	description: 'Créé une commande',
	aliases: ['nouvellecommande', 'newcommande'],
	usage: {
		arguments: '<nom_commande> <texte de la commande>',
		informations: null,
		examples: [
			{
				command: 'newcommand ma_commande ceci est ma commande',
				explaination:
					'créé la commande de nom `ma_commande` et avec comme texte "ceci est ma commande"',
			},
		],
	},
	needArguments: true,
	guildOnly: true,
	requirePermissions: ['MANAGE_MESSAGES'],
	execute: async (client, message, args) => {
		const [nameRaw, ...contenuArr] = args
		const name = nameRaw.toLowerCase()
		const contenu = contenuArr.join(' ')
		const author_id = message.author.id
		const timestamp = message.createdAt.toISOString()

		// On return si il n'y a pas de contenu
		if (!contenu) return message.reply("tu n'as pas donné de contenu 😕")
		// ou si la commande existe déjà dans les commandes principales
		if (
			client.commands.get(name) ||
			client.commands.find(({ aliases }) => aliases.includes(name))
		)
			return message.reply('cette commande existe déjà 😕')

		try {
			// Query pour ajouter la commande
			const command = await getPool().one(
				sql`INSERT INTO custom_commands (name, text, author_id, created_at) VALUES (${name}, ${contenu}, ${author_id}, ${timestamp}) RETURNING *`,
			)

			// Ajout de la commande
			client.commands.set(name, command)
		} catch (error) {
			// Si la commande existe déjà
			if (error instanceof UniqueIntegrityConstraintViolationError)
				return message.reply('cette commande existe déjà 😕')

			// Sinon erreur
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
