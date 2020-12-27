const { sql } = require('slonik')
const { getPool } = require('../../util/database')

module.exports = {
	name: 'deletecommand',
	description: 'Supprime une commande',
	aliases: ['delcommand'],
	usage: {
		arguments: '<nom_commande>',
		informations: null,
		examples: [
			{
				command: 'deletecommand ma_commande',
				explaination: 'supprime la commande `ma_commande`',
			},
		],
	},
	needArguments: true,
	guildOnly: true,
	requirePermissions: ['MANAGE_MESSAGES'],
	execute: async (client, message, args) => {
		const commandName = args[0]
		const command =
			client.commands.get(commandName) ||
			client.commands.find(({ aliases }) => aliases.includes(commandName))

		// Si la commande n'existe pas ou
		// n'a pas d'id (= pas une commande custom), on return
		if (!command) return message.reply("cette commande n'existe pas 😕")
		if (!command.id) return message.reply('tu ne peux pas supprimer une commande principale 😕')

		// Suppression de la commande dans la BDD
		await getPool().query(sql`DELETE FROM custom_commands WHERE id = ${command.id}`)

		// Suppression commande
		client.commands.delete(command.name)

		// Suppression du message
		client.cache.deleteMessagesID.add(message.id)
		message.delete()

		return message.channel.send({
			embed: {
				color: 'ff0000',
				author: {
					name: `${message.member.displayName} (ID ${message.member.id})`,
					icon_url: message.author.displayAvatarURL({ dynamic: true }),
				},
				title: `Commande **${command.name}** supprimée avec succès 👌`,
				description: command.content,
			},
		})
	},
}
