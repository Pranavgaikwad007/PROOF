import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 PROOF Backend Service running on port ${config.PORT}`);
  console.log(`📡 URL: http://localhost:${config.PORT}`);
  console.log(`🌐 Health check: http://localhost:${config.PORT}/api/health`);
  console.log(`📋 Environment: ${config.NODE_ENV}`);
  console.log(`🔒 Allowed CORS Origins: ${config.CORS_ORIGIN}`);
  console.log(`🤖 AI Coach: ${config.OPENAI_API_KEY ? 'OpenAI Live' : 'Built-in Mock Coach'}`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
