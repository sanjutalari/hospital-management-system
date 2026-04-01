// ============================================================
// Environment Variable Validator
// ============================================================

export function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const optional = ['OPENAI_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Copy .env.example to .env and fill in the values');
    process.exit(1);
  }

  // Check optional but recommended variables
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  // Validate JWT secrets are strong enough
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    console.warn('⚠️  JWT_REFRESH_SECRET should be at least 32 characters long');
  }

  // Cloudinary warnings
  const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const hasCloudinary = cloudinaryVars.every(key => process.env[key]);
  
  if (!hasCloudinary) {
    const missingCloudinary = cloudinaryVars.filter(key => !process.env[key]);
    if (missingCloudinary.length > 0 && missingCloudinary.length < 3) {
      console.warn('⚠️  Partial Cloudinary configuration detected. All three variables required:');
      missingCloudinary.forEach(key => console.warn(`   - ${key}`));
    }
  }

  // Check for demo/default values in production
  if (process.env.NODE_ENV === 'production') {
    const demoValues = {
      'JWT_SECRET': 'super_secret_jwt_key',
      'JWT_REFRESH_SECRET': 'super_secret_refresh_key',
      'CLOUDINARY_CLOUD_NAME': 'demo',
      'CLOUDINARY_API_KEY': 'demo',
      'CLOUDINARY_API_SECRET': 'demo',
    };

    for (const [key, demoValue] of Object.entries(demoValues)) {
      if (process.env[key] === demoValue) {
        console.error(`❌ SECURITY RISK: ${key} is using demo/default value in production!`);
        process.exit(1);
      }
    }
  }

  // Success message
  console.log('✅ Environment variables validated');
  
  if (warnings.length > 0) {
    console.log('ℹ️  Optional features not configured:');
    if (warnings.includes('OPENAI_API_KEY')) {
      console.log('   - AI Assistant: Using mock responses (set OPENAI_API_KEY for real AI)');
    }
    if (cloudinaryVars.some(key => warnings.includes(key))) {
      console.log('   - File Upload: Cloudinary not fully configured');
    }
  }
}
