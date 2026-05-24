import { marked } from "marked";
import { refData } from "./app.service";
import { lang } from "../base/i18n.setup";

const idPostfix = lang.startsWith('de') ? '_de' : '_en';

export function getPage(id: string) {
    const page = refData.pages.find((v) => v.id === id + idPostfix);
    if (page) {
        return {
            title: page.title,
            body: marked(page.body)
        };
    }
    
    return {
        title: '404 - Not found',
        body: `Page '${id}' not found`
    };
}