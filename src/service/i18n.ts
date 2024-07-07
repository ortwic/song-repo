import { register, init, getLocaleFromNavigator, locale, waitLocale } from 'svelte-i18n';

type InterpolationValues = Record<string, string | number | boolean | Date | null | undefined> | undefined;
interface MessageObject {
    id: string;
    locale?: string;
    format?: string;
    default?: string;
    values?: InterpolationValues;
}

export type MessageFormatter = (id: string | MessageObject, options?: Omit<MessageObject, 'id'>) => string;
export const lang = getLocaleFromNavigator();
export function setupI18n(): Promise<void> {
    register('de', () => import('../data/lang/de.json'));
    register('en', () => import('../data/lang/en.json'));

    init({
        fallbackLocale: 'en',
        initialLocale: lang,
    });

    locale.set(lang);

    return waitLocale(lang);
}
