import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const browserWorkerTemplate = `// Thready Browser Worker
self.onmessage = function(event) {
  const { id, taskType, payload } = event.data;
  
  try {
    let result;
    
    // Add your custom task handlers here
    switch (taskType) {
      case 'example':
        result = payload * 2;
        break;
      default:
        throw new Error(\`Unknown task type: \${taskType}\`);
    }
    
    self.postMessage({ id, type: 'result', payload: result });
  } catch (error) {
    self.postMessage({ id, type: 'error', payload: error.message });
  }
};
`;

const nodeWorkerTemplate = `// Thready Node.js Worker
import { parentPort } from 'worker_threads';

if (!parentPort) {
  throw new Error('This script must be run as a worker thread');
}

parentPort.on('message', (message) => {
  const { id, taskType, payload } = message;
  
  try {
    let result;
    
    // Add your custom task handlers here
    switch (taskType) {
      case 'example':
        result = payload * 2;
        break;
      default:
        throw new Error(\`Unknown task type: \${taskType}\`);
    }
    
    parentPort.postMessage({ id, type: 'result', payload: result });
  } catch (error) {
    parentPort.postMessage({ id, type: 'error', payload: error.message });
  }
});
`;

const configTemplate = `// Thready Configuration
import thready from 'thready-js';
import { Worker } from 'worker_threads';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize thready with your configuration
thready.init({
  maxWorkers: 4,
  worker: () => new Worker(join(__dirname, './thready.worker.mjs'), { type: 'module' }),
});

// Export for use in your application
export default thready;
`;

export function init() {
  const cwd = process.cwd();
  const threadyDir = join(cwd, 'thready-js');
  
  // Create thready-js directory if it doesn't exist
  if (!existsSync(threadyDir)) {
    mkdirSync(threadyDir, { recursive: true });
  }
  
  // Create thready.config.js
  const configPath = join(threadyDir, 'thready.config.js');
  if (!existsSync(configPath)) {
    writeFileSync(configPath, configTemplate);
    console.log('✓ Created thready-js/thready.config.js');
  } else {
    console.log('⚠ thready-js/thready.config.js already exists, skipping...');
  }
  
  // Create browser worker
  const browserWorkerPath = join(threadyDir, 'thready.worker.js');
  if (!existsSync(browserWorkerPath)) {
    writeFileSync(browserWorkerPath, browserWorkerTemplate);
    console.log('✓ Created thready-js/thready.worker.js (browser)');
  }
  
  // Create node worker
  const nodeWorkerPath = join(threadyDir, 'thready.worker.mjs');
  if (!existsSync(nodeWorkerPath)) {
    writeFileSync(nodeWorkerPath, nodeWorkerTemplate);
    console.log('✓ Created thready-js/thready.worker.mjs (node)');
  }
  
  console.log('\n🎉 Thready initialized successfully!');
  console.log('\nNext steps:');
  console.log('  1. Edit thready-js/thready.config.js to configure your thread pool');
  console.log('  2. Add your task handlers in thready-js/thready.worker.mjs');
  console.log('  3. Import and use: import thready from "./thready-js/thready.config.js"\n');
}