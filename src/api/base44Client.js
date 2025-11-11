// Mock Base44 client for static landing page
// This prevents API calls that cause 404 errors
const createMockClient = () => {
  const mockAuth = {
    isAuthenticated: () => Promise.resolve(false),
    me: () => Promise.reject(new Error('Not authenticated')),
    updateMe: () => Promise.reject(new Error('Not authenticated')),
    logout: () => Promise.resolve(),
    redirectToLogin: () => {},
  };

  const createMockEntity = () => ({
    list: () => Promise.resolve([]),
    create: () => Promise.reject(new Error('Mock mode - static landing page')),
    get: () => Promise.reject(new Error('Mock mode - static landing page')),
    update: () => Promise.reject(new Error('Mock mode - static landing page')),
    delete: () => Promise.reject(new Error('Mock mode - static landing page')),
  });

  const mockEntities = {
    DiaryEntry: createMockEntity(),
    Survey: createMockEntity(),
    SurveyResponse: createMockEntity(),
    CreativeWork: createMockEntity(),
    PersonalAnalysis: createMockEntity(),
    CreativeAnalysis: createMockEntity(),
    TokenTransaction: createMockEntity(),
    SelfAwarenessAnalysis: createMockEntity(),
    SoulMateMatch: createMockEntity(),
  };

  const mockIntegrations = {
    Core: {
      InvokeLLM: () => Promise.reject(new Error('Mock mode - static landing page')),
      SendEmail: () => Promise.reject(new Error('Mock mode - static landing page')),
      UploadFile: () => Promise.reject(new Error('Mock mode - static landing page')),
      GenerateImage: () => Promise.reject(new Error('Mock mode - static landing page')),
      ExtractDataFromUploadedFile: () => Promise.reject(new Error('Mock mode - static landing page')),
      CreateFileSignedUrl: () => Promise.reject(new Error('Mock mode - static landing page')),
      UploadPrivateFile: () => Promise.reject(new Error('Mock mode - static landing page')),
    },
  };

  return {
    auth: mockAuth,
    entities: mockEntities,
    integrations: mockIntegrations,
  };
};

// Use mock client for static landing page
// Set to false to use real Base44 client (requires valid appId)
const USE_MOCK_CLIENT = true;

export const base44 = USE_MOCK_CLIENT 
  ? createMockClient()
  : (() => {
      try {
        const { createClient } = require('@base44/sdk');
        return createClient({
          appId: "68ee6d310bf4120a9c91f52b", 
          requiresAuth: false
        });
      } catch (error) {
        console.warn('Failed to create Base44 client, using mock:', error);
        return createMockClient();
      }
    })();
