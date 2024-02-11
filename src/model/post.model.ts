export interface Post {
    id: string;
    title: string;
    excerpt: string;
    images: PostImage[];
    content: Content[];
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

export type Content = MarkupContent | QuoteContent | YouTubeContent | ImagesContent;

interface MarkupContent {
    type: 'text';
    value: string;
}

interface QuoteContent {
    type: 'quote';
    value: {
        text: string;
        cite: string;
    };
}

interface YouTubeContent {
    type: 'youtube';
    value: {
        id: string;
        title: string;
    };
}

interface ImagesContent {
    type: 'images';
    value: string[];
}