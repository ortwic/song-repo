export interface Post {
    id: string;
    title: string;
    excerpt: string;
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

export interface PostContent {
    type: 'text' | 'quote' | 'youtube' | 'images';
    value: string;
}