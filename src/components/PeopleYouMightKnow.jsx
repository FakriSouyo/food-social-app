import React, { useState, useEffect } from 'react';
import { supabase } from '../service/SupabaseClient';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, UserMinus } from 'lucide-react';

const PeopleYouMightKnow = () => {
  const [people, setPeople] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeopleYouMightKnow();
  }, []);

  useEffect(() => {
    if (people.length > 0) {
      fetchFollowStatus();
    }
  }, [people]);

  async function fetchPeopleYouMightKnow() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
  
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .limit(3);
  
      if (error) throw error;
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people you might know:', error.message);
      toast.error('Failed to fetch people you might know');
      setPeople([]);  // Reset people state on error
    } finally {
      setLoading(false);
    }
  }

  async function fetchFollowStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data, error } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id)
        .in('followed_id', people.map(p => p.id));
  
      if (error) throw error;
  
      const followStatusObj = {};
      people.forEach(person => {
        followStatusObj[person.id] = data.some(f => f.followed_id === person.id);
      });
  
      setFollowStatus(followStatusObj);
    } catch (error) {
      console.error('Error fetching follow status:', error.message);
      toast.error('Failed to fetch follow status');
    }
  }

  const handleFollowToggle = async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
  
      const currentStatus = followStatus[userId];
      let newStatus = !currentStatus;
  
      if (currentStatus) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', userId);
  
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, followed_id: userId });
  
        if (error) {
          if (error.code === '23505') {
            console.log('Already following this user');
            newStatus = true;
          } else {
            throw error;
          }
        }
      }
  
      setFollowStatus(prev => ({ ...prev, [userId]: newStatus }));
      toast.success(newStatus ? 'Followed successfully' : 'Unfollowed successfully');
    } catch (error) {
      console.error('Error toggling follow:', error.message);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>People you might know</CardHeader>
      <CardContent>
        {people.length === 0 ? (
          <p>No new people to show at the moment.</p>
        ) : (
          people.map((person) => (
            <div key={person.id} className="flex items-center justify-between mb-4">
              <Link to={`/user/${person.username}`} className="flex items-center flex-grow">
                <Avatar className="mr-2">
                  <AvatarImage src={person.avatar_url} alt={person.full_name || 'User'} />
                  <AvatarFallback>{(person.full_name && person.full_name[0]) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{person.full_name || 'Anonymous User'}</p>
                  <p className="text-sm text-gray-500">@{person.username}</p>
                </div>
              </Link>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  handleFollowToggle(person.id);
                }} 
                variant={followStatus[person.id] ? "secondary" : "default"} 
                size="sm"
              >
                {followStatus[person.id] ? (
                  <>
                    <UserMinus size={16} />
                    <span className="ml-2">Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span className="ml-2">Follow</span>
                  </>
                )}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PeopleYouMightKnow;