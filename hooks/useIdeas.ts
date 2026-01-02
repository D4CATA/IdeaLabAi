import { useState, useCallback, useRef, useEffect } from 'react';
import { AppIdea, VibeState, LoadingStatus } from '../types';
import { generateAppIdea, refineAppIdea, mutateAppIdea } from '../services/geminiService';
import { ERROR_MESSAGES } from '../constants';
import { generateUUID, isRateLimitError } from '../utils/helpers';
import { saveIdeaToVault, getSavedIdeas, deleteIdeaFromVault, auth, createOrUpdateUser } from '../services/firebase';

const IDEAS_STORAGE_KEY = 'idealab_cached_session_ideas';

export function useIdeas() {
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [vault, setVault] = useState<AppIdea[]>([]);
  const [status, setStatus] = useState<LoadingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(IDEAS_STORAGE_KEY);
    if (cached) {
      try {
        setIdeas(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached session ideas:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    const loadVault = async () => {
      if (auth.currentUser) {
        try {
          const saved = await getSavedIdeas(auth.currentUser.uid);
          setVault(saved.sort((a: any, b: any) => (b.savedAt || 0) - (a.savedAt || 0)));
        } catch (e) {
          console.error("Vault sync failed:", e);
        }
      } else {
        setVault([]);
      }
    };
    loadVault();
  }, [auth.currentUser?.uid]);

  const clearError = useCallback(() => setError(null), []);

  const generate = useCallback(async (vibe: VibeState) => {
    setStatus('generating');
    setError(null);
    try {
      const result = await generateAppIdea(vibe);
      const ideaWithId = { ...result, id: generateUUID() };
      setIdeas(prev => [ideaWithId, ...prev]);
      return ideaWithId;
    } catch (err: any) {
      setError(ERROR_MESSAGES.GENERATION_FAILED);
    } finally {
      setStatus('idle');
    }
  }, []);

  const mutate = useCallback(async (ideaId: string) => {
    const ideaToMutate = ideas.find(i => i.id === ideaId) || vault.find(i => i.id === ideaId);
    if (!ideaToMutate) return;

    setStatus('mutating');
    setError(null);
    try {
      const result = await mutateAppIdea(ideaToMutate);
      const mutatedIdea = { ...result, id: generateUUID(), parentId: ideaToMutate.id };
      setIdeas(prev => [mutatedIdea, ...prev]);
      return mutatedIdea;
    } catch (err: any) {
      setError("Mutation failed.");
    } finally {
      setStatus('idle');
    }
  }, [ideas, vault]);

  const refine = useCallback(async (ideaId: string) => {
    const isFromVault = vault.some(i => i.id === ideaId);
    const ideaToRefine = isFromVault ? vault.find(i => i.id === ideaId) : ideas.find(i => i.id === ideaId);
    if (!ideaToRefine) return;

    setStatus('refining');
    try {
      const result = await refineAppIdea(ideaToRefine);
      const refinedIdea = { ...result, id: ideaToRefine.id };
      
      if (isFromVault) {
        setVault(prev => prev.map(i => i.id === ideaId ? refinedIdea : i));
        await saveIdeaToVault(auth.currentUser!.uid, refinedIdea);
      } else {
        setIdeas(prev => prev.map(i => i.id === ideaId ? refinedIdea : i));
      }
    } catch (err: any) {
      setError(ERROR_MESSAGES.REFINEMENT_FAILED);
    } finally {
      setStatus('idle');
    }
  }, [ideas, vault]);

  const saveToVault = useCallback(async (idea: AppIdea) => {
    if (!auth.currentUser) return;
    try {
      await saveIdeaToVault(auth.currentUser.uid, idea);
      setVault(prev => [idea, ...prev.filter(i => i.id !== idea.id)]);
    } catch (e) {
      console.error("Save failed:", e);
    }
  }, []);

  const claimIdea = useCallback(async (ideaId: string) => {
    if (!auth.currentUser?.isPro) return;
    try {
      const idea = ideas.find(i => i.id === ideaId) || vault.find(i => i.id === ideaId);
      if (!idea) return;
      const claimed = { ...idea, isClaimed: true };
      await saveIdeaToVault(auth.currentUser.uid, claimed);
      setVault(prev => [claimed, ...prev.filter(i => i.id !== ideaId)]);
      return true;
    } catch (e) { return false; }
  }, [ideas, vault]);

  const removeFromVault = useCallback(async (ideaId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteIdeaFromVault(auth.currentUser.uid, ideaId);
      setVault(prev => prev.filter(i => i.id !== ideaId));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }, []);

  return { ideas, vault, status, error, generate, mutate, refine, claimIdea, saveToVault, removeFromVault, clearError };
}