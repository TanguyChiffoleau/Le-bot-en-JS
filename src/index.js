import {
	events as eventsLoader,
	commands as commandsLoader,
	client as clientLoader,
} from './util/loaders.js'

import { closeGracefully } from './util/util.js'

// Chargement des variables d'environnement si l'environnement
// n'est pas "production"
if (process.env.NODE_ENV !== 'production') {
	const dotenv = await import('dotenv')
	dotenv.config({ path: './config/bot.env' })
}

const run = async () => {
	const client = clientLoader.prepare()

	await commandsLoader(client)

	await eventsLoader(client)

	await clientLoader.login(client)

	console.log('Setup finished')

	process.on('SIGINT', signal => closeGracefully(signal, client))
	process.on('SIGTERM', signal => closeGracefully(signal, client))
}

run().catch(error => console.error(error))
