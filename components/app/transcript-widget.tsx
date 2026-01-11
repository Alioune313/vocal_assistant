'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type ReceivedMessage } from '@livekit/components-react';
import { CopyIcon, CheckIcon, XIcon, ArrowsInSimple, ArrowsOutSimple, PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { Button } from '@/components/livekit/button';
import { formatMessagesAsText, copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TranscriptWidgetProps {
  messages: ReceivedMessage[];
}

export function TranscriptWidget({ messages }: TranscriptWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [lastCopiedCount, setLastCopiedCount] = useState(0);
  const [sendingToN8N, setSendingToN8N] = useState(false);

  const handleCopyTranscript = useCallback(async () => {
    if (messages.length === 0) {
      toast.error('Aucune transcription à copier');
      return;
    }

    try {
      const formattedText = formatMessagesAsText(messages);
      await copyToClipboard(formattedText);
      setCopySuccess(true);
      toast.success('Transcription copiée !');
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      toast.error(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [messages]);

  const handleSendToN8N = useCallback(async () => {
    if (messages.length === 0) {
      toast.error('Aucune transcription à envoyer');
      return;
    }

    setSendingToN8N(true);
    try {
      const response = await fetch('/api/transcription-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          sessionId: `session_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Transcription envoyée à n8N ! (${data.successful}/${data.total})`);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast.error(`Erreur n8N: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSendingToN8N(false);
    }
  }, [messages]);

  // Auto-copy when new messages arrive (if enabled)
  useEffect(() => {
    if (autoCopy && messages.length > lastCopiedCount && messages.length > 0) {
      handleCopyTranscript();
      setLastCopiedCount(messages.length);
    }
  }, [messages.length, autoCopy, lastCopiedCount, handleCopyTranscript]);

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-[100] size-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center"
        aria-label="Afficher le widget de transcription"
      >
        <CopyIcon weight="bold" className="size-5" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className={cn(
          'fixed top-4 right-4 z-[100] bg-background border border-input rounded-lg shadow-xl',
          isMinimized ? 'w-64' : 'w-80'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-input">
          <div className="flex items-center gap-2">
            <CopyIcon weight="bold" className="size-4" />
            <span className="text-sm font-semibold">Transcription</span>
            {messages.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({messages.length} message{messages.length > 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? 'Agrandir' : 'Réduire'}
            >
              {isMinimized ? (
                <ArrowsOutSimple weight="bold" className="size-3" />
              ) : (
                <ArrowsInSimple weight="bold" className="size-3" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => setIsVisible(false)}
              aria-label="Fermer"
            >
              <XIcon weight="bold" className="size-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-3 space-y-2">
            <div className="text-xs text-muted-foreground">
              Cliquez pour copier toutes les transcriptions dans le presse-papiers
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyTranscript}
                disabled={messages.length === 0}
                className="flex-1"
                variant="primary"
              >
                {copySuccess ? (
                  <>
                    <CheckIcon weight="bold" className="size-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <CopyIcon weight="bold" className="size-4" />
                    Copier ({messages.length})
                  </>
                )}
              </Button>
              <Button
                onClick={handleSendToN8N}
                disabled={messages.length === 0 || sendingToN8N}
                variant="secondary"
                title="Envoyer vers n8N"
              >
                <PaperPlaneTiltIcon weight="bold" className="size-4" />
              </Button>
            </div>

            {/* Auto-copy toggle */}
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={autoCopy}
                onChange={(e) => {
                  setAutoCopy(e.target.checked);
                  if (e.target.checked) {
                    setLastCopiedCount(messages.length);
                  }
                }}
                className="size-3 rounded"
              />
              <span className="text-muted-foreground">
                Copie automatique des nouveaux messages
              </span>
            </label>
          </div>
        )}

        {/* Minimized view */}
        {isMinimized && (
          <div className="p-2">
            <Button
              onClick={handleCopyTranscript}
              disabled={messages.length === 0}
              size="sm"
              variant="primary"
              className="w-full"
            >
              {copySuccess ? (
                <CheckIcon weight="bold" className="size-4" />
              ) : (
                <>
                  <CopyIcon weight="bold" className="size-4" />
                  <span className="ml-1">{messages.length}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
