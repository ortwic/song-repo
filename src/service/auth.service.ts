import {
    signInWithRedirect,
    GoogleAuthProvider,
    OAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updatePassword,
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

const msProvider = new OAuthProvider('microsoft.com');
msProvider.setCustomParameters({
    prompt: 'consent',
    tenant: '5df890bf-37a1-40ae-956c-71a7f65c2f81',
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        setUserId(analytics, user.uid);
        showInfo(`${user.displayName || user.email} has signed in.`);
    }
});

export default class AuthService {
    async loginWithGoogle(): Promise<void> {
        // signInWithPopup can cause CORS problems in MS Edge (prod only)
        await signInWithRedirect(auth, googleProvider);
    }

    async loginWithMicrosoft(): Promise<void> {
        // signInWithPopup can cause CORS problems in MS Edge (prod only)
        await signInWithRedirect(auth, msProvider);
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

    async sendPasswordResetEmail(): Promise<void> {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
    }

    async updatePassword(newPassword: string): Promise<void> {
        await updatePassword(auth.currentUser, newPassword);
    }

    async deleteUser(): Promise<void> {
        return deleteUser(auth.currentUser);
    }
}
