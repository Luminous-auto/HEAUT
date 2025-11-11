import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ee6d310bf4120a9c91f52b", 
  requiresAuth: true // Ensure authentication is required for all operations
});
