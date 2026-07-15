import { GoogleAuthProvider } from "firebase/auth";
import { authState } from "rxfire/auth";
import { map, startWith, switchMap } from "rxjs";
import type { UserProfile } from "../model/user.model";
import { auth } from "../service/base/firebase.setup";
import { stores } from "../service/base/firestore.service";

const empty = { alias: '' } as UserProfile;

// Do not use currentUser here to avoid circular dependency
export const currentProfile = authState(auth).pipe(
    switchMap((p) => stores.user.getDocument<UserProfile>(p?.uid)),
    map(p => p || empty),
    startWith(empty)
);

export const isGoogleUser = currentProfile.pipe(map(p => p?.provider === GoogleAuthProvider.PROVIDER_ID));
export const isEmailPwdUser = currentProfile.pipe(map(p => !p?.provider));