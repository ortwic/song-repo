
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
  } from "firebase/auth";
import { authState } from "rxfire/auth";
import { auth } from "./firebase.setup";
import { usersongs } from "../store/song.store";

export const currentUser = authState(auth);
const googleProvider = new GoogleAuthProvider();
// googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');

export default class AuthService {
    async loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }
  
    async signUp(email: string, password: string) {
      return createUserWithEmailAndPassword(auth, email, password);
    }
  
    async signIn(email: string, password: string) {
      return signInWithEmailAndPassword(auth, email, password);
    }
  
    async signOut() {
      signOut(auth);
      usersongs.set([]);
    }
  }
  