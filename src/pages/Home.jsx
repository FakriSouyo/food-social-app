// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../service/SupabaseClient';
import PostCard from '../components/PostCard';
import NewPostForm from '../components/NewPostForm';
import TrendingTopics from '../components/TrendingTopics';
import PeopleYouMightKnow from '../components/PeopleYouMightKnow';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <NewPostForm onPostCreated={fetchPosts} />
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="space-y-6">
        <TrendingTopics />
        <PeopleYouMightKnow />
      </div>
    </div>
  );
};

export default Home;