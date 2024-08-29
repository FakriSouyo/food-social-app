// src/components/PostCard.jsx
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Share } from 'lucide-react';

const PostCard = ({ post, currentUser, onPostUpdated }) => {
  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.users.avatar_url} alt={post.users.username} />
          <AvatarFallback>{post.users.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{post.users.username}</p>
          <p className="text-xs text-muted-foreground">@{post.users.username}</p>
        </div>
      </CardHeader>
      <CardContent>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Food Image"
            className="rounded-md object-cover w-full h-64 mb-4"
          />
        )}
        <p className="mb-4">{post.content}</p>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;