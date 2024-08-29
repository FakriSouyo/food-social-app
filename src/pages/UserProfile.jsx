// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../service/SupabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostCard from '../components/PostCard';

function UserProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    if (currentUser) {
      checkFollowStatus();
    }
  }, [username, currentUser]);

  async function fetchUserProfile() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, bio, avatar_url')
        .eq('username', username)
        .single();

      if (error) throw error;
      setUser(data);
      fetchFollowerCount(data.id);
      fetchFollowingCount(data.id);
    } catch (error) {
      console.error('Error mengambil profil pengguna:', error.message);
    }
  }

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
        .eq('users.username', username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data);
    } catch (error) {
      console.error('Error mengambil post pengguna:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkFollowStatus() {
    if (!user || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .match({ follower_id: currentUser.id, followed_id: user.id })
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error memeriksa status follow:', error.message);
    }
  }

  async function fetchFollowerCount(userId) {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('followed_id', userId);

      if (error) throw error;
      setFollowerCount(count);
    } catch (error) {
      console.error('Error mengambil jumlah pengikut:', error.message);
    }
  }

  async function fetchFollowingCount(userId) {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', userId);

      if (error) throw error;
      setFollowingCount(count);
    } catch (error) {
      console.error('Error mengambil jumlah yang diikuti:', error.message);
    }
  }

  async function handleFollowToggle() {
    if (!currentUser) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .match({ follower_id: currentUser.id, followed_id: user.id });
        setFollowerCount(prev => prev - 1);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: currentUser.id, followed_id: user.id });
        setFollowerCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error mengubah status follow:', error.message);
    }
  }

  if (loading) {
    return <div>Memuat...</div>;
  }

  if (!user) {
    return <div>Pengguna tidak ditemukan.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={user.avatar_url} alt={user.full_name} />
          <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{user.full_name}</h2>
          <p className="text-muted-foreground">@{user.username}</p>
          <div className="flex gap-4 mt-2">
            <span>{followerCount} Pengikut</span>
            <span>{followingCount} Mengikuti</span>
          </div>
        </div>
        {currentUser && currentUser.id !== user.id && (
          <Button
            variant={isFollowing ? "secondary" : "default"}
            className="ml-auto"
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Berhenti Mengikuti' : 'Ikuti'}
          </Button>
        )}
      </div>
      <p className="mb-4">{user.bio}</p>
      <div className="grid gap-6">
        {userPosts.map((post) => 
          post && (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={currentUser} 
              onPostUpdated={fetchUserPosts} 
            />
          )
        )}
      </div>
    </div>
  );
}

export default UserProfile;