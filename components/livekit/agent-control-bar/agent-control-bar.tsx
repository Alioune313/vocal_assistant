'use client';

import { type HTMLAttributes, useCallback, useState } from 'react';
import { Track } from 'livekit-client';
import { useChat, useRemoteParticipants, type ReceivedMessage } from '@livekit/components-react';
import { ChatTextIcon, PhoneDisconnectIcon, CopyIcon, CheckIcon } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { TrackToggle } from '@/components/livekit/agent-control-bar/track-toggle';
import { Button } from '@/components/livekit/button';
import { Toggle } from '@/components/livekit/toggle';
import { cn, formatMessagesAsText, copyToClipboard } from '@/lib/utils';
import { ChatInput } from './chat-input';
import { UseInputControlsProps, useInputControls } from './hooks/use-input-controls';
import { usePublishPermissions } from './hooks/use-publish-permissions';
import { TrackSelector } from './track-selector';

export interface ControlBarControls {
  leave?: boolean;
  camera?: boolean;
  microphone?: boolean;
  screenShare?: boolean;
  chat?: boolean;
}

export interface AgentControlBarProps extends UseInputControlsProps {
  controls?: ControlBarControls;
  isConnected?: boolean;
  onChatOpenChange?: (open: boolean) => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
  messages?: ReceivedMessage[];
}

/**
 * A control bar specifically designed for voice assistant interfaces
 */
export function AgentControlBar({
  controls,
  saveUserChoices = true,
  className,
  isConnected = false,
  onDisconnect,
  onDeviceError,
  onChatOpenChange,
  messages = [],
  ...props
}: AgentControlBarProps & HTMLAttributes<HTMLDivElement>) {
  const { send } = useChat();
  const participants = useRemoteParticipants();
  const [chatOpen, setChatOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const publishPermissions = usePublishPermissions();
  const {
    micTrackRef,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleMicrophoneDeviceSelectError,
    handleCameraDeviceSelectError,
  } = useInputControls({ onDeviceError, saveUserChoices });

  const handleSendMessage = async (message: string) => {
    await send(message);
  };

  const handleToggleTranscript = useCallback(
    (open: boolean) => {
      setChatOpen(open);
      onChatOpenChange?.(open);
    },
    [onChatOpenChange, setChatOpen]
  );

  const handleCopyTranscript = useCallback(async () => {
    if (messages.length === 0) {
      toast.error('Aucune transcription à copier');
      return;
    }

    try {
      const formattedText = formatMessagesAsText(messages);
      await copyToClipboard(formattedText);
      setCopySuccess(true);
      toast.success('Transcription copiée dans le presse-papiers !');
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      toast.error(`Erreur lors de la copie: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [messages]);

  const visibleControls = {
    leave: controls?.leave ?? true,
    microphone: controls?.microphone ?? publishPermissions.microphone,
    screenShare: controls?.screenShare ?? publishPermissions.screenShare,
    camera: controls?.camera ?? publishPermissions.camera,
    chat: controls?.chat ?? publishPermissions.data,
  };

  const isAgentAvailable = participants.some((p) => p.isAgent);

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        'bg-background border-input/50 dark:border-muted flex flex-col rounded-[31px] border p-3 drop-shadow-md/3',
        className
      )}
      {...props}
    >
      {/* Chat Input */}
      {visibleControls.chat && (
        <ChatInput
          chatOpen={chatOpen}
          isAgentAvailable={isAgentAvailable}
          onSend={handleSendMessage}
        />
      )}

      <div className="flex gap-1">
        <div className="flex grow gap-1">
          {/* Toggle Microphone */}
          {visibleControls.microphone && (
            <TrackSelector
              kind="audioinput"
              aria-label="Toggle microphone"
              source={Track.Source.Microphone}
              pressed={microphoneToggle.enabled}
              disabled={microphoneToggle.pending}
              audioTrackRef={micTrackRef}
              onPressedChange={microphoneToggle.toggle}
              onMediaDeviceError={handleMicrophoneDeviceSelectError}
              onActiveDeviceChange={handleAudioDeviceChange}
            />
          )}

          {/* Toggle Camera */}
          {visibleControls.camera && (
            <TrackSelector
              kind="videoinput"
              aria-label="Toggle camera"
              source={Track.Source.Camera}
              pressed={cameraToggle.enabled}
              pending={cameraToggle.pending}
              disabled={cameraToggle.pending}
              onPressedChange={cameraToggle.toggle}
              onMediaDeviceError={handleCameraDeviceSelectError}
              onActiveDeviceChange={handleVideoDeviceChange}
            />
          )}

          {/* Toggle Screen Share */}
          {visibleControls.screenShare && (
            <TrackToggle
              size="icon"
              variant="secondary"
              aria-label="Toggle screen share"
              source={Track.Source.ScreenShare}
              pressed={screenShareToggle.enabled}
              disabled={screenShareToggle.pending}
              onPressedChange={screenShareToggle.toggle}
            />
          )}

          {/* Toggle Transcript */}
          <Toggle
            size="icon"
            variant="secondary"
            aria-label="Toggle transcript"
            pressed={chatOpen}
            onPressedChange={handleToggleTranscript}
          >
            <ChatTextIcon weight="bold" />
          </Toggle>

          {/* Copy Transcript */}
          {messages.length > 0 && (
            <Button
              size="icon"
              variant="secondary"
              aria-label="Copier la transcription"
              onClick={handleCopyTranscript}
              title="Copier la transcription dans le presse-papiers"
            >
              {copySuccess ? (
                <CheckIcon weight="bold" />
              ) : (
                <CopyIcon weight="bold" />
              )}
            </Button>
          )}
        </div>

        {/* Disconnect */}
        {visibleControls.leave && (
          <Button
            variant="destructive"
            onClick={onDisconnect}
            disabled={!isConnected}
            className="font-mono"
          >
            <PhoneDisconnectIcon weight="bold" />
            <span className="hidden md:inline">END CALL</span>
            <span className="inline md:hidden">END</span>
          </Button>
        )}
      </div>
    </div>
  );
}
