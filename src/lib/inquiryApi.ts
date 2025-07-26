import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
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
      
      // Firestore 데이터를 Inquiry 타입으로 안전하게 변환
      return {
        id: doc.id,
        userId: data.userId,
        userNickname: data.userNickname,
        title: data.title,
        content: data.content,
        category: data.category,
        status: data.status,
        createdAt: data.createdAt, // 원래 Firestore 타입 유지
        reply: data.reply,
        repliedAt: data.repliedAt,
        repliedBy: data.repliedBy,
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

/**
 * 클라이언트에서 표시할 수 있도록 Inquiry 객체의 날짜를 문자열로 변환
 * @param inquiry Firestore에서 가져온 Inquiry 객체
 * @returns 날짜가 문자열로 변환된 객체
 */
export function formatInquiryForDisplay(inquiry: Inquiry) {
  const formatDate = (date: any) => {
    if (!date) return null;
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return null;
  };

  return {
    ...inquiry,
    createdAt: formatDate(inquiry.createdAt),
    repliedAt: inquiry.repliedAt ? formatDate(inquiry.repliedAt) : undefined,
  };
}
