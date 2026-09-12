import React, { useState } from 'react';
import { 
  X, MessageSquare, Plus, ThumbsUp, Send, BookOpen, 
  Sparkles, Award, AlertTriangle, Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ForumPost } from '../types';

interface ForumModalProps {
  onClose: () => void;
}

export const ForumModal: React.FC<ForumModalProps> = ({ onClose }) => {
  const { 
    forumPosts, 
    addForumTopic, 
    addForumReply, 
    likeForumPost, 
    books, 
    currentUser 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'books' | 'general'>('all');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<'general' | 'book_discussion'>('general');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [postError, setPostError] = useState<string | null>(null);

  // Reply form state
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const filteredPosts = forumPosts.filter((p) => {
    if (activeTab === 'books') return p.category === 'book_discussion';
    if (activeTab === 'general') return p.category === 'general';
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    if (!postTitle.trim() || !postContent.trim()) return;

    const bookObj = books.find((b) => b.id === selectedBookId);
    const res = addForumTopic(
      postTitle,
      postContent,
      postCategory,
      selectedBookId || undefined,
      bookObj?.title || undefined
    );

    if (!res.success) {
      setPostError(res.error || 'فشلت إضافة الموضوع');
    } else {
      setIsCreatingPost(false);
      setPostTitle('');
      setPostContent('');
      setSelectedBookId('');
    }
  };

  const handleReplySubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    setReplyError(null);
    if (!replyContent.trim()) return;

    const res = addForumReply(postId, replyContent);
    if (!res.success) {
      setReplyError(res.error || 'فشل إرسال الرد');
    } else {
      setReplyContent('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                منتدى المناقشات والحوار الفكري
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                فضاء مفتوح لمناقشة الكتب وتبادل الرؤى المعرفية والنقد البناء
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Filter & New Topic Button */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              جميع المناقشات ({forumPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'books'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              حوارات الكتب
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800'
              }`}
            >
              مواضيع عامة
            </button>
          </div>

          <button
            onClick={() => setIsCreatingPost(!isCreatingPost)}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>طرح موضوع جديد</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Create Post Form */}
          {isCreatingPost && (
            <form onSubmit={handleCreatePost} className="p-4 rounded-2xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 space-y-3 animate-in fade-in">
              <h4 className="font-bold text-xs text-teal-900 dark:text-teal-200">طرح موضوع فكري أو حوار حول كتاب</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">نوع النقاش</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  >
                    <option value="general">نقاش عام حول التغيير والنهضة</option>
                    <option value="book_discussion">مناقشة كتاب محدد من المكتبة</option>
                  </select>
                </div>

                {postCategory === 'book_discussion' && (
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">اختر الكتاب المعني</label>
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                      required
                    >
                      <option value="">-- اختر كتاباً --</option>
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">عنوان الموضوع</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="مثال: كيف يساهم الانضباط الذاتي في قيادة التغيير المجتمعي؟"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">المحتوى والطرح</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="اكتب أفكارك وتساؤلاتك للنقاش مع القراء..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                  required
                />
              </div>

              {postError && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{postError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-3 py-1.5 text-xs text-stone-500"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer"
                >
                  نشر الموضوع
                </button>
              </div>
            </form>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-center py-12 text-xs text-stone-400">لا توجد مناقشات في هذا القسم حالياً.</p>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 space-y-3 shadow-xs"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.authorAvatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-teal-500"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                            {post.authorName}
                          </span>
                          {post.bookTitle && (
                            <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{post.bookTitle}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 block">{post.createdAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => likeForumPost(post.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        post.likedBy.includes(currentUser.id)
                          ? 'bg-teal-600 text-white'
                          : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likes}</span>
                    </button>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white mb-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Replies Section */}
                  <div className="pt-3 border-t border-stone-100 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                      <span>الردود والمشاركات ({post.replies.length})</span>
                    </div>

                    {post.replies.length > 0 && (
                      <div className="space-y-2 pr-4 border-r-2 border-teal-500/30">
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-900/60 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
                                <img src={reply.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                <span>{reply.authorName}</span>
                              </div>
                              <span className="text-[10px] text-stone-400">{reply.createdAt}</span>
                            </div>
                            <p className="text-stone-600 dark:text-stone-300 leading-relaxed pr-6">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Form */}
                    <form onSubmit={(e) => handleReplySubmit(post.id, e)} className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={selectedPostId === post.id ? replyContent : ''}
                        onFocus={() => setSelectedPostId(post.id)}
                        onChange={(e) => { setSelectedPostId(post.id); setReplyContent(e.target.value); }}
                        placeholder="أضف ردك على هذا الموضوع..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white"
                        required
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>رد</span>
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
