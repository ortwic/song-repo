import type { blogger_v3 as B } from '@googleapis/blogger';
import FirestoreService from './firestore.service';
import { lang } from '../store/app.store';
import { showError } from '../store/notification.store';

const blogUrl = 'https://www.googleapis.com/blogger/v3/blogs';
const empty = (item: unknown) => !item;
const cmsKey = `a68cac5f81d3-${lang}`;
const store = new FirestoreService('settings');

interface BlogSettings {
    blogId: string;
    apiKey: string;
}

export const createBlogService = async (fetchBodies = false): Promise<BlogService> => {
    const values = localStorage.getItem(cmsKey)?.split('/');
    if (!values || values.length < 2) {
        const result = await store.getDocument<BlogSettings>('blog');
        if (result) {
            const value = [result.blogId, result.apiKey].join('/');
            localStorage.setItem(cmsKey, value);
        }
        return new BlogService(result, fetchBodies);
    }

    return new BlogService({
        blogId: values[0],
        apiKey: values[1]
    }, fetchBodies);
};

export default class BlogService { 
    private readonly options: RequestInit;

    constructor(private settings?: BlogSettings, private fetchBodies = false) {
        this.options = {
            method: 'GET',
            credentials: 'omit',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'x-goog-api-key': this.settings.apiKey,
                'User-Agent': navigator.userAgent
            }
        };
    }

    async getBlogPosts(...labels: string[]): Promise<B.Schema$Post[]> {
        let path = `posts?fetchBodies=${this.fetchBodies}&fetchImages=true`;
        if (!labels.some(empty)) {
            path += `&labels=${labels.join(',')}`;
        }

        const data = await this.get<B.Schema$PostList>(path);
        return data?.items ?? [];
    }

    async getBlogPost(id: string): Promise<B.Schema$Post> {
        return await this.get<B.Schema$Post>(`posts/${id}`);
    }

    async getBlogPages(): Promise<B.Schema$Page[]> {
        const data = await this.get<B.Schema$PageList>('pages');
        return data?.items ?? [];
    }

    async getBlogPage(pageId: string): Promise<B.Schema$Page> {
        return await this.get<B.Schema$PageList>(`pages/${pageId}`);
    }

    private async get<T>(path: string): Promise<T> {
        return fetch(`${blogUrl}/${this.settings.blogId}/${path}`, this.options)
            .then(result => result.json())
            .catch(error => showError(error));
    }
}