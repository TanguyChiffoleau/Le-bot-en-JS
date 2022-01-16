import { readdir } from 'fs/promises'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { SlashCommandBuilder } from '@discordjs/builders'
import { removeFileExtension , manageOptions } from '../util/util.js'

export default async client => {
	const clientId = client.config.clientID
	const guildId = client.config.guildID
	const rest = new REST({ version: '9' }).setToken(client.config.discordToken);
	const commands = [];

	// Dossier des commandes
	const commandsDir = (await readdir('./src/slash-commands')).filter(dir => !dir.endsWith('.js'))

	// Pour chaque catégorie de commandes
	commandsDir.forEach(async commandCategory => {
		// Acquisition des commandes
		const commandFiles = await readdir(`./src/slash-commands/${commandCategory}`)

		// Ajout dans la map utilisée pour la commande "roles"
		client.commandsCategories.set(commandCategory, commandFiles.map(removeFileExtension))

		for (const commandFile of commandFiles) {
			const command = (await import(`../slash-commands/${commandCategory}/${commandFile}`)).default
			const slashCommand = new SlashCommandBuilder()
				.setName(command.name)
				.setDescription(command.description);

			commands.push(manageOptions(slashCommand, command.options));
			client.commands.set(command.name, command)
		}
	
		(async () => {
			try {
				console.log('Started refreshing application (/) commands.')
	
				await rest.put(
					Routes.applicationGuildCommands(clientId, guildId),
					{ body: commands },
				);
	
				console.log('Successfully reloaded application (/) commands.')
			} catch (error) {
				console.error(error);
			}
		})();
	})
}