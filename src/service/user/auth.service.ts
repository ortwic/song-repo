import {
    signInWithPopup,
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
import { setUserId } from 'firebase/analytics';
import { authState } from 'rxfire/auth';
import { analytics, auth } from '../base/firebase.setup';
import UserService from './user.service';
import { googleAuthSetupService } from '../storage/google-setup.service';

export const currentUser = authState(auth);

const msProvider = new OAuthProvider('microsoft.com');
msProvider.setCustomParameters({
    prompt: 'consent',
    tenant: '5df890bf-37a1-40ae-956c-71a7f65c2f81',
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (navigator?.onLine) {
            setUserId(analytics, user.uid);

            // Ensure GSI is loaded before attempting silent refresh,
            // avoiding the page-reload race condition.
            await googleAuthSetupService.ensureGsiLoaded();
            await googleAuthSetupService.refreshDriveTokenSilently(user);
        }
    }
});

class AuthService {
    private userService = new UserService();

    // -------------------------------------------------------------------------
    // Google
    // -------------------------------------------------------------------------

    async loginWithGoogle(): Promise<void> {
        // signInWithPopup can cause CORS problems in MS Edge (prod only)
        const { user } = await googleAuthSetupService.signInWithGoogle();
        await this.userService.initProfile(user, GoogleAuthProvider.PROVIDER_ID);
    }

    // -------------------------------------------------------------------------
    // Microsoft
    // -------------------------------------------------------------------------

    async loginWithMicrosoft(): Promise<void> {
        // signInWithPopup can cause CORS problems in MS Edge (prod only)
        const { user } = await signInWithPopup(auth, msProvider);
        await this.userService.initProfile(user, msProvider.providerId);
    }

    // -------------------------------------------------------------------------
    // Email / Password
    // -------------------------------------------------------------------------

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

export const authService = new AuthService();