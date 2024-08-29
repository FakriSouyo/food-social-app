// src/components/FoodPost.jsx
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { HeartIcon, ChatBubbleIcon, Share1Icon } from '@radix-ui/react-icons';

const FoodPost = ({ post }) => {
  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">@{post.author.username}</p>
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
            <HeartIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ChatBubbleIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share1Icon className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodPost;