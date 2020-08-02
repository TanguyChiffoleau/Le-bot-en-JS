const {
	events: eventsLoader,
	commands: commandsLoader,
	client: clientLoader,
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

	clientLoader.login(client)
}

run().catch(error => console.error(error))
