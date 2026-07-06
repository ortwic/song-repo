export interface MarkupContent {
    type: 'text';
    value: string;
}

export interface QuoteContent {
    type: 'quote';
    value: {
        text: string;
        cite: string;
    };
}

export interface YouTubeContent {
    type: 'youtube';
    value: {
        id: string;
        title: string;
    };
}

export interface ImagesContent {
    type: 'images';
    value: string[];
}

export interface ExpandContent {
    type: 'expand';
    value: {
        title: string;
        description: string;
        content: string;
    };
}
