// src/components/AuthModal.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();

  const handleSuccess = () => {
    setShowAuthModal(false);
  };

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
        </DialogHeader>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Masuk</TabsTrigger>
            <TabsTrigger value="signup">Daftar</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignIn onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUp onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;