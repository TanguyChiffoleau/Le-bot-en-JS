import { eventsLoader, commandsLoader, prepareClient } from './util/loaders.js'

import { closeGracefully } from './util/util.js'

const run = async () => {
	// Chargement des variables d'environnement si l'environnement
	// n'est pas "production"
	if (process.env.NODE_ENV !== 'production') {
		const dotenv = await import('dotenv')
		dotenv.config({ path: './config/bot.env' })
	}

	const client = prepareClient()

	await commandsLoader(client)

	await eventsLoader(client)

	await client.login()

	console.log('Setup finished')

	process.on('SIGINT', signal => closeGracefully(signal, client))
	process.on('SIGTERM', signal => closeGracefully(signal, client))
}

run().catch(error => console.error(error))
