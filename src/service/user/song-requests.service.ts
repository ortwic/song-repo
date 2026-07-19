import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { Observable, switchMap, of } from 'rxjs';
import { Timestamp, orderBy } from 'firebase/firestore';
import { currentUser } from './auth.service';
import { stores } from '../base/firestore.service';
import type { SongRequest } from '../../model/song.model';

export default class SongRequestService {
    private uid: string | undefined;
    readonly requests$: Observable<SongRequest[]>;

    constructor() {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        this.requests$ = currentUser.pipe(
            switchMap(user => user?.uid
                ? stores.userRequests(user.uid).getDocuments<SongRequest>(orderBy('createdAt', 'desc'))
                : of([]))
        );
    }

    async addRequest(targetUid: string, songId: string): Promise<string> {
        const newRequest: SongRequest = {
            id: DateTime.now().toFormat('yyMMdd-HHmmssSSS_') + nanoid(4),
            songId,
            status: 'open',
            createdAt: Timestamp.now(),
        };
        await stores.userRequests(targetUid).setDocument(newRequest);
        return newRequest.id;
    }

    async markDone(requestIds: string[]): Promise<void> {
        if (this.uid) {        
            requestIds.map((id) => stores.userRequests(this.uid!).updateDocument({ status: 'done' }, id));
        }
    }
}