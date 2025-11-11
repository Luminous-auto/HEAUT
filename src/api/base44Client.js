// Mock Base44 client for static landing page
// This prevents API calls that cause 404 errors
// IMPORTANT: For static landing page, we use mock client to avoid loading Base44 SDK
const createMockClient = () => {
  // Demo user data for static landing page display
  const demoUser = {
    id: 'demo-user-123',
    email: 'demo@heaut.app',
    username: 'Demo User',
    language: 'en',
    tokens: 100,
    ai_access_authorized: false,
    is_helper: false,
    helper_roles: [],
    helper_bio: '',
    helper_availability: false,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  };

  const mockAuth = {
    isAuthenticated: async () => {
      // Return false for static display (no real auth)
      // But we'll still provide demo user data for UI display
      return false;
    },
    me: async () => {
      // Return demo user for static landing page display
      // This allows pages to render properly without real authentication
      return demoUser;
    },
    updateMe: async () => {
      // Silently fail in mock mode
      return demoUser;
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
