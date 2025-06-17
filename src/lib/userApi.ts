
// src/lib/userApi.ts
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/types';

/**
 * Fetches a single user from Firestore by their ID.
 * @param id The ID of the user to fetch.
 * @returns A promise that resolves to the user object or null if not found.
 */
export async function getUser(id: string): Promise<User | null> {
  try {
    const userDocRef = doc(db, 'users', id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    } else {
      console.warn(`User with ID ${id} not found.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user from Firestore:", error);
    return null;
  }
}
