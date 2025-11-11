// Mock Base44 client for static landing page
// This prevents API calls that cause 404 errors
// IMPORTANT: For static landing page, we use mock client to avoid loading Base44 SDK
const createMockClient = () => {
  const mockAuth = {
    isAuthenticated: async () => {
      // Return false immediately without any API calls
      return false;
    },
    me: async () => {
      throw new Error('Not authenticated - mock mode');
    },
    updateMe: async () => {
      throw new Error('Not authenticated - mock mode');
    },
    logout: async () => {
      // Do nothing
    },
    redirectToLogin: () => {
      // Do nothing - prevent redirects
    },
  };

  const createMockEntity = () => ({
    list: async () => [],
    create: async () => {
      throw new Error('Mock mode - static landing page');
    },
    get: async () => {
      throw new Error('Mock mode - static landing page');
    },
    update: async () => {
      throw new Error('Mock mode - static landing page');
    },
    delete: async () => {
      throw new Error('Mock mode - static landing page');
    },
    filter: async () => [],
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
    User: createMockEntity(),
  };

  const mockIntegrations = {
    Core: {
      InvokeLLM: async () => {
        throw new Error('Mock mode - static landing page');
      },
      SendEmail: async () => {
        throw new Error('Mock mode - static landing page');
      },
      UploadFile: async () => {
        throw new Error('Mock mode - static landing page');
      },
      GenerateImage: async () => {
        throw new Error('Mock mode - static landing page');
      },
      ExtractDataFromUploadedFile: async () => {
        throw new Error('Mock mode - static landing page');
      },
      CreateFileSignedUrl: async () => {
        throw new Error('Mock mode - static landing page');
      },
      UploadPrivateFile: async () => {
        throw new Error('Mock mode - static landing page');
      },
    },
  };

  return {
    auth: mockAuth,
    entities: mockEntities,
    integrations: mockIntegrations,
  };
};

// Always use mock client for static landing page deployment
// This completely avoids loading the Base44 SDK and making any API calls
export const base44 = createMockClient();
