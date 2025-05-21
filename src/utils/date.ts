export function formatDateLabel(date: Date): string {

	console.log(date);

	const today = new Date()
	const isToday = date.toDateString() === today.toDateString()
	const isThisYear = date.getFullYear() === today.getFullYear()

	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		month: 'short',
		day: 'numeric',
	}

	if (!isThisYear) {
		options.year = 'numeric'
	}

	return isToday ? 'Today' : date.toLocaleDateString(undefined, options)
}
