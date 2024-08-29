// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../service/SupabaseClient';
import PostCard from '../components/PostCard';
import NewPostForm from '../components/NewPostForm';
import TrendingTopics from '../components/TrendingTopics';
import PeopleYouMightKnow from '../components/PeopleYouMightKnow';

const Home = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, users:user_id(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostUpdated = () => {
    fetchPosts();
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* <NewPostForm onPostCreated={fetchPosts} /> */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
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