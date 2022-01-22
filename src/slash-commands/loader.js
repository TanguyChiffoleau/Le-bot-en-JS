import { readdir } from 'fs/promises'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { removeFileExtension } from '../util/util.js'

export default async client => {
	const clientId = client.user.id
	const guildId = client.config.guildID
	const rest = new REST({ version: '9' }).setToken(client.token)
	const commands = []

	// Dossier des commandes
	const commandsDir = (await readdir('./src/slash-commands')).filter(dir => !dir.endsWith('.js'))

	// Pour chaque catégorie de commandes
	commandsDir.forEach(async commandCategory => {
		// Acquisition des commandes
		const commandFiles = await readdir(`./src/slash-commands/${commandCategory}`)

		// Ajout dans la map utilisée pour la commande "roles"
		client.commandsCategories.set(commandCategory, commandFiles.map(removeFileExtension))

		// Pour chaque commande, on l'acquérit et on
		// l'ajoute dans la map des commandes
		Promise.all(
			commandFiles.map(async commandFile => {
				const command = (
					await import(`../slash-commands/${commandCategory}/${commandFile}`)
				).default

				commands.push(command.data.toJSON())
				client.commands.set(command.data.name, command)

				try {
					console.log('Started refreshing application (/) commands')

					await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
						body: commands,
					})

					console.log('Successfully reloaded application (/) commands')
				} catch (error) {
					console.error(error)
				}
			}),
		)
	})
}
