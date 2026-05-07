import {
    signInWithPopup,
    reauthenticateWithPopup,
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
import { auth } from '../base/firebase.setup';
import { showInfo } from '../../store/notification.store';
import { app } from '../base/firebase.setup';
import UserService from './user.service';
import { googleDriveService } from '../storage/google-drive.service';

const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file' as const;

export const currentUser = authState(auth);
export const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope(GOOGLE_DRIVE_SCOPE);

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

class AuthService {
    private userService = new UserService();

    constructor() {
        googleDriveService.registerTokenRefresher(() => this.refreshDriveToken());
    }

    async loginWithGoogle(): Promise<void> {
        // signInWithPopup can cause CORS problems in MS Edge (prod only)
        const result = await signInWithPopup(auth, googleProvider);
        const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
        googleDriveService.setAccessToken(token);
        await this.userService.initProfile(result.user, GoogleAuthProvider.PROVIDER_ID);
    }

    async refreshDriveToken(): Promise<string> {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Not authenticated');
        }

        const result = await reauthenticateWithPopup(user, googleProvider);
        const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
        if (token) {
            googleDriveService.setAccessToken(token);
            return token;
        }

        throw new Error('No Drive access token in credential');
    }

    async loginWithMicrosoft(): Promise<void> {
        // signInWithPopup can cause CORS problems in MS Edge (prod only)
        const { user } = await signInWithPopup(auth, msProvider);
        await this.userService.initProfile(user, msProvider.providerId);
    }

    async signUp(email: string, password: string): Promise<void> {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await this.userService.initProfile(user);
    }

    async signIn(email: string, password: string): Promise<void> {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async signOut(): Promise<void> {
        await signOut(auth);
    }

    async sendPasswordResetEmail(email: string): Promise<void> {
        await sendPasswordResetEmail(auth, email);
    }

    async updatePassword(newPassword: string): Promise<void> {
        await updatePassword(auth.currentUser, newPassword);
    }

    async deleteUser(): Promise<void> {
        return deleteUser(auth.currentUser);
    }
}

/** Singleton — ensures the OAuth token and tokenClient survive re-renders. */
export const authService = new AuthService();