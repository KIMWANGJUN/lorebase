
// src/lib/postApi.ts
import { db } from './firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, serverTimestamp, query, where, orderBy, limit, DocumentData } from 'firebase/firestore';
import type { Post, User, PostMainCategory, PostType } from '@/types';
import { getUser } from './userApi';

// Helper function to fetch author and enrich post data
async function enrichPostWithAuthor(postData: DocumentData, id: string): Promise<Post> {
  const author = await getUser(postData.authorId);
  if (!author) {
    const placeholderAuthor: User = {
      id: postData.authorId,
      nickname: postData.authorNickname || '탈퇴한 사용자',
      avatar: postData.authorAvatar || '',
      username: 'unknown',
      email: '',
      score: 0,
      rank: 0,
      tetrisRank: 0,
      categoryStats: { Unity: { score: 0 }, Unreal: { score: 0 }, Godot: { score: 0 }, General: { score: 0 } },
      nicknameLastChanged: new Date(),
      isBlocked: true,
      socialProfiles: {},
      selectedTitleIdentifier: 'none',
      selectedNicknameEffectIdentifier: 'none',
      selectedLogoIdentifier: 'none',
      twoFactorEnabled: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId, authorNickname, authorAvatar, ...restData } = postData;
    return { id, ...restData, author: placeholderAuthor } as Post;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authorId, authorNickname, authorAvatar, ...restData } = postData;
  return { id, ...restData, author } as Post;
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const postDocRef = doc(db, 'posts', id);
    const docSnap = await getDoc(postDocRef);

    if (docSnap.exists()) {
      return await enrichPostWithAuthor(docSnap.data(), docSnap.id);
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching post from Firestore:", error);
    return null;
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'), limit(50)); // Increased limit
    const querySnapshot = await getDocs(q);
    
    const posts = await Promise.all(
      querySnapshot.docs.map(doc => enrichPostWithAuthor(doc.data(), doc.id))
    );

    return posts;
  } catch (error) {
    console.error("Error fetching posts from Firestore:", error);
    return [];
  }
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
   try {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const posts = await Promise.all(
      querySnapshot.docs.map(doc => enrichPostWithAuthor(doc.data(), doc.id))
    );
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for author ${authorId}:`, error);
    return [];
  }
}

// The data passed to this function should not contain the full author object.
// Instead, it should just provide the ID of the author.
export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'upvotes' | 'downvotes' | 'views' | 'commentCount' | 'isPinned' | 'tags' | 'isEdited' | 'postScore'>, authorId: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      authorId: authorId, // Store only the author's ID
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      views: 0,
      commentCount: 0,
      isPinned: false,
      isEdited: false,
      tags: [], // Default tags
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding post to Firestore:", error);
    throw new Error("Failed to add post.");
  }
}


export async function updatePost(postId: string, postData: Partial<Omit<Post, 'id' | 'author'>>): Promise<void> {
    try {
      const postDocRef = doc(db, 'posts', postId);
      await updateDoc(postDocRef, {
        ...postData,
        updatedAt: serverTimestamp(),
        isEdited: true, // Mark as edited on update
      });
    } catch (error) {
      console.error("Error updating post in Firestore:", error);
      throw new Error("Failed to update post.");
    }
  }
