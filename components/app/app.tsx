'use client';

import { useEffect, useMemo, useState } from 'react';
import { TokenSource } from 'livekit-client';
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
} from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { getSandboxTokenSource } from '@/lib/utils';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

// Internal component that uses the session - this ensures hooks are called consistently
function AppContent({ tokenSource, appConfig }: { tokenSource: TokenSource; appConfig: AppConfig }) {
  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController appConfig={appConfig} />
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}

export function App({ appConfig }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [tokenSource, setTokenSource] = useState<TokenSource | null>(null);

  // Wait for client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create token source only after mounting and when window is available
  useEffect(() => {
    if (!isMounted) return;

    // Ensure we're in a browser environment
    if (typeof window === 'undefined' || !window.location) {
      console.error('Cannot create token source: window.location is not available');
      return;
    }
    
    const origin = window.location.origin;
    if (!origin || origin === 'null' || origin === 'undefined' || origin.trim() === '') {
      console.error(`Cannot create token source: window.location.origin is invalid: "${origin}"`);
      return;
    }
    
    // Only use sandbox token source if endpoint is properly defined
    const endpoint = process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT;
    const hasValidEndpoint = 
      typeof endpoint === 'string' && 
      endpoint.trim() !== '';
    
    let source: TokenSource;
    
    try {
      if (hasValidEndpoint) {
        try {
          source = getSandboxTokenSource(appConfig);
        } catch (error) {
          console.error('Error creating sandbox token source, falling back to default:', error);
          // Fall through to default endpoint
          source = TokenSource.endpoint('/api/connection-details');
        }
      } else {
        // Default to local endpoint
        source = TokenSource.endpoint('/api/connection-details');
      }
      
      setTokenSource(source);
    } catch (error) {
      console.error('Error creating token source:', error);
      // Don't set tokenSource if creation fails
    }
  }, [isMounted, appConfig]);

  // Don't render session until token source is ready
  if (!tokenSource) {
    return (
      <main className="grid h-svh grid-cols-1 place-content-center">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </main>
    );
  }

  return <AppContent tokenSource={tokenSource} appConfig={appConfig} />;
}
