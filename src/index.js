const {
	events: eventsLoader,
	commands: commandsLoader,
	client: clientLoader,
	reactionManager: reactionManagerLoader,
} = require('./util/loaders')

if (process.env.NODE_ENV !== 'production') {
	const dotenv = require('dotenv')
	dotenv.config({ path: './config/bot.env' })
	dotenv.config({ path: './config/database.env' })
}

const run = async () => {
	const client = clientLoader.prepare()

	await commandsLoader(client)

	await eventsLoader(client)

	await clientLoader.login(client)

	await reactionManagerLoader(client)

	console.log('Setup finished')
}

run().catch(error => console.error(error))
