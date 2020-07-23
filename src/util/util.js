module.exports = {
	convertDate: date =>
		`${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
			.toString()
			.padStart(2, '0')}/${date
			.getFullYear()
			.toString()
			.padStart(4, '0')} ${date
			.getHours()
			.toString()
			.padStart(2, '0')}:${date
			.getMinutes()
			.toString()
			.padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`,

	diffDate: date => {
		const pluralize = (word, quantity, isAlwaysPlural = false) => {
			if (quantity === 0) return ''
			else if (isAlwaysPlural) return `${quantity} ${word}s`
			return `${quantity} ${word}${quantity > 1 ? 's' : ''}`
		}

		const diff = new Date() - date
		const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12))
		const months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30)) % 12)
		const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 365.25)
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

		if (years !== 0)
			return `${pluralize('année', years)} ${pluralize('moi', months, true)} ${pluralize(
				'jour',
				days,
			)} ${pluralize('heure', hours)} ${pluralize('minute', minutes)}`
		else if (months !== 0)
			return `${pluralize('moi', months, true)} ${pluralize('jour', days)} ${pluralize(
				'heure',
				hours,
			)} ${pluralize('minute', minutes)}`
		else if (days !== 0)
			return `${pluralize('jour', days)} ${pluralize('heure', hours)} ${pluralize(
				'minute',
				minutes,
			)}`
		else if (hours !== 0) return `${pluralize('heure', hours)} ${pluralize('minute', minutes)}`
		else if (minutes !== 0) return pluralize('minute', minutes)

		return `Il y a moins d'une minute`
	},
}
