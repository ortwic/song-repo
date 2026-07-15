// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyA3tk-S5UL96xjZexOiRGfnsNTj2R71utE',
    authDomain: 'song-repo.firebaseapp.com',
    projectId: 'song-repo',
    storageBucket: 'song-repo.appspot.com',
    messagingSenderId: '1090818897368',
    appId: '1:1090818897368:web:c8c9df08bb07d5aa34aead',
    measurementId: 'G-LQJVFK9TMT',
    // measurementId: 'G-8M4PR0FMY8', // beta
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = initAuth();
export const analytics = navigator?.onLine ? getAnalytics(app) : { app };

function initAuth() {
    const auth = getAuth(app);
    const host = import.meta.env.AUTH_EMULATOR_HOST;
    if (import.meta.env.DEV && host) {
        try {
            connectAuthEmulator(auth, `http://${host}`, { disableWarnings: true });
        } catch (error) {
            console.error('Unable to init auth emulator config on ' + host, error);
            return auth;
        }
        console.log('Using auth emulator on ' + host);
    }
    return auth;
}

export function initFirestore() {
    const store = getFirestore(app);
    const host = import.meta.env.FIRESTORE_EMULATOR_HOST;
    if (import.meta.env.DEV && host) {
        try {
            const { hostname, port } = new URL(`http://${host}`);
            connectFirestoreEmulator(store, hostname, +port || 8080);
        } catch (error) {
            console.error('Unable to init firestore emulator config on ' + host, error);
            return store;
        }
        console.log('Using firestore emulator on ' + host);
    }
    return store;
}
