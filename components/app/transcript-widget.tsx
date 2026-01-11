'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { type ReceivedMessage } from '@livekit/components-react';
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  CheckIcon,
  CopyIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/livekit/button';
import { cn, copyToClipboard, formatMessagesAsText } from '@/lib/utils';

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
        throw new Error(data.message || "Erreur lors de l'envoi");
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
        className="bg-primary text-primary-foreground hover:bg-primary/90 fixed top-4 right-4 z-[100] flex size-12 items-center justify-center rounded-full shadow-lg"
        aria-label="Afficher le widget de transcription"
      >
        <CopyIcon weight="bold" className="size-5" />
        {messages.length > 0 && (
          <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-xs">
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
          'bg-background border-input fixed top-4 right-4 z-[100] rounded-lg border shadow-xl',
          isMinimized ? 'w-64' : 'w-80'
        )}
      >
        {/* Header */}
        <div className="border-input flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <CopyIcon weight="bold" className="size-4" />
            <span className="text-sm font-semibold">Transcription</span>
            {messages.length > 0 && (
              <span className="text-muted-foreground text-xs">
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
          <div className="space-y-2 p-3">
            <div className="text-muted-foreground text-xs">
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
            <label className="flex cursor-pointer items-center gap-2 text-xs">
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
              <span className="text-muted-foreground">Copie automatique des nouveaux messages</span>
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
