// src/components/TrendingTopics.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../service/SupabaseClient';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hash } from 'lucide-react';

const TrendingTopics = () => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  async function fetchTrendingTopics() {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_topics');

      if (error) throw error;
      setTopics(data);
    } catch (error) {
      console.error('Error fetching trending topics:', error.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Food Topics</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topics.map((topic) => (
            <Button key={topic.tag} variant="ghost" className="w-full justify-start">
              <Hash className="mr-2 h-4 w-4" />
              <span>{topic.tag}</span>
              <span className="ml-auto text-xs text-muted-foreground">{topic.count} posts</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;