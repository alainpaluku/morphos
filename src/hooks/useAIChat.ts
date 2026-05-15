// Custom hook for AI chat functionality
import { useState, useCallback, useMemo } from 'react';
import { CADService } from '../services/CADService';
import { getActionMetadata } from '../utils/aiUtils';
import { formatAIError } from '../utils/errorHandler';
import { validateAndSanitizeInput } from '../utils/inputValidation';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  isQuotaError?: boolean;
}

export type LoadingPhase = 'analyzing' | 'generating' | null;

interface UseAIChatProps {
  apiKey: string;
  currentModel?: { code: string; name: string } | null;
  onCodeGenerated: (code: string, prompt: string, imageData: string | null, mode: '2D' | '3D') => void;
  onCodeError?: (error: string, code: string, prompt: string) => void;
  initialMode?: '2D' | '3D';
}

export const useAIChat = ({ apiKey, currentModel, onCodeGenerated, onCodeError, initialMode = '3D' }: UseAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string>('');
  const [lastImageData, setLastImageData] = useState<string | null>(null);
  const [lastMode, setLastMode] = useState<'2D' | '3D'>('3D');
  const [isCorrectingCode, setIsCorrectingCode] = useState<boolean>(false);

  // Memoize CAD service instance
  const cadService = useMemo(() => {
    try {
      return new CADService(apiKey);
    } catch (error) {
      console.error('[useAIChat] Failed to initialize CAD service:', error);
      return null;
    }
  }, [apiKey]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSubmit = useCallback(async (
    userPrompt: string,
    imageData: string | null = null,
    overrideMode?: '2D' | '3D'
  ): Promise<void> => {
    if (!cadService) {
      addMessage({
        role: 'error',
        content: '❌ Erreur: Service AI non initialisé. Vérifiez votre clé API.',
        isQuotaError: false
      });
      return;
    }

    // Sanitize and validate input
    let sanitizedPrompt: string;
    try {
      sanitizedPrompt = validateAndSanitizeInput(userPrompt);
    } catch (error) {
      addMessage({
        role: 'error',
        content: `❌ Erreur: ${error instanceof Error ? error.message : 'Prompt invalide'}`,
        isQuotaError: false
      });
      return;
    }

    // Add user message
    addMessage({ role: 'user', content: sanitizedPrompt });
    setLastPrompt(sanitizedPrompt);
    setLoading(true);

    try {
      // Step 1: Analyze request
      setLoadingPhase('analyzing');
      const { searchQuery, actionType, suggestedMode } = await cadService.analyzeRequest(
        sanitizedPrompt,
        imageData,
        currentModel?.code
      );

      const finalMode = overrideMode || suggestedMode || initialMode;

      // Step 2: Get specifications (only for CREATE, silent)
      let specifications: string | null = null;
      if (actionType === 'CREATE') {
        specifications = cadService.getSpecifications(searchQuery);
      }

      // Step 3: Generate code
      setLoadingPhase('generating');
      const existingCode = (actionType === 'MODIFY' || actionType === 'ADJUST')
        ? currentModel?.code
        : null;

      const code = await cadService.generateCode(
        sanitizedPrompt,
        specifications,
        imageData,
        existingCode,
        finalMode
      );

      // Step 4: Validate generated code
      if (!code || code.trim().length === 0) {
        throw new Error('Le code généré est vide. Veuillez réessayer avec une description plus détaillée.');
      }

      // Check if code contains main function
      if (!code.includes('const main') && !code.includes('function main')) {
        throw new Error('Le code généré ne contient pas de fonction main(). Génération invalide.');
      }

      // Store for potential correction
      setLastGeneratedCode(code);
      setLastImageData(imageData);
      setLastMode(finalMode);

      // Success message - ONLY ONE MESSAGE
      const { emoji, text } = getActionMetadata(actionType);
      const successSuffix = actionType !== 'CREATE' && currentModel
        ? ` de ${currentModel.name}`
        : '';

      addMessage({
        role: 'assistant',
        content: `${emoji} ${text}${successSuffix} terminé avec succès !`
      });

      // Store for potential correction
      setLastImageData(imageData);

      // Pass imageData and mode to parent component
      onCodeGenerated(code, sanitizedPrompt, imageData, finalMode);

    } catch (error) {
      const { message, isQuotaError } = formatAIError(error);

      addMessage({
        role: 'error',
        content: `❌ Erreur: ${message}`,
        isQuotaError
      });

      // Add retry suggestion for non-quota errors
      if (!isQuotaError) {
        addMessage({
          role: 'assistant',
          content: `💡 Conseil: Essayez de reformuler votre demande avec plus de détails (dimensions, type de pièce, matériau, etc.)`
        });
      }
    } finally {
      setLoading(false);
      setLoadingPhase(null);
    }
  }, [cadService, currentModel, onCodeGenerated, addMessage]);

  const retry = useCallback(() => {
    return lastPrompt;
  }, [lastPrompt]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Fonction pour corriger automatiquement le code en cas d'erreur
  const correctCodeAutomatically = useCallback(async (
    errorMessage: string,
    failedCode: string,
    originalPrompt: string,
    imageData: string | null = null
  ): Promise<void> => {
    if (!cadService || isCorrectingCode) return;

    setIsCorrectingCode(true);
    addMessage({
      role: 'assistant',
      content: '🔧 Correction du code en cours...'
    });

    try {
      console.log('[useAIChat] Attempting to correct code...');
      const correctedCode = await cadService.correctCode(
        originalPrompt,
        failedCode,
        errorMessage,
        imageData
      );

      console.log('[useAIChat] Code corrected successfully');

      // Validate corrected code
      if (!correctedCode || correctedCode.trim().length === 0) {
        throw new Error('Le code corrigé est vide');
      }

      if (!correctedCode.includes('const main') && !correctedCode.includes('function main')) {
        throw new Error('Le code corrigé ne contient pas de fonction main()');
      }

      // Store corrected code
      setLastGeneratedCode(correctedCode);

      // Success message
      addMessage({
        role: 'assistant',
        content: '✅ Code corrigé avec succès ! Génération du modèle 3D...'
      });

      // Try to generate with corrected code (pass imageData)
      onCodeGenerated(correctedCode, originalPrompt, imageData, lastMode);

    } catch (error) {
      const { message } = formatAIError(error);
      console.error('[useAIChat] Code correction failed:', message);

      addMessage({
        role: 'error',
        content: `❌ Échec de la correction automatique: ${message}`
      });

      addMessage({
        role: 'assistant',
        content: '💡 Conseil: Essayez de reformuler votre demande avec plus de détails ou de simplifier la forme.'
      });
    } finally {
      setIsCorrectingCode(false);
    }
  }, [cadService, isCorrectingCode, onCodeGenerated, addMessage]);

  return {
    messages,
    loading,
    loadingPhase,
    handleSubmit,
    retry,
    clearMessages,
    correctCodeAutomatically,
    isCorrectingCode
  };
};
