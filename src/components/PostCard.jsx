// src/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share, Bookmark, Copy, Instagram, Twitter, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';

const PostCard = ({ post, currentUser, onPostUpdated }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postImage, setPostImage] = useState(null);
  
  useEffect(() => {
    if (post && post.id) {
      renderPostImage();
    }
  }, [post]);

  if (!post || !post.users) {
    return null; // atau kembalikan komponen placeholder
  }

  const { 
    users: {
      avatar_url = '',
      username = 'Pengguna Tidak Dikenal',
      full_name = ''
    },
    content = '',
    created_at,
    id: postId
  } = post;

  const displayName = full_name || username;
  const postUrl = `${window.location.origin}/post/${postId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast.success('Tautan berhasil disalin!');
  };

  const renderPostImage = async () => {
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      const canvas = await html2canvas(postElement);
      const imageDataUrl = canvas.toDataURL('image/png');
      setPostImage(imageDataUrl);
    }
  };

  const handleShare = async (platform) => {
    if (!postImage) {
      toast.error('Gambar postingan belum siap. Mohon tunggu sebentar.');
      return;
    }

    let shareUrl;
    switch (platform) {
      case 'instagram':
        // Untuk Instagram Story, kita perlu menggunakan API khusus
        if (navigator.share) {
          try {
            await navigator.share({
              files: [new File([postImage], 'post.png', { type: 'image/png' })],
              title: 'Bagikan ke Instagram Story',
              text: content
            });
          } catch (error) {
            console.error('Error sharing to Instagram:', error);
            toast.error('Gagal membagikan ke Instagram Story');
          }
        } else {
          toast.error('Fitur berbagi tidak didukung di perangkat ini');
        }
        break;
      case 'whatsapp':
        // Untuk WhatsApp Status, kita bisa menggunakan URL scheme
        shareUrl = `whatsapp://status.whatsapp.com/?text=${encodeURIComponent(content)}&image=${encodeURIComponent(postImage)}`;
        window.open(shareUrl, '_blank');
        break;
      case 'twitter':
        // Untuk Twitter, kita bisa menggunakan URL scheme
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}&url=${encodeURIComponent(postUrl)}`;
        window.open(shareUrl, '_blank');
        break;
      default:
        return;
    }
  };

  return (
    <Card id={`post-${postId}`} className="border-b border-gray-200 p-4">
      <CardHeader className="p-0 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar_url} alt={username} />
              <AvatarFallback>{username[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="mb-2">{content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Gambar postingan"
            className="w-full h-auto rounded-md object-cover max-h-96"
          />
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {created_at && formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: id })}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between p-0 mt-3">
        <Button variant="ghost" size="sm">
          <Heart className="h-5 w-5 mr-1" />
          Suka
        </Button>
        <Button variant="ghost" size="sm">
          <MessageCircle className="h-5 w-5 mr-1" />
          Komentar
        </Button>
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Share className="h-5 w-5 mr-1" />
              Bagikan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bagikan Postingan</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Input value={postUrl} readOnly className="flex-grow" />
                <Button size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center space-x-4">
                <Button size="icon" variant="outline" onClick={() => handleShare('instagram')}>
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => handleShare('whatsapp')}>
                  <Send className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => handleShare('twitter')}>
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="sm">
          <Bookmark className="h-5 w-5 mr-1" />
          Simpan
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;