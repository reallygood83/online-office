import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/types';

const DEV_SPECIAL_CODE = '20261234';

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  try {
    const userData: Omit<User, 'uid'> = {
      email,
      displayName,
      role: 'teacher',
      isAdmin: false,
      createdAt: serverTimestamp() as any,
      lastLoginAt: serverTimestamp() as any,
    };
    await setDoc(doc(db, 'users', user.uid), userData);
  } catch (error) {
    console.log('Firestore not available, skipping user document creation');
  }

  return user;
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists() || !userSnap.data().email) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || '사용자',
        role: 'teacher',
        isAdmin: userSnap.exists() ? userSnap.data().isAdmin || false : false,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    } else {
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (error) {
    console.error('Failed to update user document:', error);
  }

  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getUserData(uid: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as User;
    }
  } catch (error) {
    console.error('Failed to get user data from Firestore:', error);
  }
  
  const currentUser = auth.currentUser;
  if (currentUser) {
    return {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || '사용자',
      role: 'teacher',
      isAdmin: false,
      createdAt: null as any,
      lastLoginAt: null as any,
    };
  }
  
  return null;
}

export async function verifySpecialCode(code: string): Promise<boolean> {
  try {
    const settingsRef = doc(db, 'settings', 'main');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data().specialCode === code;
    }
  } catch (error) {
    console.log('Firestore not available, using dev fallback');
  }
  
  return code === DEV_SPECIAL_CODE;
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
