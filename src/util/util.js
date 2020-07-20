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
		const diff = new Date().now - date
		const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12))
		const months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30)) % 12)
		const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 365.25)
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

		if (years !== 0)
			return `${years} année(s) ${months} mois ${days} jour(s) ${hours} heure(s) ${minutes} minute(s)`
		else if (months !== 0)
			return `${months} mois ${days} jour(s) ${hours} heure(s) ${minutes} minute(s)`
		else if (days !== 0) return `${days} jour(s) ${hours} heure(s) ${minutes} minute(s)`
		else if (hours !== 0) return `${hours} heure(s) ${minutes} minute(s)`
		else if (minutes !== 0) return `${minutes} minute(s)`

		return `À l'instant`
	},
}
