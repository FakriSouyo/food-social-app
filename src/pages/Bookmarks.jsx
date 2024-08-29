// src/pages/Bookmarks.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../service/SupabaseClient';
import PostCard from '../components/PostCard';

const Bookmarks = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  useEffect(() => {
    fetchBookmarkedPosts();
  }, []);

  async function fetchBookmarkedPosts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          post_id,
          posts (
            id,
            content,
            image_url,
            created_at,
            users (
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarkedPosts(data.map(bookmark => bookmark.posts));
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Bookmarks</h1>
      <div className="space-y-4">
        {bookmarkedPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;