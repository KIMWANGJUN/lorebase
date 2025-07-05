// src/lib/inquiryApi.ts
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Inquiry } from '@/types';

/**
 * Fetches inquiries for a specific user from Firestore.
 * @param userId The ID of the user whose inquiries to fetch.
 * @returns A promise that resolves to an array of inquiries.
 */
export async function getInquiriesByUser(userId: string): Promise<Inquiry[]> {
  try {
    const inquiriesCollection = collection(db, 'inquiries');
    const q = query(
      inquiriesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const inquiries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
      } as Inquiry;
    });

    return inquiries;
  } catch (error) {
    console.error("Error fetching inquiries from Firestore:", error);
    return [];
  }
}

/**
 * Adds a new inquiry to Firestore.
 * @param inquiry The inquiry object to add.
 * @returns A promise that resolves when the inquiry is added.
 */
export async function addInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<void> {
    try {
        const inquiriesCollection = collection(db, 'inquiries');
        await addDoc(inquiriesCollection, {
            ...inquiry,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding inquiry to Firestore: ", error);
        throw new Error('문의를 추가하는 중에 오류가 발생했습니다.');
    }
}
