import { marked } from "marked";
import { refData } from "../base/app-cache.setup";
import { lang } from "../base/i18n.setup";
import type { PageView } from "../../model/page.model";

const idPostfix = lang.startsWith('de') ? '_de' : '_en';

export function getPage(id: string): PageView {
    const page = refData.pages.find((v) => v.id === id + idPostfix);
    if (page) {
        const body = page.content
            .filter(c => c.type === 'text')
            .map(c => c.value)
            .join('\n');
        return {
            title: page.title,
            body: marked(body)
        };
    }
    
    return null;
}