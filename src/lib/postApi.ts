
// src/lib/postApi.ts
import { db } from './firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, limit, DocumentData, Timestamp } from 'firebase/firestore';
import type { Post, User } from '@/types';
import { getUser } from './userApi';

// 기본 사용자 객체 생성 함수
const createPlaceholderUser = (authorId: string): User => ({
  id: authorId,
  nickname: '알 수 없는 사용자',
  avatar: '/default-avatar.webp',
  username: 'unknown',
  email: '',
  score: 0,
  rank: 0,
  tetrisRank: 0,
  categoryStats: {},
  isBlocked: true,
  socialProfiles: {},
  selectedTitleIdentifier: 'none',
  selectedNicknameEffectIdentifier: 'none',
  selectedLogoIdentifier: 'none',
  twoFactorEnabled: false,
  isAdmin: false,
  createdAt: Timestamp.now(),
  nicknameLastChanged: Timestamp.now(),
  lastEmailChangeDate: null,
  emailChangesToday: 0,
  lastPasswordChangeDate: null,
  passwordChangesToday: 0,
});


// 게시물 데이터에 작성자 정보 추가 (단순화된 버전)
async function enrichPostWithAuthor(postData: DocumentData, id: string): Promise<Post> {
  const author = await getUser(postData.authorId);

  if (!author) {
    console.warn(`게시물(ID: ${id})의 작성자(ID: ${postData.authorId})를 찾을 수 없어 플레이스홀더를 사용합니다.`);
    const placeholderAuthor = createPlaceholderUser(postData.authorId);
    return { id, ...postData, author: placeholderAuthor } as Post;
  }
  
  return { id, ...postData, author } as Post;
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const postDocRef = doc(db, 'posts', id);
    const docSnap = await getDoc(postDocRef);
    if (docSnap.exists()) {
      return await enrichPostWithAuthor(docSnap.data(), docSnap.id);
    } else {
      console.warn(`Post with ID ${id} not found.`);
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
    const q = query(postsCollection, orderBy('createdAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    return await Promise.all(querySnapshot.docs.map(doc => enrichPostWithAuthor(doc.data(), doc.id)));
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
    return await Promise.all(querySnapshot.docs.map(doc => enrichPostWithAuthor(doc.data(), doc.id)));
  } catch (error) {
    console.error(`Error fetching posts for author ${authorId}:`, error);
    return [];
  }
}

// Omit에서 'author' 관련 필드를 제거하고, 필요한 필드를 명시적으로 정의합니다.
type AddPostData = Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'upvotes' | 'downvotes' | 'views' | 'commentCount' | 'isPinned' | 'tags' | 'isEdited' | 'postScore' | 'isPopular'> & { authorId: string };

export async function addPost(postData: AddPostData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      views: 0,
      commentCount: 0,
      isPinned: false,
      isEdited: false,
      isPopular: false, // 기본값 추가
      postScore: 0,       // 기본값 추가
      tags: [],
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding post to Firestore:", error);
    throw new Error("Failed to add post.");
  }
}

export async function updatePost(postId: string, postData: Partial<Omit<Post, 'id' | 'author' | 'createdAt'>>): Promise<void> {
    try {
      const postDocRef = doc(db, 'posts', postId);
      await updateDoc(postDocRef, {
        ...postData,
        updatedAt: serverTimestamp(),
        isEdited: true,
      });
    } catch (error) {
      console.error("Error updating post in Firestore:", error);
      throw new Error("Failed to update post.");
    }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    const postDocRef = doc(db, 'posts', postId);
    await deleteDoc(postDocRef);
  } catch (error) {
    console.error("Error deleting post from Firestore:", error);
    throw new Error("Failed to delete post.");
  }
}
