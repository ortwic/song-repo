// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHGNCmvSz_PcqcWMpA4fUnelmaLjxhcBQ",
  authDomain: "mysongrep.firebaseapp.com",
  databaseURL: "https://mysongrep-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mysongrep",
  storageBucket: "mysongrep.appspot.com",
  messagingSenderId: "376407804921",
  appId: "1:376407804921:web:42c5b040cc9ed5cbd3cb28",
  measurementId: "G-VV9BWTP651"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');

export const analytics = getAnalytics(app);

export async function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}
