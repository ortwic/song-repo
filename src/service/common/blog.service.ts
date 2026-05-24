// blog.service.ts
import { map, shareReplay } from 'rxjs';
import { orderBy, where } from 'firebase/firestore';
import { stores } from '../base/firestore.service';
import { buildIndex } from '../../utils/index-builder';
import type { Post } from '../../model/post.model';

class BlogService {
    readonly posts$ = stores.blog.getDocuments<Post>(
        where('status', '==', 'published'),
        orderBy('publish_date', 'desc')
    ).pipe(
        shareReplay(1) // one stream only for multiple subscribers
    );

    readonly tagIndex$ = this.posts$.pipe(
        map(posts => buildIndex(posts, p => [p.tags]))
    );

    byTag(tag: string) {
        return this.posts$.pipe(
            map(posts => posts.filter(p => p.tags?.includes(tag)))
        );
    }
}

export const blogService = new BlogService();