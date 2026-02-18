'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BOARD_CATEGORY_LABELS,
  type BoardCategory,
  type BoardPost,
} from '@/types';
import {
  BOARD_UPLOAD_LIMIT_MB,
  createBoardPost,
  deleteBoardPost,
  getBoardPosts,
} from '@/lib/firebase/boardService';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

type BoardFilter = 'all' | BoardCategory;

const BOARD_CATEGORY_COLORS: Record<BoardCategory, string> = {
  'academic-affairs': 'bg-blue-100',
  research: 'bg-emerald-100',
  information: 'bg-cyan-100',
  sports: 'bg-lime-100',
  character: 'bg-purple-100',
};

function parseLinks(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BoardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BoardFilter>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'academic-affairs' as BoardCategory,
    linksText: '',
  });

  useEffect(() => {
    void loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getBoardPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load board posts:', error);
      alert('게시글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setFormData({
      title: '',
      content: '',
      category: 'academic-affairs',
      linksText: '',
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  }

  async function handleCreatePost() {
    if (!user?.uid) {
      alert('로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (selectedFile && selectedFile.size > BOARD_UPLOAD_LIMIT_MB * 1024 * 1024) {
      alert(`파일은 ${BOARD_UPLOAD_LIMIT_MB}MB 이하만 업로드할 수 있습니다.`);
      return;
    }

    const links = parseLinks(formData.linksText);
    const normalizedLinks = links.map(normalizeUrl);
    if (normalizedLinks.some((link) => !link)) {
      alert('하이퍼링크는 http:// 또는 https:// 주소만 입력 가능합니다.');
      return;
    }

    setSaving(true);
    try {
      await createBoardPost({
        category: formData.category,
        title: formData.title.trim(),
        content: formData.content.trim(),
        links: normalizedLinks.filter((link): link is string => Boolean(link)),
        createdBy: user.uid,
        createdByName: user.displayName || user.email || '교직원',
        file: selectedFile,
      });

      await loadPosts();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create board post:', error);
      alert(error?.message || '게시글 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(post: BoardPost) {
    if (!user) {
      return;
    }

    if (!user.isAdmin && post.createdBy !== user.uid) {
      alert('작성자 본인 또는 관리자만 삭제할 수 있습니다.');
      return;
    }

    if (!confirm(`"${post.title}" 게시글을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteBoardPost(post.id);
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete board post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  }

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') {
      return posts;
    }
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">🗂️ 정보공유 게시판</h1>
        <Button onClick={openCreateModal}>+ 글 작성</Button>
      </div>

      <div className="neo-card p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`neo-button px-4 py-2 rounded-lg font-bold ${
              activeCategory === 'all' ? 'bg-[#FFE135] shadow-[4px_4px_0px_#000]' : 'bg-white hover:bg-gray-100'
            }`}
          >
            전체
          </button>
          {Object.entries(BOARD_CATEGORY_LABELS).map(([value, label]) => {
            const category = value as BoardCategory;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`neo-button px-4 py-2 rounded-lg font-bold ${
                  activeCategory === category
                    ? 'bg-[#FFE135] shadow-[4px_4px_0px_#000]'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="neo-card p-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">등록된 게시글이 없습니다.</p>
            <p className="mt-2">첫 번째 게시글을 등록해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="neo-card p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-xs font-bold border-2 border-black rounded ${
                          BOARD_CATEGORY_COLORS[post.category]
                        }`}
                      >
                        {BOARD_CATEGORY_LABELS[post.category]}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                    </div>

                    <h3 className="font-black text-lg break-words">{post.title}</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{post.content}</p>

                    {post.links.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-bold text-gray-500">링크</p>
                        {post.links.map((link) => (
                          <a
                            key={`${post.id}-${link}`}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-700 underline break-all"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    )}

                    {post.attachment && (
                      <div className="mt-3">
                        <a
                          href={post.attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#1A1A2E] underline"
                        >
                          📎 {post.attachment.name} ({(post.attachment.size / (1024 * 1024)).toFixed(2)}MB)
                        </a>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3">작성자: {post.createdByName}</p>
                  </div>

                  {user && (user.isAdmin || user.uid === post.createdBy) && (
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      className="text-red-600 hover:text-red-800 font-bold text-xl shrink-0"
                      aria-label="게시글 삭제"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="새 게시글 작성">
        <div className="space-y-4">
          <Input
            label="제목 *"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="게시글 제목을 입력하세요"
          />

          <div>
            <label className="block font-bold mb-2">카테고리</label>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value as BoardCategory }))
              }
              options={Object.entries(BOARD_CATEGORY_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>

          <div>
            <label className="block font-bold mb-2">내용 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="정보 공유 내용을 입력하세요"
              className="w-full p-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE135] min-h-[160px]"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">하이퍼링크 (선택)</label>
            <textarea
              value={formData.linksText}
              onChange={(e) => setFormData((prev) => ({ ...prev, linksText: e.target.value }))}
              placeholder={"https://example.com\nhttps://example.org"}
              className="w-full p-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE135] min-h-[90px]"
            />
            <p className="text-xs text-gray-500 mt-1">한 줄에 하나 또는 쉼표(,)로 여러 개 입력할 수 있습니다.</p>
          </div>

          <div>
            <label className="block font-bold mb-2">첨부파일 (선택, 최대 {BOARD_UPLOAD_LIMIT_MB}MB)</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-3 border-3 border-black rounded-lg font-bold bg-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreatePost} disabled={saving} className="flex-1">
              {saving ? '저장중...' : '등록하기'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
              disabled={saving}
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
