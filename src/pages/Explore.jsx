// src/pages/Explore.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../service/SupabaseClient';
import PostCard from '../components/PostCard';

function Explore() {
  const [trendingPosts, setTrendingPosts] = useState([]);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  async function fetchTrendingPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          likes,
          users (
            id,
            username,
            avatar_url
          )
        `)
        .order('likes', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrendingPosts(data);
    } catch (error) {
      console.error('Error fetching trending posts:', error.message);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Explore Trending Posts</h2>
      <div className="grid gap-6">
        {trendingPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Explore;