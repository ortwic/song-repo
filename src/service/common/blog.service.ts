// blog.service.ts
import { filter, map, Observable, shareReplay, take } from 'rxjs';
import { orderBy, where } from 'firebase/firestore';
import { stores } from '../base/firestore.service';
import { buildIndex } from '../../utils/index-builder';
import type { Post } from '../../model/post.model';

class BlogService {
    readonly posts$ = stores.blog.getDocuments<Post>(
        where('status', '==', 'published'),
        orderBy('publish_date', 'desc')
    ).pipe(
        // one stream only for multiple subscribers
        shareReplay(1)
    );

    readonly tagIndex$ = this.posts$.pipe(
        map(posts => buildIndex(posts, p => [p.tags]))
    );

    byTag(tag: string): Observable<Post[]> {
        return this.posts$.pipe(
            map(posts => posts.filter(p => p.tags?.includes(tag)))
        );
    }
 
    bySlugOrId(slugOrId: string): Observable<Post | null> {
        return this.posts$.pipe(
            // wait for the posts to be available
            filter(posts => posts.length > 0),
            map(posts => posts.find(p => p.slug === slugOrId || p.id === slugOrId) ?? null),
            take(1)
        );
    }
}

export const blogService = new BlogService();