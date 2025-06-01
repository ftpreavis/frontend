import { useI18n } from 'vue-i18n'

export function useLang() {
	const { t, locale } = useI18n()

	function setLang(lang: string) {
		locale.value = lang
		localStorage.setItem('lang', lang)
	}

	return { t, locale, setLang }
}
