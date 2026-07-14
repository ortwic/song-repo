import { MarkupContent, QuoteContent, YouTubeContent, ImagesContent } from "./content.model";

export interface Post {
    id: string;
    title: string;
    slug?: string;
    lang?: 'en-US' | 'de-DE';
    excerpt?: string;
    images: PostImage[];
    content: PostContent[];
    tags: string[];
    status: 'published' | 'draft';
    publish_date: Date;
    created_on: Date;
    reviewed: boolean;
}

interface PostImage {
    type: 'file' | 'url';
    value: string;
}

export type PostContent = MarkupContent | QuoteContent | YouTubeContent | ImagesContent;
