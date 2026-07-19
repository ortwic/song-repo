import type { Timestamp } from 'firebase/firestore';
import type { SongRequest, UserSong } from '../model/song.model';

export interface SongRequestView {
    songId: string;
    song?: UserSong;
    count: number;
    latestCreatedAt: Timestamp;
    requestIds: string[];
}

export function groupSongRequests(requests: SongRequest[], songs: UserSong[]): SongRequestView[] {
    const songById = new Map(songs.map((song) => [song.id, song]));
    const grouped = new Map<string, SongRequestView>();

    for (const request of requests) {
        const view = grouped.get(request.songId);
        if (!view) {
            grouped.set(request.songId, {
                songId: request.songId,
                song: songById.get(request.songId),
                count: 1,
                latestCreatedAt: request.createdAt,
                requestIds: [request.id],
            });
            continue;
        }
        view.count++;
        view.requestIds.push(request.id);
        if (request.createdAt.toMillis() > view.latestCreatedAt.toMillis()) {
            view.latestCreatedAt = request.createdAt;
        }
    }

    return [...grouped.values()].sort(
        (a, b) => b.latestCreatedAt.toMillis() - a.latestCreatedAt.toMillis()
    );
}