// Main exports for the Thready package
export { threadPool } from './ThreadPool.js';
// Alias so users can `import thready from 'thready-js'` and call thready.init/execute
export { WorkerPool } from './WorkerPool.js';
export type {
  WorkerMessage, 
  WorkerResponse, 
  Task, 
  WorkerPoolConfig
} from './types.js';