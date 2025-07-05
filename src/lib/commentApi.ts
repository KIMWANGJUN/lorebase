import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where, Timestamp, DocumentData } from 'firebase/firestore';
import type { Comment, User } from '@/types';
import { getUser } from './userApi';

// 기본 사용자 객체 생성 함수
const createPlaceholderUser = (authorId: string): User => ({
  id: authorId,
  nickname: '알 수 없는 사용자',
  avatar: '/default-avatar.png',
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

// 댓글 데이터에 작성자 정보 추가 (단순화된 버전)
async function enrichCommentWithAuthor(commentData: DocumentData): Promise<Comment> {
  // authorId가 없는 경우, 즉시 플레이스홀더 반환
  if (!commentData.authorId) {
    console.warn('댓글에 authorId가 없어 플레이스홀더를 사용합니다:', commentData.id);
    const placeholderAuthor = createPlaceholderUser(commentData.id);
    return { ...commentData, author: placeholderAuthor } as Comment;
  }
  
  try {
    const author = await getUser(commentData.authorId);
    if (author) {
      return { ...commentData, author } as Comment;
    }
    
    // 작성자를 찾을 수 없을 때 플레이스홀더 생성
    console.warn(`사용자(ID: ${commentData.authorId})를 찾을 수 없어 플레이스홀더를 사용합니다.`);
    const placeholderAuthor = createPlaceholderUser(commentData.authorId);
    return { ...commentData, author: placeholderAuthor } as Comment;
  } catch (error) {
    console.error(`댓글(ID: ${commentData.id})의 작성자(ID: ${commentData.authorId}) 정보 조회 중 오류 발생:`, error);
    // 에러 발생 시에도 플레이스홀더 반환
    const placeholderAuthor = createPlaceholderUser(commentData.authorId);
    return { ...commentData, author: placeholderAuthor } as Comment;
  }
}

// 특정 게시글의 댓글 목록 가져오기
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef, 
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);

    const commentsPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };
      return await enrichCommentWithAuthor(data);
    });

    return await Promise.all(commentsPromises);
  } catch (error) {
    console.error(`댓글 목록 조회 실패 (postId: ${postId}):`, error);
    return [];
  }
}

// 댓글 추가용 타입 정의 (단순화)
export interface AddCommentData {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
}

// 새 댓글 추가 (단순화)
export async function addComment(commentData: AddCommentData): Promise<string> {
  try {
    if (!commentData.postId || !commentData.authorId || !commentData.content.trim()) {
      throw new Error("게시글 ID, 작성자 ID, 댓글 내용은 필수 항목입니다.");
    }

    const commentsRef = collection(db, 'comments');
    
    const docData = {
      ...commentData,
      content: commentData.content.trim(),
      upvotes: 0,
      downvotes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(commentsRef, docData);
    
    return docRef.id;
  } catch (error) {
    console.error("댓글 추가 실패:", error);
    if (error instanceof Error) {
      throw new Error(`댓글 추가에 실패했습니다: ${error.message}`);
    }
    throw new Error("알 수 없는 오류로 댓글 추가에 실패했습니다.");
  }
}

// 특정 댓글의 답글 목록 가져오기 (옵션)
export async function getReplies(parentCommentId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('parentId', '==', parentCommentId),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const repliesPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const data = { id: docSnapshot.id, ...docSnapshot.data() };
      return await enrichCommentWithAuthor(data);
    });

    return Promise.all(repliesPromises);
  } catch (error) {
    console.error(`답글 목록 조회 실패 (parentId: ${parentCommentId}):`, error);
    return [];
  }
}
