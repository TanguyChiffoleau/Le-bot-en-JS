import prepareClient from './util/clientLoader.js'
import slashCommandsLoader from './slash-commands/loader.js'
import eventsLoader from './events/loader.js'
import { closeGracefully } from './util/util.js'

const run = async () => {
	console.log('Starting the app ...')

	// Chargement des variables d'environnement si l'environnement
	// n'est pas "production"
	if (process.env.NODE_ENV !== 'production') {
		const dotenv = await import('dotenv')
		dotenv.config({ path: './config/bot.env' })
	}

	const client = prepareClient()

	await client.login(process.env.DISCORD_TOKEN)

	await client.user.setPresence({
		activities: [
			{
				name: 'Starting ...',
				type: 'PLAYING',
			},
		],
		status: 'dnd',
	})

	await eventsLoader(client)

	await slashCommandsLoader(client)

	console.log('Setup finished')

	if (client.config.richPresenceText && client.config.richPresenceText !== '')
		await client.user.setPresence({
			activities: [
				{
					name: client.config.richPresenceText,
					type: 'PLAYING',
				},
			],
			status: 'online',
		})
	else await client.user.setPresence({ activities: [], status: 'online' })

	process.on('SIGINT', signal => closeGracefully(signal, client))
	process.on('SIGTERM', signal => closeGracefully(signal, client))
}

run().catch(error => console.error(error))
