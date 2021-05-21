import { readdir } from 'fs/promises'
import { removeFileExtension } from '../util/util.js'

export default async client => {
	// Dossier des events
	const eventsDir = (await readdir('./src/events')).filter(dir => !dir.endsWith('.js'))

	// Pour chaque catégorie d'events
	eventsDir.forEach(async eventCategory => {
		// Acquisition des events
		const events = await readdir(`./src/events/${eventCategory}`)

		// Pour chaque event, on l'acquérit et on le charge
		Promise.all(
			events.map(async eventFile => {
				const { default: execute, once } = await import(
					`../events/${eventCategory}/${eventFile}`
				)
				const eventName = removeFileExtension(eventFile)

				if (once) return client.once(eventName, (...args) => execute(...args, client))
				return client.on(eventName, (...args) => execute(...args, client))
			}),
		)
	})
}
