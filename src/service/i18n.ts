import { _, register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

export const t = _;
export const lang = getLocaleFromNavigator();
export function setupI18n() {
    register ('de', () => import('../data/lang/de.json'));
    register ('en', () => import('../data/lang/en.json'));

    init({
        fallbackLocale: 'en',
        initialLocale: lang,
    });

    locale.set(lang);
}