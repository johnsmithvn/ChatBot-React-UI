import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateChatTitle } from '../utils/helpers';
import { OpenAIService } from '../services/openai';

/**
 * Hook quản lý tất cả logic chat
 * Bao gồm: tạo chat, xóa chat, gửi tin nhắn, lưu trữ
 */
export function useChats(settings = {}) {
  const [chats, setChats, clearChats] = useLocalStorage('chat_sessions', []);
  const [currentChatId, setCurrentChatId] = useLocalStorage('current_chat_id', null);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy chat hiện tại
  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Debug effect để track changes
  useEffect(() => {
    console.log('Chats updated:', chats);
    console.log('Current chat:', currentChat);
  }, [chats, currentChat]);

  /**
   * Tạo chat mới
   */
  const createNewChat = useCallback(() => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      model: settings.model,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat;
  }, [setChats, setCurrentChatId, settings.model]);

  /**
   * Chọn chat
   */
  const selectChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
  }, [setCurrentChatId]);

  /**
   * Xóa chat
   */
  const deleteChat = useCallback((chatId) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  }, [chats, currentChatId, setChats, setCurrentChatId]);

  /**
   * Đổi tên chat
   */
  const renameChat = useCallback((chatId, newTitle) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle, updatedAt: new Date().toISOString() }
        : chat
    ));
  }, [setChats]);

  /**
   * Cập nhật tin nhắn trong chat
   */
  const updateChatMessages = useCallback((chatId, newMessages) => {
    console.log('Updating chat messages for chat:', chatId, 'with messages:', newMessages);
    
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            messages: newMessages,
            updatedAt: new Date().toISOString(),
            // Auto-generate title từ first user message
            title: chat.messages?.length === 0 && newMessages.length > 0 && newMessages[0].role === 'user' 
              ? generateChatTitle(newMessages[0].content) 
              : chat.title
          };
          console.log('Updated chat:', updatedChat);
          return updatedChat;
        }
        return chat;
      });
      console.log('All updated chats:', updatedChats);
      return updatedChats;
    });
  }, [setChats]);

  /**
   * Gửi tin nhắn
   */
  const sendMessage = useCallback(async (messageContent) => {
    if (!currentChatId || !messageContent.trim()) return;

    // Kiểm tra API key
    const apiKey = settings.useCustomApiKey ? settings.apiKey : import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: settings.useCustomApiKey 
          ? '❌ **Lỗi:** Vui lòng cấu hình API Key trong Settings trước khi sử dụng.'
          : '❌ **Lỗi:** Không tìm thấy API Key trong environment variables. Vui lòng bật "Use custom API key" và nhập API key.',
        timestamp: new Date().toISOString()
      };
      updateChatMessages(currentChatId, errorMessage);
      return;
    }

    setIsLoading(true);

    // Lấy messages hiện tại TRƯỚC khi update
    const currentMessages = currentChat?.messages || [];

    // Tạo tin nhắn user
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('Adding user message:', userMessage);
    console.log('Current messages before update:', currentMessages);

    // Hiển thị user message ngay lập tức
    const messagesWithUser = [...currentMessages, userMessage];
    updateChatMessages(currentChatId, messagesWithUser);

    try {
      // Chuẩn bị messages cho API
      const messagesForAPI = messagesWithUser.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('All messages for API:', messagesForAPI);

      // Gọi OpenAI API
      const openaiService = new OpenAIService(apiKey);
      const response = await openaiService.sendMessage(messagesForAPI, settings.model);

      // Thêm response từ AI
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      // Cập nhật với cả user message và assistant message
      const finalMessages = [...messagesWithUser, assistantMessage];
      updateChatMessages(currentChatId, finalMessages);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Thêm error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Lỗi: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      // Cập nhật với user message và error message
      const finalMessages = [...messagesWithUser, errorMessage];
      updateChatMessages(currentChatId, finalMessages);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, currentChat, settings, updateChatMessages]);

  /**
   * Xóa tất cả chat
   */
  const clearAllChats = useCallback(() => {
    if (window.confirm('🗑️ Bạn có chắc muốn xóa tất cả chat?')) {
      clearChats();
      setCurrentChatId(null);
    }
  }, [clearChats, setCurrentChatId]);

  /**
   * Khởi tạo chat đầu tiên nếu chưa có
   */
  const initializeFirstChat = useCallback(() => {
    if (chats.length === 0) {
      createNewChat();
    } else if (!currentChatId && chats.length > 0) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId, createNewChat, setCurrentChatId]);

  return {
    // State
    chats,
    currentChat,
    currentChatId,
    isLoading,

    // Actions
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    sendMessage,
    clearAllChats,
    initializeFirstChat
  };
}
