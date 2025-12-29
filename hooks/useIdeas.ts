
import { useState, useCallback, useRef, useEffect } from 'react';
import { AppIdea, VibeState, LoadingStatus } from '../types';
import { generateAppIdea, refineAppIdea } from '../services/geminiService';
import { ERROR_MESSAGES } from '../constants';
import { generateUUID, isRateLimitError } from '../utils/helpers';
import { saveIdeaToVault, getSavedIdeas, deleteIdeaFromVault, auth } from '../services/firebase';

export function useIdeas() {
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [vault, setVault] = useState<AppIdea[]>([]);
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize Vault
  useEffect(() => {
    const loadVault = async () => {
      if (auth.currentUser) {
        const saved = await getSavedIdeas(auth.currentUser.uid);
        setVault(saved.sort((a: any, b: any) => (b.savedAt || 0) - (a.savedAt || 0)));
      }
    };
    loadVault();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const generate = useCallback(async (vibe: VibeState, onComplete?: (idea: AppIdea) => void) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setStatus('generating');
    setError(null);

    try {
      const result = await generateAppIdea(vibe);
      const ideaWithId = { ...result, id: generateUUID() };
      setIdeas(prev => [ideaWithId, ...prev]);
      if (onComplete) onComplete(ideaWithId);
      return ideaWithId;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Generation Error:', err);
      if (isRateLimitError(err)) {
        setError(ERROR_MESSAGES.RATE_LIMIT);
      } else {
        setError(ERROR_MESSAGES.GENERATION_FAILED);
      }
    } finally {
      setStatus('idle');
    }
  }, []);

  const refine = useCallback(async (index: number) => {
    if (index < 0 || index >= ideas.length) return;

    const ideaToRefine = ideas[index];
    setStatus('refining');
    setError(null);

    try {
      const result = await refineAppIdea(ideaToRefine);
      const refinedIdea = { ...result, id: ideaToRefine.id };
      setIdeas(prev => {
        const newIdeas = [...prev];
        newIdeas[index] = refinedIdea;
        return newIdeas;
      });
      // If it was already in vault, update it there too
      if (vault.some(i => i.id === refinedIdea.id)) {
        saveToVault(refinedIdea);
      }
    } catch (err: unknown) {
      console.error('Refinement Error:', err);
      setError(ERROR_MESSAGES.REFINEMENT_FAILED);
    } finally {
      setStatus('idle');
    }
  }, [ideas, vault]);

  const saveToVault = useCallback(async (idea: AppIdea) => {
    if (!auth.currentUser) return;
    try {
      await saveIdeaToVault(auth.currentUser.uid, idea);
      setVault(prev => {
        const filtered = prev.filter(i => i.id !== idea.id);
        return [idea, ...filtered];
      });
    } catch (e) {
      console.error("Failed to save idea:", e);
    }
  }, []);

  const removeFromVault = useCallback(async (ideaId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteIdeaFromVault(auth.currentUser.uid, ideaId);
      setVault(prev => prev.filter(i => i.id !== ideaId));
    } catch (e) {
      console.error("Failed to delete idea:", e);
    }
  }, []);

  return { ideas, vault, status, error, generate, refine, saveToVault, removeFromVault, clearError };
}
