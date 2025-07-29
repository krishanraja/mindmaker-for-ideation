
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmailCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isGenerating: boolean;
  userName: string;
}

const EmailCollectionModal: React.FC<EmailCollectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isGenerating,
  userName
}) => {
  const [email, setEmail] = useState('');
  const [hasConsented, setHasConsented] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (!hasConsented) {
      setEmailError('Please accept the privacy notice to continue');
      return;
    }

    setEmailError('');
    onSubmit(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            Get Your Blueprint PDF
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4"
        >
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Hi <span className="font-semibold text-foreground">{userName}</span>! 
              Enter your email to receive your personalized blueprint as a beautiful PDF.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10 h-12 bg-background/50 border border-border/50 focus:border-primary"
                  disabled={isGenerating}
                />
              </div>
              {emailError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive mt-2"
                >
                  {emailError}
                </motion.p>
              )}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Privacy Notice</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your email will only be used to send you the PDF blueprint. 
                    We respect your privacy and will never share your information.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasConsented}
                      onChange={(e) => setHasConsented(e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      disabled={isGenerating}
                    />
                    <span className="text-xs text-muted-foreground">
                      I agree to receive the PDF via email
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
                disabled={isGenerating || !email || !hasConsented}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                    Generating PDF...
                  </div>
                ) : (
                  'Generate & Send PDF'
                )}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              PDF will be named: <span className="font-mono bg-muted px-2 py-1 rounded">
                {userName.replace(/\s+/g, '_')}_Blueprint.pdf
              </span>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCollectionModal;
