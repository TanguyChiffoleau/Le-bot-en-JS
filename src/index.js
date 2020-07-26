const {
	events: eventsLoader,
	commands: commandsLoader,
	client: clientLoader,
} = require('./util/loaders')

if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: './config/bot.env' })

const run = async () => {
	const client = clientLoader.prepare()

	await commandsLoader(client)

	await eventsLoader(client)

	clientLoader.login(client)
}

run().catch(error => console.error(error))
