import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { Observable, switchMap, of, map, combineLatest, shareReplay } from 'rxjs';
import { Timestamp, orderBy } from 'firebase/firestore';
import { currentUser } from './auth.service';
import SongService from './user-song.service';
import { stores } from '../base/firestore.service';
import type { SongRequest, SongRequestViewGroup, SongRequestView } from '../../model/song-request.model';

export default class SongRequestService {
    private uid: string | undefined;
    readonly requests$: Observable<SongRequestView[]>;

    constructor(private songService: SongService) {
        currentUser.subscribe((user) => (this.uid = user?.uid));
        const rawRequests$ = currentUser.pipe(
            switchMap((user) =>
                user?.uid
                    ? stores.userRequests(user.uid).getDocuments<SongRequest>(orderBy('createdAt', 'desc'))
                    : of([])
            ),
            shareReplay(1)
        );

        this.requests$ = combineLatest([rawRequests$, this.songService.usersongsMap$]).pipe(
            map(([requests, songMap]) =>
                requests.map((r) => Object.assign(r, { song: songMap.get(r.songId) }))
            ),
            shareReplay(1)
        );
    }

    pendingRequestsAsGroup(): Observable<SongRequestViewGroup[]> {
        function setGroup(groups: Map<string, SongRequestViewGroup>, request: SongRequestView) {
            const exists = groups.get(request.songId);
            if (!exists) {
                groups.set(request.songId, {
                    songId: request.songId,
                    song: request.song,
                    latestCreatedAt: request.createdAt,
                    requestIds: [request.id],
                    count: 1,
                });
            } else {
                exists.count++;
                exists.requestIds.push(request.id);
                if (request.createdAt.toMillis() > exists.latestCreatedAt.toMillis()) {
                    exists.latestCreatedAt = request.createdAt;
                }
            }
            return groups;
        }

        return this.requests$.pipe(
            map(requests => requests
                .filter((r) => r.status !== 'done')
                .reduce(setGroup, new Map<string, SongRequestViewGroup>())
                .values()
                .toArray()
                .sort(
                    (a, b) => b.latestCreatedAt.toMillis() - a.latestCreatedAt.toMillis()
                )
            )
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

    async markSeen(requestIds: string[]): Promise<void> {
        return this.setStatus(requestIds, 'seen');
    }

    async markDone(requestIds: string[]): Promise<void> {
        return this.setStatus(requestIds, 'done');
    }

    private async setStatus(requestIds: string[], status: SongRequest['status']): Promise<void> {
        if (this.uid && requestIds.length > 0) {
            const store = stores.userRequests(this.uid);
            const changedAt = Timestamp.now();
            await Promise.all(requestIds.map((id) => store.updateDocument({ status, changedAt }, id)));
        }
    }
}