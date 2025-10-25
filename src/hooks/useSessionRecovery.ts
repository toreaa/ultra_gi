/**
 * useSessionRecovery Hook
 *
 * React hook for handling session recovery on app startup
 * Provides UI state and actions for recovery flow
 */

import { useState, useEffect } from 'react';
import {
  checkForSmartRecovery,
  recoverSession,
  abandonSession,
  RecoverableSession,
  SessionRecoveryData,
  getRecoveryPromptMessage,
} from '../services/sessionRecovery';

interface UseSessionRecoveryReturn {
  // State
  isChecking: boolean;
  recoverableSession: RecoverableSession | null;
  recoveryData: SessionRecoveryData | null;
  error: string | null;

  // Actions
  attemptRecovery: () => Promise<SessionRecoveryData | null>;
  discardSession: (reason?: string) => Promise<void>;
  dismissRecovery: () => void;

  // Helpers
  recoveryMessage: string | null;
}

export function useSessionRecovery(): UseSessionRecoveryReturn {
  const [isChecking, setIsChecking] = useState(true);
  const [recoverableSession, setRecoverableSession] = useState<RecoverableSession | null>(null);
  const [recoveryData, setRecoveryData] = useState<SessionRecoveryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for recoverable session on mount
  useEffect(() => {
    checkForRecovery();
  }, []);

  const checkForRecovery = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const session = await checkForSmartRecovery();

      if (session) {
        console.log('📱 Recoverable session found:', session);
        setRecoverableSession(session);
      } else {
        console.log('✅ No recoverable sessions found');
      }
    } catch (err) {
      console.error('Failed to check for recoverable sessions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsChecking(false);
    }
  };

  const attemptRecovery = async (): Promise<SessionRecoveryData | null> => {
    if (!recoverableSession) {
      console.warn('No session to recover');
      return null;
    }

    try {
      setError(null);
      console.log('🔄 Attempting recovery...');

      const data = await recoverSession(recoverableSession.sessionId);
      setRecoveryData(data);

      console.log('✅ Session recovered successfully');
      return data;
    } catch (err) {
      console.error('Failed to recover session:', err);
      setError(err instanceof Error ? err.message : 'Recovery failed');
      return null;
    }
  };

  const discardSession = async (reason?: string): Promise<void> => {
    if (!recoverableSession) {
      console.warn('No session to discard');
      return;
    }

    try {
      setError(null);
      await abandonSession(recoverableSession.sessionId, reason);

      // Clear state
      setRecoverableSession(null);
      setRecoveryData(null);

      console.log('✅ Session discarded');
    } catch (err) {
      console.error('Failed to discard session:', err);
      setError(err instanceof Error ? err.message : 'Discard failed');
    }
  };

  const dismissRecovery = () => {
    // User chose not to recover, but don't mark as abandoned
    // (They might want to recover later)
    setRecoverableSession(null);
    console.log('Recovery dismissed by user');
  };

  const recoveryMessage = recoverableSession
    ? getRecoveryPromptMessage(recoverableSession)
    : null;

  return {
    isChecking,
    recoverableSession,
    recoveryData,
    error,
    attemptRecovery,
    discardSession,
    dismissRecovery,
    recoveryMessage,
  };
}

/**
 * Example usage in App.tsx:
 *
 * function App() {
 *   const recovery = useSessionRecovery();
 *
 *   if (recovery.isChecking) {
 *     return <SplashScreen />;
 *   }
 *
 *   if (recovery.recoverableSession) {
 *     return (
 *       <RecoveryDialog
 *         message={recovery.recoveryMessage}
 *         onRecover={async () => {
 *           const data = await recovery.attemptRecovery();
 *           if (data) {
 *             // Navigate to ActiveSessionScreen with recovered data
 *             navigation.navigate('SessionActive', { recoveryData: data });
 *           }
 *         }}
 *         onDiscard={() => {
 *           recovery.discardSession('Bruker valgte å forkaste');
 *         }}
 *         onDismiss={recovery.dismissRecovery}
 *       />
 *     );
 *   }
 *
 *   return <MainApp />;
 * }
 */
