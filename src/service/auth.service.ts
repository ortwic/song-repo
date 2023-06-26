import { authState } from "rxfire/auth";
import { auth } from "./firebase.setup";
import { usersongs } from "../store/song.store";

export const currentUser = authState(auth);

export function signOut() {
    auth.signOut();
    usersongs.set([]);
}
