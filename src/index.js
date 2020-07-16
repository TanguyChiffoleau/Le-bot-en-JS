const {
	events: eventsLoader,
	commands: commandsLoader,
	client: createClient,
} = require('./util/loaders')

if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: './config/bot.env' })

const run = async () => {
	const client = await createClient()

	eventsLoader(client)

	commandsLoader(client)
}

run().catch(error => console.error(error))
