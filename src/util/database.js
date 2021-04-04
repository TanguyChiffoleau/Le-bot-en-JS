/* eslint-disable no-await-in-loop */
const { createPool, ConnectionError } = require('slonik')

if (process.env.NODE_ENV !== 'production') {
	const dotenv = require('dotenv')
	dotenv.config({ path: './config/database.env' })
}

const {
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_HOST,
	POSTGRES_PORT,
	POSTGRES_DATABASE,
} = process.env

const postgresURI = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}`

const pool = createPool(postgresURI)

// eslint-disable-next-line no-async-promise-executor
const waitDBtoBeReady = new Promise(async (resolve, reject) => {
	let retries = 10
	while (retries)
		try {
			const resConnection = await pool.connect(connection => connection)
			console.log('Successfully connected to the database')
			resolve(resConnection)
			break
		} catch (error) {
			if (!(error instanceof ConnectionError))
				console.error(`Error while trying to connect to the database : ${error}`)

			retries -= 1
			console.error(`Unable to connect to the database, ${retries} retries left, retrying...`)
			await new Promise(res => setTimeout(res, 3000))
		}

	reject(new Error('Unable to connect to the database.'))
})

module.exports = {
	waitDBtoBeReady,
	getPool: () => createPool(postgresURI),
}
