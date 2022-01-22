import { readdir } from 'fs/promises'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { removeFileExtension } from '../util/util.js'

export default async client => {
	const clientId = client.user.id
	const guildId = client.config.guildID
	const rest = new REST({ version: '9' }).setToken(client.token)

	// Dossier des commandes
	const commandsDir = (await readdir('./src/slash-commands')).filter(dir => !dir.endsWith('.js'))

	const commands = (
		await Promise.all(
			commandsDir.map(async commandCategory => {
				const commandFiles = await readdir(`./src/slash-commands/${commandCategory}`)

				// Ajout dans la map utilisée pour la commande "roles"
				client.commandsCategories.set(
					commandCategory,
					commandFiles.map(removeFileExtension),
				)

				const test = await Promise.all(
					commandFiles.map(async commandFile => {
						const command = (
							await import(`../slash-commands/${commandCategory}/${commandFile}`)
						).default

						client.commands.set(command.name, command)
						return command.data.toJSON()
					}),
				)

				return test
			}),
		)
	).flat()

	try {
		console.log('Started refreshing application (/) commands')

		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: commands,
		})

		console.log('Successfully reloaded application (/) commands')
	} catch (error) {
		console.error(error)
	}
}
