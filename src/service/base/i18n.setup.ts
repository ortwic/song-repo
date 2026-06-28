import { register, init, getLocaleFromNavigator, locale, waitLocale } from 'svelte-i18n';

export const lang = getLocaleFromNavigator();
export function setupI18n(): Promise<void> {
    register('de', () => import('../../data/lang/de.json'));
    register('en', () => import('../../data/lang/en.json'));

    init({
        fallbackLocale: 'en',
        initialLocale: lang,
    });

    locale.set(lang);

    return waitLocale(lang);
}
