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
  
  try {
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.log('Firestore not available, skipping lastLogin update');
  }

  return userCredential.user;
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
    console.log('Firestore not available, using fallback user data');
  }
  
  const currentUser = auth.currentUser;
  if (currentUser) {
    return {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || '사용자',
      role: 'teacher',
      isAdmin: true,
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
