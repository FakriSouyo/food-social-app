// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../service/SupabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PostCard from '../components/PostCard';

function Profile() {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchUserProfile();
      fetchFollowerCount();
      fetchFollowingCount();
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
      console.error('Error mengambil post pengguna:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserProfile() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, bio')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setFullName(data.full_name || '');
      setBio(data.bio || '');
    } catch (error) {
      console.error('Error mengambil profil pengguna:', error.message);
    }
  }

  async function fetchFollowerCount() {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('followed_id', user.id);

      if (error) throw error;
      setFollowerCount(count);
    } catch (error) {
      console.error('Error mengambil jumlah pengikut:', error.message);
    }
  }

  async function fetchFollowingCount() {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowingCount(count);
    } catch (error) {
      console.error('Error mengambil jumlah yang diikuti:', error.message);
    }
  }

  async function handleEditProfile() {
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName, bio: bio })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error memperbarui profil:', error.message);
    }
  }

  if (loading) {
    return <div>Memuat...</div>;
  }

  if (!user) {
    return <div>Silakan masuk untuk melihat profil Anda.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={fullName || 'Pengguna'} />
          <AvatarFallback>{fullName?.[0] || 'P'}</AvatarFallback>
        </Avatar>
        <div>
          {isEditing ? (
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama Lengkap"
              className="mb-2"
            />
          ) : (
            <h2 className="text-2xl font-bold">{fullName || 'Pengguna'}</h2>
          )}
          <p className="text-muted-foreground">@{user.user_metadata?.username || 'username'}</p>
          <div className="flex gap-4 mt-2">
            <span>{followerCount} Pengikut</span>
            <span>{followingCount} Mengikuti</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="ml-auto"
          onClick={() => isEditing ? handleEditProfile() : setIsEditing(true)}
        >
          {isEditing ? 'Simpan' : 'Edit Profil'}
        </Button>
      </div>
      {isEditing ? (
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="mb-4"
        />
      ) : (
        <p className="mb-4">{bio}</p>
      )}
      <div className="grid gap-6">
        {userPosts.map((post) => 
          post && (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              onPostUpdated={fetchUserPosts} 
            />
          )
        )}
      </div>
    </div>
  );
}

export default Profile;