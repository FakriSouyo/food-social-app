// components/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Search, Bookmark, User, Menu, UtensilsCrossed, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';

const Layout = ({ children }) => {
  const { user, signOut, setShowAuthModal } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="fixed top-0 left-0 bottom-0 hidden w-60 flex-col border-r bg-background p-4 sm:flex overflow-y-auto">
        <div className="mb-6 flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Foodie</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
            <Home className="h-5 w-5" />
            Beranda
          </Link>
          <Link to="/explore" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
            <Search className="h-5 w-5" />
            Jelajahi
          </Link>
          <Link to="/bookmarks" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
            <Bookmark className="h-5 w-5" />
            Markah
          </Link>
          <Link to="/profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
            <User className="h-5 w-5" />
            Profil
          </Link>
        </nav>
        <div className="mt-auto">
          {user ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
                <AvatarFallback>{user.user_metadata.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-medium">{user.user_metadata.full_name}</p>
                <p className="text-xs text-muted-foreground">@{user.user_metadata.username}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowAuthModal(true)}>
              Masuk
            </Button>
          )}
        </div>
      </aside>
      <div className="flex flex-1 flex-col ml-60">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari di Foodie"
                className="w-full rounded-md bg-muted pl-8 pr-4 py-2 text-sm"
              />
            </div>
          </div>
          {user ? (
            <Button className="hidden sm:inline-flex">
              <Link to="/new-post">Pos Baru</Link>
            </Button>
          ) : (
            <Button className="hidden sm:inline-flex" onClick={() => setShowAuthModal(true)}>
              Masuk
            </Button>
          )}
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
      <AuthModal />
    </div>
  );
};

export default Layout;