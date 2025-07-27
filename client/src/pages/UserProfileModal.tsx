// ProfileModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = () => {
    // Simulate backend update
    toast({
      title: 'Profile Updated!',
      description: 'Your profile has been updated successfully.',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-3">
              New Username
            </Label>
            <Input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400"
              placeholder="Enter new username"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-300 mb-3">
              New Password
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400"
              placeholder="Enter new password"
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-gold hover:bg-emerald text-black font-bold px-6 py-4 shadow-md text-lg"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;