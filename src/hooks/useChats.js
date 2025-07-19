import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateChatTitle, limitMessagesByTokensWithPrompt, prepareMessagesForAPI } from '../utils/helpers';
import { OpenAIService } from '../services/openai';

/**
 * Hook quản lý tất cả logic chat theo workspace
 * Bao gồm: tạo chat, xóa chat, gửi tin nhắn, lưu trữ
 * 
 * Version: 2.0 - Workspace-based chat isolation
 */
export function useChats(settings = {}, currentWorkspaceId = null, currentWorkspace = null) {
  const [allChats, setAllChats] = useLocalStorage('workspace_chats', {});
  const [currentChatId, setCurrentChatId] = useLocalStorage('current_chat_id', null);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy chats của workspace hiện tại với useMemo để tối ưu
  const chats = useMemo(() => {
    const result = currentWorkspaceId ? (allChats[currentWorkspaceId] || []) : [];
    return result;
  }, [allChats, currentWorkspaceId]);

  // Tìm chat hiện tại
  const currentChat = useMemo(() => {
    const result = chats.find(chat => chat.id === currentChatId) || null;
    return result;
  }, [chats, currentChatId]);

  // Hàm cập nhật chats cho workspace hiện tại
  const updateWorkspaceChats = useCallback((newChats) => {
    if (!currentWorkspaceId) return;
    
    setAllChats(prev => {
      const updated = {
        ...prev,
        [currentWorkspaceId]: newChats
      };
      return updated;
    });
  }, [setAllChats, currentWorkspaceId]);

  // Không tự động tạo chat - user sẽ tự tạo khi cần

  // Tạo chat mới
  const createNewChat = useCallback(() => {
    if (!currentWorkspaceId) {
      console.error('❌ Cannot create chat: no currentWorkspaceId');
      return;
    }
    
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: currentWorkspace?.apiSettings?.useCustomApiKey ? 
        (currentWorkspace?.apiSettings?.model || 'gpt-4o-mini') : 
        (settings.model || 'gpt-4o-mini')
    };
    
    const newChats = [newChat, ...chats];
    updateWorkspaceChats(newChats);
    setCurrentChatId(newChat.id);
    
    return newChat;
  }, [currentWorkspaceId, chats, updateWorkspaceChats, setCurrentChatId, settings.model, currentWorkspace?.apiSettings?.useCustomApiKey, currentWorkspace?.apiSettings?.model]);

  // Xóa chat
  const deleteChat = useCallback((chatId) => {
    if (!currentWorkspaceId) return;
    
    const newChats = chats.filter(chat => chat.id !== chatId);
    updateWorkspaceChats(newChats);
    
    if (currentChatId === chatId) {
      const nextChat = newChats[0];
      setCurrentChatId(nextChat ? nextChat.id : null);
    }
  }, [currentWorkspaceId, chats, updateWorkspaceChats, currentChatId, setCurrentChatId]);

  // Cập nhật tiêu đề chat
  const updateChatTitle = useCallback((chatId, newTitle) => {
    if (!currentWorkspaceId) return;
    
    const newChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle, updatedAt: new Date().toISOString() } : chat
    );
    updateWorkspaceChats(newChats);
  }, [currentWorkspaceId, chats, updateWorkspaceChats]);

  // Gửi tin nhắn
  const sendMessage = useCallback(async (messageContent, systemPrompt = null) => {
    if (!currentWorkspaceId) {
      console.error('❌ No currentWorkspaceId');
      return;
    }
    
    const targetChatId = currentChatId;
    if (!targetChatId) {
      console.error('❌ No targetChatId');
      return;
    }

    const targetChat = chats.find(chat => chat.id === targetChatId);
    if (!targetChat) {
      console.error('❌ No targetChat found');
      return;
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      content: messageContent,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    const updatedChat = {
      ...targetChat,
      messages: [...targetChat.messages, newMessage],
      updatedAt: new Date().toISOString()
    };

    const updatedChats = chats.map(chat =>
      chat.id === targetChatId ? updatedChat : chat
    );
    
    updateWorkspaceChats(updatedChats);
    setIsLoading(true);

    try {
      const updatedChat = updatedChats.find(chat => chat.id === targetChatId);
      const limitedMessages = limitMessagesByTokensWithPrompt(updatedChat.messages, 4000);
      const apiMessages = prepareMessagesForAPI(limitedMessages);

      // Tạo instance OpenAIService với API key từ workspace hoặc settings
      let apiKey, model;
      
      // Check if workspace uses custom API configuration
      if (currentWorkspace?.apiSettings?.useCustomApiKey && currentWorkspace?.apiSettings?.apiKey) {
        apiKey = currentWorkspace.apiSettings.apiKey;
        model = currentWorkspace.apiSettings.model || 'gpt-4o-mini';
      } else {
        // Fall back to global settings
        apiKey = settings.getApiKey?.() || import.meta.env.VITE_OPENAI_API_KEY;
        model = settings.model || 'gpt-4o-mini';
      }
      
      if (!apiKey) {
        throw new Error('No API key found. Please configure API key in workspace settings or global settings.');
      }
      
      const openAIService = new OpenAIService(apiKey);
      
      // Build system prompt by combining all levels
      const buildSystemPrompt = () => {
        let finalSystemPrompt = '';
        
        // 1. Global System Prompt từ user settings (only if workspace enables it)
        if (settings?.globalSystemPrompt && currentWorkspace?.useGlobalSystemPrompt !== false) {
          finalSystemPrompt += settings.globalSystemPrompt;
        }
        
        // 2. Persona character definition (if workspace has persona)
        if (currentWorkspace?.persona?.characterDefinition) {
          if (finalSystemPrompt) finalSystemPrompt += '\n\n';
          finalSystemPrompt += currentWorkspace.persona.characterDefinition;
        }
        
        // 3. Custom system prompt từ parameter (cao nhất)
        if (systemPrompt) {
          if (finalSystemPrompt) finalSystemPrompt += '\n\n';
          finalSystemPrompt += systemPrompt;
        }
        
        return finalSystemPrompt || null;
      };
      
      const response = await openAIService.sendMessage(
        apiMessages,
        model, // Use workspace or global model
        {
          temperature: currentWorkspace?.settings?.temperature || currentWorkspace?.persona?.temperature || 0.7,
          max_tokens: currentWorkspace?.settings?.maxTokens || currentWorkspace?.persona?.maxTokens || 1000,
          top_p: currentWorkspace?.settings?.topP || 1.0,
          presence_penalty: currentWorkspace?.settings?.presencePenalty || 0.0,
          frequency_penalty: currentWorkspace?.settings?.frequencyPenalty || 0.0,
          stop: currentWorkspace?.settings?.stop?.length > 0 ? currentWorkspace?.settings?.stop : undefined,
          logit_bias: Object.keys(currentWorkspace?.settings?.logitBias || {}).length > 0 ? currentWorkspace?.settings?.logitBias : undefined,
          systemPrompt: buildSystemPrompt()
        }
      );

      const assistantMessage = {
        id: `msg_${Date.now() + 1}`,
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        usage: response.usage
      };

      // Cập nhật với phản hồi
      const finalChats = updatedChats.map(chat => {
        if (chat.id === targetChatId) {
          const newMessages = [...chat.messages, assistantMessage];
          return {
            ...chat,
            messages: newMessages,
            updatedAt: new Date().toISOString(),
            title: chat.title === 'New Chat' ? generateChatTitle(newMessages[0]?.content) : chat.title
          };
        }
        return chat;
      });

      updateWorkspaceChats(finalChats);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, chats, currentChatId, updateWorkspaceChats, settings, currentWorkspace]);

  // Regenerate response
  const regenerateResponse = useCallback(async (chatId, messageIndex) => {
    if (!currentWorkspaceId) return;
    
    const targetChat = chats.find(chat => chat.id === chatId);
    if (!targetChat) return;

    const messagesUpToIndex = targetChat.messages.slice(0, messageIndex);
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, messages: messagesUpToIndex, updatedAt: new Date().toISOString() } : chat
    );

    updateWorkspaceChats(updatedChats);
    setIsLoading(true);

    try {
      const limitedMessages = limitMessagesByTokensWithPrompt(messagesUpToIndex, 4000);
      const apiMessages = prepareMessagesForAPI(limitedMessages);

      // Tạo instance OpenAIService với API key từ workspace hoặc settings
      let apiKey, model;
      
      // Check if workspace uses custom API configuration
      if (currentWorkspace?.apiSettings?.useCustomApiKey && currentWorkspace?.apiSettings?.apiKey) {
        apiKey = currentWorkspace.apiSettings.apiKey;
        model = currentWorkspace.apiSettings.model || 'gpt-4o-mini';
      } else {
        // Fall back to global settings
        apiKey = settings.getApiKey?.() || import.meta.env.VITE_OPENAI_API_KEY;
        model = settings.model || 'gpt-4o-mini';
      }
      
      if (!apiKey) {
        throw new Error('No API key found. Please configure API key in workspace settings or global settings.');
      }
      
      const openAIService = new OpenAIService(apiKey);

      // Build system prompt by combining all levels
      const buildSystemPrompt = () => {
        let finalSystemPrompt = '';
        
        // 1. Global System Prompt từ user settings (only if workspace enables it)
        if (settings?.globalSystemPrompt && currentWorkspace?.useGlobalSystemPrompt !== false) {
          finalSystemPrompt += settings.globalSystemPrompt;
        }
        
        // 2. Persona character definition
        if (currentWorkspace?.persona?.characterDefinition) {
          if (finalSystemPrompt) finalSystemPrompt += '\n\n';
          finalSystemPrompt += currentWorkspace.persona.characterDefinition;
        }
        
        return finalSystemPrompt || null;
      };

      const response = await openAIService.sendMessage(
        apiMessages,
        model, // Use workspace or global model
        {
          temperature: currentWorkspace?.settings?.temperature || currentWorkspace?.persona?.temperature || 0.7,
          max_tokens: currentWorkspace?.settings?.maxTokens || currentWorkspace?.persona?.maxTokens || 1000,
          top_p: currentWorkspace?.settings?.topP || 1.0,
          presence_penalty: currentWorkspace?.settings?.presencePenalty || 0.0,
          frequency_penalty: currentWorkspace?.settings?.frequencyPenalty || 0.0,
          stop: currentWorkspace?.settings?.stop?.length > 0 ? currentWorkspace?.settings?.stop : undefined,
          logit_bias: Object.keys(currentWorkspace?.settings?.logitBias || {}).length > 0 ? currentWorkspace?.settings?.logitBias : undefined,
          systemPrompt: buildSystemPrompt()
        }
      );

      const assistantMessage = {
        id: Date.now().toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        usage: response.usage
      };

      const finalChats = updatedChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, assistantMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return chat;
      });

      updateWorkspaceChats(finalChats);
      return response;
    } catch (error) {
      console.error('Error regenerating response:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, chats, updateWorkspaceChats, settings, currentWorkspace]);

  // Delete message
  const deleteMessage = useCallback((chatId, messageId) => {
    if (!currentWorkspaceId) return;
    
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = chat.messages.filter(msg => msg.id !== messageId);
        return { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() };
      }
      return chat;
    });

    updateWorkspaceChats(updatedChats);
  }, [currentWorkspaceId, chats, updateWorkspaceChats]);

  // Switch to chat
  const switchToChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
  }, [setCurrentChatId]);

  return {
    // State
    chats,
    currentChat,
    currentChatId,
    isLoading,

    // Actions
    createNewChat,
    deleteChat,
    updateChatTitle,
    sendMessage,
    switchToChat,
    regenerateResponse,

    // Message actions
    deleteMessage
  };
}