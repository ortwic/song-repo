import { ArrayStore } from './array.class';
import type { UserSong } from '../model/song.model';

export const usersongs = new ArrayStore<UserSong>();
