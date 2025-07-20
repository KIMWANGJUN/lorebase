
import { getAuth, onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { app } from './firebase'; // Make sure this path is correct
import type { User, PostMainCategory } from '@/types';

const auth = getAuth(app);

/**
 * Wraps the Firebase onAuthStateChanged listener in a promise-based function
 * to get the current user. This is useful for server-side rendering or initial
 * client-side data fetching.
 * @returns A promise that resolves to the user object or null if not logged in.
 */
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      unsubscribe(); // Unsubscribe immediately after getting the user to avoid memory leaks
      if (user) {
        // Map the Firebase user to your custom User type
        const appUser: User = {
          id: user.uid,
          username: user.email || '',
          nickname: user.displayName || 'Anonymous',
          email: user.email || '',
          avatar: user.photoURL || '/default-avatar.webp',
          score: 0, // Default value
          rank: 0, // Default value
          tetrisRank: 0, // Default value
          categoryStats: {
            Unity: { score: 0, rankInCate: 0 },
            Unreal: { score: 0, rankInCate: 0 },
            Godot: { score: 0, rankInCate: 0 },
            General: { score: 0, rankInCate: 0 },
          },
          isBlocked: false,
          socialProfiles: {},
          selectedTitleIdentifier: 'none',
          selectedNicknameEffectIdentifier: 'none',
          selectedLogoIdentifier: 'none',
          twoFactorEnabled: false,
          createdAt: Timestamp.now(),
          nicknameLastChanged: Timestamp.now(),
          emailChangesToday: 0,
          lastEmailChangeDate: null,
          passwordChangesToday: 0,
          lastPasswordChangeDate: null,
          isAdmin: false
        };
        resolve(appUser);
      } else {
        resolve(null);
      }
    }, reject); // Pass the reject function to handle any errors during initialization
  });
}


export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    // Optionally, re-throw the error or handle it as needed
    throw error;
  }
}
