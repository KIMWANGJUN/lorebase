// src/lib/whisperApi.ts
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  doc,
  getDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Whisper, User } from '@/types';

/**
 * Sends a whisper message. The recipient is identified by their unique ID.
 * @param whisperData - The whisper content, sender info, and recipient's user ID.
 * @returns The ID of the newly created whisper document.
 */
export async function sendWhisper(whisperData: Omit<Whisper, 'id' | 'createdAt' | 'recipientNickname' | 'readAt'>) {
  try {
    // Fetch the recipient's user data to get their current nickname
    const recipientDocRef = doc(db, 'users', whisperData.recipientId);
    const recipientSnap = await getDoc(recipientDocRef);

    if (!recipientSnap.exists()) {
      throw new Error('받는 사람을 찾을 수 없습니다.');
    }
    
    const recipient = recipientSnap.data() as User;
    
    const whisperToSave = {
      ...whisperData,
      recipientNickname: recipient.nickname, // Use the fetched, current nickname
      createdAt: serverTimestamp(),
      readAt: null, // Initially unread
    };

    const docRef = await addDoc(collection(db, 'whispers'), whisperToSave);
    return docRef.id;
  } catch (error) {
    console.error('귓속말 전송 오류:', error);
    throw error;
  }
}

/**
 * Fetches all whispers (sent and received) for a given user ID.
 * @param userId - The ID of the user.
 * @returns An object containing arrays of received and sent whispers.
 */
export async function getWhispersByUser(userId: string) {
  try {
    const whispersCollection = collection(db, 'whispers');

    // Query for whispers received by the user
    const receivedQuery = query(
      whispersCollection,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const receivedSnapshot = await getDocs(receivedQuery);
    const received = receivedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Whisper[];

    // Query for whispers sent by the user
    const sentQuery = query(
      whispersCollection,
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const sentSnapshot = await getDocs(sentQuery);
    const sent = sentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Whisper[];

    return { received, sent };
  } catch (error) {
    console.error('귓속말 가져오기 오류:', error);
    return { received: [], sent: [] };
  }
}
