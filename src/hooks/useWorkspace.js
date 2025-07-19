import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { WORKSPACE_CONFIG, DEFAULT_PERSONAS } from '../utils/constants';

/**
 * Hook quản lý workspace (đã bỏ groups)
 * Workspace structure:
 * - id: unique identifier
 * - name: workspace name
 * - description: workspace description
 * - systemPrompt: common prompt for all chats in workspace
 * - persona: AI personality for workspace
 * - settings: workspace-specific settings
 */
export function useWorkspace() {
  const [workspaces, setWorkspaces] = useLocalStorage('workspaces', []);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useLocalStorage('current_workspace_id', null);
  const [promptTemplates, setPromptTemplates] = useLocalStorage('prompt_templates', []);

  // Lấy workspace hiện tại
  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  // Tạo workspace mặc định nếu chưa có
  const initializeDefaultWorkspace = useCallback(() => {
    console.log('🏗️ initializeDefaultWorkspace called, workspaces.length:', workspaces.length);
    if (workspaces.length === 0) {
      const defaultWorkspace = {
        id: `workspace_${Date.now()}`,
        name: 'Default Workspace',
        description: 'Default workspace for testing',
        systemPrompt: '',
        persona: DEFAULT_PERSONAS.assistant,
        settings: {
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000,
          contextTokens: 4000
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🏗️ Creating default workspace:', defaultWorkspace);
      setWorkspaces([defaultWorkspace]);
      setCurrentWorkspaceId(defaultWorkspace.id);
      console.log('✅ Default workspace created:', defaultWorkspace);
    } else {
      console.log('✅ Workspaces already exist:', workspaces);
    }
  }, [workspaces, setWorkspaces, setCurrentWorkspaceId]);

  // Tạo workspace mới (simplified structure)
  const createWorkspace = useCallback((workspaceData) => {
    const newWorkspace = {
      id: `workspace_${Date.now()}`,
      name: workspaceData.name,
      description: workspaceData.description,
      systemPrompt: workspaceData.systemPrompt || '',
      persona: workspaceData.persona || DEFAULT_PERSONAS.assistant,
      settings: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        contextTokens: 4000
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWorkspaces(prev => [...prev, newWorkspace]);
    setCurrentWorkspaceId(newWorkspace.id);
    
    return newWorkspace;
  }, [setWorkspaces, setCurrentWorkspaceId]);

  // Cập nhật workspace
  const updateWorkspace = useCallback((workspaceId, updates) => {
    setWorkspaces(prev => prev.map(ws => 
      ws.id === workspaceId 
        ? { ...ws, ...updates, updatedAt: new Date().toISOString() }
        : ws
    ));
  }, [setWorkspaces]);

  // Xóa workspace
  const deleteWorkspace = useCallback((workspaceId) => {
    setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
    
    // Nếu xóa workspace hiện tại, chuyển sang workspace khác
    if (currentWorkspaceId === workspaceId) {
      const remainingWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
      setCurrentWorkspaceId(remainingWorkspaces.length > 0 ? remainingWorkspaces[0].id : null);
    }
  }, [setWorkspaces, currentWorkspaceId, workspaces, setCurrentWorkspaceId]);

  // Chọn workspace
  const selectWorkspace = useCallback((workspaceId) => {
    setCurrentWorkspaceId(workspaceId);
  }, [setCurrentWorkspaceId]);

  // Cập nhật system prompt của workspace
  const updateWorkspacePrompt = useCallback((workspaceId, systemPrompt) => {
    updateWorkspace(workspaceId, { systemPrompt });
  }, [updateWorkspace]);

  // Cập nhật persona của workspace
  const updateWorkspacePersona = useCallback((workspaceId, persona) => {
    updateWorkspace(workspaceId, { persona });
  }, [updateWorkspace]);

  // Cập nhật settings của workspace
  const updateWorkspaceSettings = useCallback((workspaceId, settings) => {
    updateWorkspace(workspaceId, { settings });
  }, [updateWorkspace]);

  // Prompt template management
  const createPromptTemplate = useCallback((templateData) => {
    const newTemplate = {
      id: `template_${Date.now()}`,
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPromptTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, [setPromptTemplates]);

  const updatePromptTemplate = useCallback((templateId, updates) => {
    setPromptTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, ...updates, updatedAt: new Date().toISOString() }
        : template
    ));
  }, [setPromptTemplates]);

  const deletePromptTemplate = useCallback((templateId) => {
    setPromptTemplates(prev => prev.filter(template => template.id !== templateId));
  }, [setPromptTemplates]);

  return {
    // Workspace data
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    
    // Workspace actions
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    updateWorkspacePrompt,
    updateWorkspacePersona,
    updateWorkspaceSettings,
    initializeDefaultWorkspace,
    
    // Prompt template actions
    promptTemplates,
    createPromptTemplate,
    updatePromptTemplate,
    deletePromptTemplate
  };
}
