// Custom hook for AI chat functionality
import { useState, useCallback, useMemo } from 'react';
import { CADService } from '../services/CADService';
import { formatAIError, getActionMetadata } from '../utils/aiUtils';
import { sanitizeInput } from '../utils/securityUtils';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  isQuotaError?: boolean;
}

interface UseAIChatProps {
  apiKey: string;
  currentModel?: { code: string; name: string } | null;
  onCodeGenerated: (code: string, prompt: string) => void;
}

export const useAIChat = ({ apiKey, currentModel, onCodeGenerated }: UseAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastPrompt, setLastPrompt] = useState<string>('');

  // Memoize CAD service instance
  const cadService = useMemo(() => {
    try {
      return new CADService(apiKey);
    } catch (error) {
      return null;
    }
  }, [apiKey]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSubmit = useCallback(async (
    userPrompt: string,
    imageData: string | null = null
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
    const sanitizedPrompt = sanitizeInput(userPrompt);
    if (!sanitizedPrompt) {
      addMessage({
        role: 'error',
        content: '❌ Erreur: Prompt invalide ou vide.',
        isQuotaError: false
      });
      return;
    }

    // Add user message
    addMessage({ role: 'user', content: sanitizedPrompt });
    setLastPrompt(sanitizedPrompt);
    setLoading(true);

    try {
      // Step 1: Analyze request (silent - no message)
      const { searchQuery, actionType } = await cadService.analyzeRequest(
        sanitizedPrompt,
        imageData,
        currentModel?.code
      );

      // Step 2: Get specifications (only for CREATE, silent)
      let specifications: string | null = null;
      if (actionType === 'CREATE') {
        specifications = cadService.getSpecifications(searchQuery);
      }

      // Step 3: Generate code (silent)
      const existingCode = (actionType === 'MODIFY' || actionType === 'ADJUST') 
        ? currentModel?.code 
        : null;
      
      const code = await cadService.generateCode(
        sanitizedPrompt,
        specifications,
        imageData,
        existingCode
      );

      // Step 4: Validate generated code
      if (!code || code.trim().length === 0) {
        throw new Error('Le code généré est vide. Veuillez réessayer avec une description plus détaillée.');
      }

      // Check if code contains main function
      if (!code.includes('const main') && !code.includes('function main')) {
        throw new Error('Le code généré ne contient pas de fonction main(). Génération invalide.');
      }

      // Success message - ONLY ONE MESSAGE
      const { emoji, text } = getActionMetadata(actionType);
      const successSuffix = actionType !== 'CREATE' && currentModel 
        ? ` de ${currentModel.name}` 
        : '';
      
      addMessage({
        role: 'assistant',
        content: `${emoji} ${text}${successSuffix} terminé avec succès !`
      });

      onCodeGenerated(code, sanitizedPrompt);

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
    }
  }, [cadService, currentModel, onCodeGenerated, addMessage]);

  const retry = useCallback(() => {
    return lastPrompt;
  }, [lastPrompt]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    handleSubmit,
    retry,
    clearMessages
  };
};
