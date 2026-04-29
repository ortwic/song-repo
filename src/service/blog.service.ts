import type { Observable } from 'rxjs';
import { QueryConstraint, orderBy, where } from 'firebase/firestore';
import FirestoreService from './firestore.service';
import type { Post } from '../model/post.model';

const store = new FirestoreService('blog');

export function getBlogPosts(tag?: string): Observable<Post[]> {
    const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('publish_date', 'desc')
    ];
    if (tag) {
        constraints.push(where('tags', 'array-contains', tag));
    }
    
    return store.getDocuments<Post>(...constraints);
}