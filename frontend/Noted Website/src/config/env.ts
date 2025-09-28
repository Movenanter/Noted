// Environment configuration for Noted AI integrations (Vite style)

const V = (import.meta as any).env || {};

export const ENV = {
  // Backend API
  BACKEND_BASE: V.VITE_BACKEND_BASE || 'http://127.0.0.1:8020',
  API_BEARER_TOKEN: V.VITE_API_BEARER_TOKEN || 'devsecret123',

  // AI Service Configuration
  OPENAI_API_KEY: V.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
  ANTHROPIC_API_KEY: V.VITE_ANTHROPIC_API_KEY || 'YOUR_ANTHROPIC_API_KEY_HERE',
  
  // Mentra Live Glasses SDK Configuration  
  MENTRA_LIVE_API_KEY: V.VITE_MENTRA_LIVE_API_KEY || 'YOUR_MENTRA_LIVE_API_KEY_HERE',
  MENTRA_LIVE_DEVICE_ID: V.VITE_MENTRA_LIVE_DEVICE_ID || 'YOUR_DEVICE_ID_HERE',
  
  // Application Configuration
  NODE_ENV: V.MODE || 'development',
  API_BASE_URL: V.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Feature Flags
  ENABLE_AI_GENERATION: (V.VITE_ENABLE_AI_GENERATION ?? 'true') !== 'false',
  ENABLE_MENTRA_LIVE_SYNC: (V.VITE_ENABLE_MENTRA_LIVE ?? 'true') !== 'false',
  ENABLE_COLLABORATION: (V.VITE_ENABLE_COLLABORATION ?? 'true') !== 'false',
};

// Validation
export function validateEnvironment() {
  const requiredKeys = [
    'BACKEND_BASE',
    'API_BEARER_TOKEN',
  ];
  
  const missing = requiredKeys.filter(key => 
    ENV[key as keyof typeof ENV] === `YOUR_${key}_HERE`
  );
  
  if (missing.length > 0 && ENV.NODE_ENV === 'production') {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
}