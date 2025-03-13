// This script will push the Prisma schema to the database
// Run with: node setup-db.mjs

import { execSync } from 'child_process';

console.log('Pushing Prisma schema to the database...');

try {
  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema to database
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('Database setup complete!');
} catch (error) {
  console.error('Error setting up database:', error);
  process.exit(1);
} 