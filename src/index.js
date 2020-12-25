const {
	events: eventsLoader,
	commands: commandsLoader,
	client: clientLoader,
	customCommands: customCommandsLoader,
} = require('./util/loaders')

// Chargement des variables d'environnement si l'environnement
// n'est pas "production"
if (process.env.NODE_ENV !== 'production') {
	const dotenv = require('dotenv')
	dotenv.config({ path: './config/bot.env' })
}

const run = async () => {
	const client = clientLoader.prepare()

	await Promise.all([commandsLoader(client), eventsLoader(client), customCommandsLoader(client)])

	await clientLoader.login(client)

	console.log('Setup finished')
}

run().catch(error => console.error(error))
