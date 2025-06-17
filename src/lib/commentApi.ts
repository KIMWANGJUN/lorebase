
// src/lib/commentApi.ts
import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import type { Comment } from '@/types';

/**
 * Fetches all comments for a specific post from Firestore.
 * @param postId The ID of the post for which to fetch comments.
 * @returns A promise that resolves to an array of comments, sorted by creation date.
 */
export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  try {
    const commentsCollection = collection(db, 'comments');
    const q = query(
      commentsCollection,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc') // Show oldest comments first
    );
    const querySnapshot = await getDocs(q);

    const comments = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        // replies are assumed to be nested or handled separately if they are subcollections
        replies: data.replies || [], 
      } as Comment;
    });

    return comments;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
}

/**
 * Adds a new comment to a post.
 * @param commentData The data for the new comment.
 * @returns A promise that resolves to the new comment's ID.
 */
export async function addComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'replies'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      ...commentData,
      createdAt: serverTimestamp(),
      replies: [], // Start with no replies
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment.");
  }
}
