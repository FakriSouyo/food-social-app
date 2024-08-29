// src/components/PeopleYouMightKnow.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../service/SupabaseClient';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const PeopleYouMightKnow = () => {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetchPeopleYouMightKnow();
  }, []);

  async function fetchPeopleYouMightKnow() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .limit(3);

      if (error) throw error;
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people you might know:', error.message);
    }
  }

  const handleFollow = async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, followed_id: userId });

      if (error) throw error;
      // Refresh the list after following
      fetchPeopleYouMightKnow();
    } catch (error) {
      console.error('Error following user:', error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">People You Might Know</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {people.map((person) => (
            <div key={person.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={person.avatar_url} alt={person.full_name} />
                  <AvatarFallback>{person.full_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{person.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{person.username}</p>
                </div>
              </div>
              <Button onClick={() => handleFollow(person.id)} variant="outline" size="sm">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeopleYouMightKnow;