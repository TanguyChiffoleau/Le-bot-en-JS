import { readdir } from 'fs/promises'
import { removeFileExtension } from '../util/util.js'

export default async client => {
	// Dossier des commandes
	const commandsDir = (await readdir('./src/commands')).filter(dir => !dir.endsWith('.js'))

	// Pour chaque catégorie de commandes
	commandsDir.forEach(async commandCategory => {
		// Acquisition des commandes
		const commands = await readdir(`./src/commands/${commandCategory}`)

		// Ajout dans la map utilisée pour la commande "roles"
		client.commandsCategories.set(commandCategory, commands.map(removeFileExtension))

		// Pour chaque commande, on l'acquérit et on
		// l'ajoute dans la map des commandes
		Promise.all(
			commands.map(async commandFile => {
				const command = (await import(`../commands/${commandCategory}/${commandFile}`))
					.default
				client.commands.set(command.name, command)
			}),
		)
	})
}
