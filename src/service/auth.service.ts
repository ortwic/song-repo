import {
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    deleteUser,
} from 'firebase/auth';
import { getAnalytics, setUserId } from 'firebase/analytics';
import { authState } from 'rxfire/auth';
import { auth } from './firebase.setup';
import { showInfo } from '../store/notification.store';
import { app } from '../service/firebase.setup';

export const currentUser = authState(auth);
const googleProvider = new GoogleAuthProvider();
// googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
export const analytics = getAnalytics(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        setUserId(analytics, user.uid);
        showInfo(`${user.displayName || user.email} has signed in.`);
    }
});

export default class AuthService {
    async loginWithGoogle(): Promise<void> {
        await signInWithPopup(auth, googleProvider);
    }

    async signUp(email: string, password: string): Promise<void> {
        await createUserWithEmailAndPassword(auth, email, password);
    }

    async signIn(email: string, password: string): Promise<void> {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async signOut(): Promise<void> {
        await signOut(auth);
    }

    async deleteUser(): Promise<void> {
        return deleteUser(auth.currentUser);
    }
}
