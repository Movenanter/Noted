// Environment configuration for Noted AI integrations

export const ENV = {
  // AI Service Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'YOUR_ANTHROPIC_API_KEY_HERE',
  
  // Mentra Live Glasses SDK Configuration  
  MENTRA_LIVE_API_KEY: process.env.MENTRA_LIVE_API_KEY || 'YOUR_MENTRA_LIVE_API_KEY_HERE',
  MENTRA_LIVE_DEVICE_ID: process.env.MENTRA_LIVE_DEVICE_ID || 'YOUR_DEVICE_ID_HERE',
  
  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  
  // Feature Flags
  ENABLE_AI_GENERATION: process.env.ENABLE_AI_GENERATION !== 'false',
  ENABLE_MENTRA_LIVE_SYNC: process.env.ENABLE_MENTRA_LIVE_SYNC !== 'false',
  ENABLE_COLLABORATION: process.env.ENABLE_COLLABORATION !== 'false',
};

// Validation
export function validateEnvironment() {
  const requiredKeys = [
    'OPENAI_API_KEY',
    'MENTRA_LIVE_API_KEY'
  ];
  
  const missing = requiredKeys.filter(key => 
    ENV[key as keyof typeof ENV] === `YOUR_${key}_HERE`
  );
  
  if (missing.length > 0 && ENV.NODE_ENV === 'production') {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
}