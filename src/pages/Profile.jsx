// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../service/SupabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostCard from '../components/PostCard';

function Profile() {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchUserPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
          <AvatarFallback>{user.user_metadata?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{user.user_metadata?.full_name || 'User'}</h2>
          <p className="text-muted-foreground">@{user.user_metadata?.username || 'username'}</p>
        </div>
        <Button variant="outline" className="ml-auto">Edit Profile</Button>
      </div>
      <div className="grid gap-6">
        {userPosts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={user} onPostUpdated={fetchUserPosts} />
        ))}
      </div>
    </div>
  );
}

export default Profile;