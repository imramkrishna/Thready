// Main exports for the Thready package
import { threadPool } from './ThreadPool.js';

export { threadPool } from './ThreadPool.js';
export { WorkerPool } from './WorkerPool.js';
export type {
  WorkerMessage, 
  WorkerResponse, 
  Task, 
  WorkerPoolConfig
} from './types.js';

// Default export for convenience: import thready from 'thready-js'
export default threadPool;