import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { db, storage } from './config';
import type { BoardAttachment, BoardCategory, BoardPost } from '@/types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  'hwp',
  'hwpx',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
]);

const ALLOWED_CONTENT_TYPES = new Set([
  'application/x-hwp',
  'application/haansofthwp',
  'application/vnd.hancom.hwp',
  'application/haansoft.hwpx',
  'application/vnd.hancom.hwpx',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

function hasAllowedExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? ALLOWED_EXTENSIONS.has(extension) : false;
}

export const getBoardPosts = async () => {
  const q = query(collection(db, 'boardPosts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((postDoc) => ({ id: postDoc.id, ...postDoc.data() })) as BoardPost[];
};

const uploadAttachment = async (file: File, userId: string): Promise<BoardAttachment> => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('파일은 5MB 이하만 업로드할 수 있습니다.');
  }

  if (!ALLOWED_CONTENT_TYPES.has(file.type) && !hasAllowedExtension(file.name)) {
    throw new Error('지원하지 않는 파일 형식입니다. (hwp, hwpx, pdf, office, txt, 이미지)');
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/\s+/g, '-');
  const filePath = `board-attachments/${userId}/${timestamp}-${sanitizedName}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    name: file.name,
    url,
    path: filePath,
    size: file.size,
    ...(file.type ? { contentType: file.type } : {}),
  };
};

export const createBoardPost = async (data: {
  category: BoardCategory;
  title: string;
  content: string;
  links: string[];
  createdBy: string;
  createdByName: string;
  file?: File | null;
}) => {
  const postRef = doc(collection(db, 'boardPosts'));
  let attachment: BoardAttachment | undefined;

  if (data.file) {
    attachment = await uploadAttachment(data.file, data.createdBy);
  }

  const payload = {
    category: data.category,
    title: data.title,
    content: data.content,
    links: data.links,
    ...(attachment ? { attachment } : {}),
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(postRef, payload);

  return postRef.id;
};

export const deleteBoardPost = async (postId: string) => {
  const postRef = doc(db, 'boardPosts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    return;
  }

  const postData = postSnap.data() as BoardPost;

  if (postData.attachment?.path) {
    const attachmentRef = ref(storage, postData.attachment.path);
    try {
      await deleteObject(attachmentRef);
    } catch {
      // Ignore storage deletion failure and continue deleting DB document.
    }
  }

  await deleteDoc(postRef);
};

export const BOARD_UPLOAD_LIMIT_MB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
