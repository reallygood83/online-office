import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Special code for teacher registration
const SPECIAL_CODE = process.env.NEXT_PUBLIC_SPECIAL_CODE || '20261234';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'teacher';
  isAdmin: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

// Verify special code
export const verifySpecialCode = (code: string): boolean => {
  return code === SPECIAL_CODE;
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  specialCode: string
): Promise<UserData> => {
  // Verify special code first
  if (!verifySpecialCode(specialCode)) {
    throw new Error('잘못된 특별코드입니다. 박달초등학교 교직원에게 문의하세요.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile with display name
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  const userData: Omit<UserData, 'createdAt' | 'lastLoginAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    lastLoginAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid: user.uid,
    email: user.email || email,
    displayName,
    role: 'teacher',
    isAdmin: false,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return {
    ...userData,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  } as UserData;
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<UserData> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update last login time
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });

  // Get user data
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  return userDoc.data() as UserData;
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Get current user data
export const getCurrentUserData = async (uid: string): Promise<UserData | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    return null;
  }
  return userDoc.data() as UserData;
};

// Subscribe to auth state changes
export const subscribeToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
