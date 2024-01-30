import type { blogger_v3 as B } from '@googleapis/blogger';
import { writable, type Readable } from 'svelte/store';
import FirestoreService from './firestore.service';
import { lang } from './i18n';
import { showError } from '../store/notification.store';

const blogUrl = 'https://www.googleapis.com/blogger/v3/blogs';
const empty = (item: unknown) => !item;
const cmsKey = `a68cac5f81d3-${lang}`;
const store = new FirestoreService('settings');

interface BlogSettings {
    blogId: string;
    apiKey: string;
    labels?: string[];
}

export const getBloggerSettings = async () => {
    const [ blogId, apiKey ] = sessionStorage.getItem(cmsKey)?.split('/') ?? [];    
    if (!apiKey) {
        const result = await store.getDocument<BlogSettings>('blog');
        if (result) {
            const value = [result.blogId, result.apiKey].join('/');
            sessionStorage.setItem(cmsKey, value);
            return result;
        }
    }

    return { blogId, apiKey };
};

const fetchFromBlogger = <T>({ blogId, apiKey }, path: string): Promise<T> => {
    const options: RequestInit = {
        method: 'GET',
        credentials: 'omit',
        referrerPolicy: 'strict-origin-when-cross-origin',
        headers: {
            Accept: 'application/json',
            'x-goog-api-key': apiKey
        }
    };
    return fetch(`${blogUrl}/${blogId}/${path}`, options)
        .then(result => result.json())
        .catch(error => showError(error));
};

export const createBlogService = async (fetchBodies = false): Promise<BlogService> => {
    return new BlogService(await getBloggerSettings(), fetchBodies);
};

export default class BlogService { 
    public readonly posts = writable<B.Schema$Post[]>([]);
    private nextPageToken: string;
    private loading = false;
    private loadingComplete = false;

    constructor(private settings?: BlogSettings, private fetchBodies = false) {
    }

    async loadBlogPosts(...labels: string[]): Promise<Readable<B.Schema$Post[]>> {
        if (!this.loading && !this.loadingComplete) {
            this.loading = true;
            let path = `posts?fetchBodies=${this.fetchBodies}&fetchImages=true`;
            
            if (this.nextPageToken) {
                path += `&pageToken=${this.nextPageToken}`;
            }

            if (!labels.some(empty)) {
                path += `&labels=${labels.join(',')}`;
            }

            try {
                const data = await fetchFromBlogger<B.Schema$PostList>(this.settings, path);
                if (data.items) {
                    this.posts.update(posts => [...posts, ...data.items]);
                    this.nextPageToken = data.nextPageToken;
                } else if (data['error']) {
                    throw data['error'];
                }
                this.loadingComplete = !data.nextPageToken;
            } finally {
                this.loading = false;
            }
        }
        return this.posts;
    }

    async getBlogPost(id: string): Promise<B.Schema$Post> {
        return await fetchFromBlogger<B.Schema$Post>(this.settings, `posts/${id}`);
    }
}