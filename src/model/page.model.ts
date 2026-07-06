import { MarkupContent } from "./content.model";

export interface Page { 
    id: string; 
    title: string;
    slug: string;
    lang: 'en-US' | 'de-DE';
    content: PageContent[];
}

export interface PageView { 
    title: string; 
    body: string;
}

export type PageContent = MarkupContent;