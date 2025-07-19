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
    console.log('🔄 useChats - chats recalculated:', { currentWorkspaceId, result });
    return result;
  }, [allChats, currentWorkspaceId]);

  // Tìm chat hiện tại
  const currentChat = useMemo(() => {
    const result = chats.find(chat => chat.id === currentChatId) || null;
    console.log('🔄 useChats - currentChat recalculated:', { currentChatId, result });
    return result;
  }, [chats, currentChatId]);

  // Hàm cập nhật chats cho workspace hiện tại
  const updateWorkspaceChats = useCallback((newChats) => {
    if (!currentWorkspaceId) return;
    
    console.log('💾 updateWorkspaceChats called:', { currentWorkspaceId, newChats });
    
    setAllChats(prev => {
      const updated = {
        ...prev,
        [currentWorkspaceId]: newChats
      };
      console.log('💾 setAllChats updating:', { prev, updated });
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
    
    console.log('🆕 Creating new chat:', newChat);
    
    const newChats = [newChat, ...chats];
    updateWorkspaceChats(newChats);
    setCurrentChatId(newChat.id);
    
    console.log('✅ New chat created and set as current:', { chatId: newChat.id, newChats });
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
    console.log('🔥 sendMessage called with:', { messageContent, systemPrompt, currentWorkspaceId, currentChatId });
    
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

    console.log('✅ Target chat found:', targetChat);

    const newMessage = {
      id: `msg_${Date.now()}`,
      content: messageContent,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    console.log('📨 New message created:', newMessage);

    const updatedChat = {
      ...targetChat,
      messages: [...targetChat.messages, newMessage],
      updatedAt: new Date().toISOString()
    };

    const updatedChats = chats.map(chat =>
      chat.id === targetChatId ? updatedChat : chat
    );

    console.log('💾 Updating workspace chats:', updatedChats);
    
    // Check if the user message was added correctly
    const checkChat = updatedChats.find(chat => chat.id === targetChatId);
    console.log('🔍 Check chat after adding user message:', checkChat);
    console.log('🔍 Check messages in chat:', checkChat?.messages);
    
    updateWorkspaceChats(updatedChats);
    setIsLoading(true);

    try {
      const updatedChat = updatedChats.find(chat => chat.id === targetChatId);
      const limitedMessages = limitMessagesByTokensWithPrompt(updatedChat.messages, 4000);
      const apiMessages = prepareMessagesForAPI(limitedMessages);

      console.log('🔑 API call preparation:', {
        limitedMessages: limitedMessages.length,
        apiMessages: apiMessages.length,
        workspaceSettings: currentWorkspace?.settings
      });

      // Tạo instance OpenAIService với API key từ workspace hoặc settings
      let apiKey, model;
      
      // Check if workspace uses custom API configuration
      if (currentWorkspace?.apiSettings?.useCustomApiKey && currentWorkspace?.apiSettings?.apiKey) {
        apiKey = currentWorkspace.apiSettings.apiKey;
        model = currentWorkspace.apiSettings.model || 'gpt-4o-mini';
        console.log('🔑 Using workspace API configuration:', { 
          hasApiKey: !!apiKey, 
          apiKeyLength: apiKey?.length,
          model: model 
        });
      } else {
        // Fall back to global settings
        apiKey = settings.getApiKey?.() || import.meta.env.VITE_OPENAI_API_KEY;
        model = settings.model || 'gpt-4o-mini';
        console.log('🔑 Using global API configuration:', { 
          hasApiKey: !!apiKey, 
          apiKeyLength: apiKey?.length,
          model: model 
        });
      }
      
      if (!apiKey) {
        throw new Error('No API key found. Please configure API key in workspace settings or global settings.');
      }
      
      const openAIService = new OpenAIService(apiKey);

      console.log('🚀 Calling OpenAI API...');
      
      // Build system prompt by combining all levels
      const buildSystemPrompt = () => {
        let finalSystemPrompt = '';
        
        // DEBUG: Log current workspace structure
        console.log('🔍 DEBUG buildSystemPrompt:', {
          currentWorkspace,
          hasPersona: !!currentWorkspace?.persona,
          hasCharacterDefinition: !!currentWorkspace?.persona?.characterDefinition,
          characterDefinition: currentWorkspace?.persona?.characterDefinition,
          globalSystemPrompt: settings?.globalSystemPrompt,
          useGlobalSystemPrompt: currentWorkspace?.useGlobalSystemPrompt
        });
        
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
        
        console.log('🎯 Built system prompt:', {
          hasGlobalSystemPrompt: !!settings?.globalSystemPrompt,
          useGlobalSystemPrompt: currentWorkspace?.useGlobalSystemPrompt,
          hasPersonaCharacterDefinition: !!currentWorkspace?.persona?.characterDefinition,
          hasCustomPrompt: !!systemPrompt,
          finalLength: finalSystemPrompt.length,
          currentWorkspacePersona: currentWorkspace?.persona,
          finalSystemPrompt: finalSystemPrompt.substring(0, 200) + '...'
        });
        
        return finalSystemPrompt || null;
      };
      
      const response = await openAIService.sendMessage(
        apiMessages,
        model, // Use workspace or global model
        {
          temperature: currentWorkspace?.settings?.temperature || currentWorkspace?.persona?.temperature || 0.7,
          max_tokens: currentWorkspace?.settings?.maxTokens || currentWorkspace?.persona?.maxTokens || 1000,
          systemPrompt: buildSystemPrompt()
        }
      );

      console.log('✅ OpenAI API response:', response);

      const assistantMessage = {
        id: `msg_${Date.now() + 1}`,
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        usage: response.usage
      };

      console.log('🤖 Assistant message created:', assistantMessage);

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

      console.log('🎯 Final chats with assistant message:', finalChats);
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

  // Edit message
  const editMessage = useCallback((chatId, messageId, newContent) => {
    if (!currentWorkspaceId) return;
    
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = chat.messages.map(msg =>
          msg.id === messageId ? { ...msg, content: newContent, edited: true } : msg
        );
        return { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() };
      }
      return chat;
    });

    updateWorkspaceChats(updatedChats);
  }, [currentWorkspaceId, chats, updateWorkspaceChats]);

  // Branch message
  const branchMessage = useCallback((chatId, messageIndex) => {
    if (!currentWorkspaceId) return;
    
    const sourceChat = chats.find(chat => chat.id === chatId);
    if (!sourceChat) return;

    const branchedMessages = sourceChat.messages.slice(0, messageIndex + 1);
    const newChat = {
      id: Date.now().toString(),
      title: `${sourceChat.title} (Branch)`,
      messages: branchedMessages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: sourceChat.model,
      parentChatId: chatId
    };

    const newChats = [newChat, ...chats];
    updateWorkspaceChats(newChats);
    setCurrentChatId(newChat.id);
    return newChat;
  }, [currentWorkspaceId, chats, updateWorkspaceChats, setCurrentChatId]);

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

  // Bookmark message
  const bookmarkMessage = useCallback((chatId, messageId) => {
    if (!currentWorkspaceId) return;
    
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = chat.messages.map(msg =>
          msg.id === messageId ? { ...msg, bookmarked: !msg.bookmarked } : msg
        );
        return { ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() };
      }
      return chat;
    });

    updateWorkspaceChats(updatedChats);
  }, [currentWorkspaceId, chats, updateWorkspaceChats]);

  // Clear all chats
  const clearAllChats = useCallback(() => {
    if (!currentWorkspaceId) return;
    
    updateWorkspaceChats([]);
    setCurrentChatId(null);
  }, [currentWorkspaceId, updateWorkspaceChats, setCurrentChatId]);

  // Switch to chat
  const switchToChat = useCallback((chatId) => {
    console.log('🔄 switchToChat called:', { chatId, currentChatId });
    setCurrentChatId(chatId);
    console.log('✅ switchToChat completed, new currentChatId should be:', chatId);
  }, [setCurrentChatId, currentChatId]);

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
    editMessage,
    branchMessage,
    deleteMessage,
    bookmarkMessage,

    // Utils
    clearAllChats
  };
}