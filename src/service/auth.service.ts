import { authState } from "rxfire/auth";
import { auth } from "./firebase.setup";
import { songs } from "../store/song.store";

export const currentUser = authState(auth);

export function signOut() {
    auth.signOut();
    songs.set([]);
}
