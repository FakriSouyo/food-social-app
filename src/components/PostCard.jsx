// src/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../service/SupabaseClient';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Pencil, Trash2, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import AuthModal from './AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Comment = ({ comment, post, onDelete, onReply }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async () => {
    if (replyContent.trim()) {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <div className="mt-2 border-l-2 border-gray-200 pl-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">{comment.user.username}</p>
          <p className="text-sm">{comment.content}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}
          </p>
        </div>
        <div className="flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(!isReplying)}
          >
            <Reply className="h-4 w-4" />
          </Button>
          {(user && (user.id === comment.user_id || user.id === post.user_id)) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onDelete(comment.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Hapus</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {isReplying && (
        <div className="mt-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Tulis balasan..."
            className="w-full p-2 border rounded-md"
            rows="2"
          />
          <Button onClick={handleReply} className="mt-2">Balas</Button>
        </div>
      )}
      {comment.replies && comment.replies.map(reply => (
        <Comment
          key={reply.id}
          comment={reply}
          post={post}
          onDelete={onDelete}
          onReply={onReply}
        />
      ))}
    </div>
  );
};

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      checkBookmarkStatus();
    }
    fetchComments();
    fetchLikesCount();

    const likesSubscription = supabase
      .channel('public:likes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${post.id}` }, fetchLikesCount)
      .subscribe();

    const commentsSubscription = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` }, fetchComments)
      .subscribe();

    return () => {
      supabase.removeChannel(likesSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [user, post.id]);

  const fetchLikesCount = async () => {
    const { count, error } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('post_id', post.id);

    if (error) {
      console.error('Error fetching likes count:', error);
    } else {
      setLikes(count);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        parent_id,
        user:users(username)
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      // Organize comments into a nested structure
      const nestedComments = data.reduce((acc, comment) => {
        if (comment.parent_id === null) {
          acc.push({...comment, replies: []});
        } else {
          const parent = acc.find(c => c.id === comment.parent_id);
          if (parent) {
            parent.replies.push(comment);
          }
        }
        return acc;
      }, []);
      setComments(nestedComments);
    }
  };

  const handleAuthAction = (action) => {
    if (user) {
      action();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLike = async () => {
    handleAuthAction(async () => {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing like:', error);
        } else {
          setIsLiked(false);
          setLikes(likes - 1);
        }
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: user.id });

        if (error) {
          console.error('Error adding like:', error);
        } else {
          setIsLiked(true);
          setLikes(likes + 1);
        }
      }
    });
  };

  const handleBookmark = async () => {
    handleAuthAction(async () => {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing bookmark:', error);
        } else {
          setIsBookmarked(false);
        }
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ post_id: post.id, user_id: user.id });

        if (error) {
          console.error('Error adding bookmark:', error);
        } else {
          setIsBookmarked(true);
        }
      }
    });
  };

  const handleComment = async () => {
    handleAuthAction(async () => {
      if (newComment.trim()) {
        const { error } = await supabase
          .from('comments')
          .insert({ post_id: post.id, user_id: user.id, content: newComment.trim() });

        if (error) {
          console.error('Error adding comment:', error);
        } else {
          setNewComment('');
          await fetchComments();
        }
      }
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('posts')
      .update({ content: editedContent })
      .eq('id', post.id);

    if (error) {
      console.error('Error updating post:', error);
    } else {
      setIsEditing(false);
      if (typeof onPostUpdated === 'function') {
        onPostUpdated();
      }
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      console.error('Error deleting post:', error);
    } else {
      if (typeof onPostDeleted === 'function') {
        onPostDeleted(post.id);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReplyComment = async (parentId, content) => {
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content,
          parent_id: parentId
        });

      if (error) throw error;
      await fetchComments();
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  return (
    <>
      <Card className="border-b border-gray-200 p-4">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.users.avatar_url} alt={post.users.username} />
                <AvatarFallback>{post.users.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{post.users.full_name}</p>
                <p className="text-xs text-muted-foreground">@{post.users.username}</p>
              </div>
            </div>
            {user && user.id === post.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Hapus</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="mt-3">
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
                <Button onClick={handleSaveEdit} className="mt-2">Simpan</Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="mt-2 ml-2">Batal</Button>
              </div>
            ) : (
              <p className="text-sm mb-2">{post.content}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full h-auto rounded-md object-cover max-h-96"
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-between p-0 mt-3">
          <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-2">
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>{comments.length}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBookmark}>
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
          </Button>
        </CardFooter>

        {user && (
          <div className="mt-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tambahkan komentar..."
              className="w-full p-2 border rounded-md"
              rows="2"
            />
            <Button onClick={handleComment} className="mt-2">Kirim</Button>
          </div>
        )}

        {comments.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold">Comments:</h3>
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                post={post}
                onDelete={handleDeleteComment}
                onReply={handleReplyComment}
              />
            ))}
          </div>
        )}
      </Card>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};

export default PostCard;