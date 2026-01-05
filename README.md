# 🧵 Thready

A lightweight, type-safe thread pool implementation for JavaScript and TypeScript that enables true multithreading using Web Workers.

> **Note:** Thready is a worker pool manager only. You provide your own worker script with your custom logic.

[![npm version](https://img.shields.io/npm/v/thready.svg)](https://www.npmjs.com/package/thready)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- ✨ **Simple API** - Easy to use singleton pattern for quick integration
- 🔄 **Worker Pooling** - Efficiently reuses worker threads instead of creating new ones
- 📦 **Zero Dependencies** - No external dependencies, just pure JavaScript
- 💪 **TypeScript Support** - Full type definitions included
- ⚡ **Performance** - Supports transferable objects for zero-copy data transfer
- 🎯 **Smart Queue Management** - Automatically manages task queuing and load balancing
- 🔍 **Statistics** - Built-in monitoring of pool state and performance
- 🎨 **Bring Your Own Worker** - You write the worker logic, we handle the pooling

## Installation

```bash
npm install thready-js
```

or with yarn:

```bash
yarn add thready-js
```

## Quick Start

### 1. Initialize Thready in Your Project

Run the following command to generate configuration and worker template files:

```bash
npx thready init
```

This creates a `thready-js/` folder with:
- `thready.config.js` - Pre-configured thready instance
- `thready.worker.mjs` - Node.js worker template
- `thready.worker.js` - Browser worker template

### 2. Customize Your Worker

Edit `thready-js/thready.worker.mjs` (or `.js` for browser) to add your custom task handlers:

```javascript
// thready-js/thready.worker.mjs
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
      case 'fibonacci':
        result = fibonacci(payload);
        break;
      case 'processData':
        result = processData(payload);
        break;
      default:
        throw new Error(\`Unknown task type: \${taskType}\`);
    }
    
    parentPort.postMessage({ id, type: 'result', payload: result });
  } catch (error) {
    parentPort.postMessage({ id, type: 'error', payload: error.message });
  }
});

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function processData(data) {
  // Your heavy computation here
  return data.map(x => x * 2);
}
```

### 3. Use Thready in Your Application

Simply import the pre-configured instance and start executing tasks:

```javascript
import thready from './thready-js/thready.config.js';

// Execute tasks - thready is already initialized!
async function calculate() {
  try {
    const result = await thready.execute('fibonacci', 40);
    console.log('Result:', result);
  } catch (error) {
    console.error('Task failed:', error);
  }
}

// Cleanup on shutdown
process.on('SIGINT', () => {
  thready.shutdown();
  process.exit(0);
});
```

That's it! No manual initialization needed - just import and use.

## Advanced Usage

### Customizing Configuration

Edit `thready-js/thready.config.js` to customize worker count or worker path:

```javascript
// thready-js/thready.config.js
import thready from 'thready-js';
import { Worker } from 'worker_threads';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize with custom settings
thready.init({
  maxWorkers: 8, // Increase worker count
  worker: () => new Worker(join(__dirname, './thready.worker.mjs'), { type: 'module' }),
});

export default thready;
```

### Using with Vite or Webpack

For browser environments, update the config to use Web Workers:

```javascript
// thready-js/thready.config.js
import thready from 'thready-js';

// Vite/Webpack
thready.init({
  maxWorkers: 4,
  worker: () => new Worker(new URL('./thready.worker.js', import.meta.url), { type: 'module' })
});

export default thready;
```

### Transferable Objects (Zero-Copy)

For better performance with large data, use transferables:

```javascript
import thready from './thready-js/thready.config.js';

async function processImage(imageData) {
  const buffer = imageData.buffer;
  
  // Transfer ownership of the buffer (zero-copy)
  const result = await thready.execute(
    'processImage',
    buffer,
    [buffer] // Transferables array
  );
  
  return result;
}
```

### Direct API Usage (Advanced)

If you prefer manual control, you can import `threadPool` directly:

```javascript
import { threadPool } from 'thready-js';
import { Worker } from 'worker_threads';

// Manual initialization
threadPool.init({
  maxWorkers: 4,
  worker: () => new Worker('./custom-worker.mjs')
});

const result = await threadPool.execute('taskType', payload);
```

```javascript
import { WorkerPool } from 'thready';
### Using WorkerPool Directly

For even more control, use the `WorkerPool` class:

```javascript
import { WorkerPool } from 'thready-js';
import { Worker } from 'worker_threads';

const pool = new WorkerPool({
  maxWorkers: 8,
  worker: () => new Worker('./worker.mjs')
});

const result = await pool.run('taskType', payload);

// Get statistics
const stats = pool.getStats();
console.log(stats);
// {
//   totalWorkers: 8,
//   availableWorkers: 6,
//   activeTasks: 2,
//   queuedTasks: 0
// }

// Cleanup
pool.terminate();
```

### Monitoring Pool Statistics

```javascript
import thready from './thready-js/thready.config.js';

const stats = thready.getStats();
console.log('Pool status:', stats);
// {
//   totalWorkers: 4,
//   availableWorkers: 2,
//   activeTasks: 2,
//   queuedTasks: 5
// }
```

## Framework Examples

### React

```jsx
import thready from './thready-js/thready.config.js';
import { useEffect, useState } from 'react';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => thready.shutdown();
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await thready.execute('fibonacci', 40);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleCalculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Fibonacci'}
      </button>
      {result && <p>Result: {result}</p>}
    </div>
  );
}
```

### Node.js with Worker Threads

The generated `thready-js/thready.worker.mjs` is already set up for Node.js worker_threads. Just add your task handlers and use it:

```javascript
// index.js
import thready from './thready-js/thready.config.js';

async function main() {
  const result = await thready.execute('fibonacci', 35);
  console.log('Result:', result);
  
  thready.shutdown();
}

main();
```

## API Reference

### CLI Commands

- **`npx thready init`** - Generate configuration and worker template files in `thready-js/` folder

### `thready` (Default Export)

The pre-configured singleton instance from `thready-js/thready.config.js`.

#### Methods

- **`execute<T>(taskType: string, payload: any, transferables?: Transferable[]): Promise<T>`**
  
  Executes a task on the thread pool.
  
  - `taskType`: Identifier for the type of work
  - `payload`: Data to be processed
  - `transferables` (optional): Array of transferable objects
  - Returns: Promise resolving to the result

- **`getStats(): object | null`**
  
  Returns current pool statistics.

- **`shutdown(): void`**
  
  Terminates all workers and releases resources.

### `threadPool` (Named Export - Advanced)

The singleton instance for manual initialization.

#### Methods

- **`init(config: WorkerPoolConfig): void`**
  
  Initializes the thread pool with your worker implementation.
  
  - `config.maxWorkers` (optional): Maximum number of workers (defaults to CPU cores)
  - `config.worker`: Path to worker script or factory function that returns a Worker

- **`execute<T>(taskType: string, payload: any, transferables?: Transferable[]): Promise<T>`**
- **`getStats(): object | null`**
- **`shutdown(): void`**

### `WorkerPool`

The underlying pool implementation for direct usage.

#### Constructor

```typescript
new WorkerPool(config: WorkerPoolConfig)
```

#### Methods

- **`run<T>(taskType: string, payload: any, transferables?: Transferable[]): Promise<T>`**
- **`getStats(): object`**
- **`terminate(): void`**

## TypeScript

Full TypeScript support with exported types:

```typescript
import thready from './thready-js/thready.config.js';
import type { 
  WorkerPoolConfig,
  WorkerMessage,
  WorkerResponse,
  Task
} from 'thready-js';

// Custom typed execution
interface CalculationResult {
  value: number;
  duration: number;
}

const result = await thready.execute<CalculationResult>('calculate', { n: 100 });
```

## Best Practices

1. **Run `npx thready init`**: Start with generated templates for quick setup
2. **Customize Workers**: Edit `thready-js/thready.worker.mjs` (or `.js`) with your task handlers
3. **Import Config**: Use `import thready from './thready-js/thready.config.js'` - already initialized
4. **Cleanup**: Always call `thready.shutdown()` when your application closes
5. **Transferables**: Use transferables for large data (ArrayBuffers, ImageData) to avoid copying
6. **Error Handling**: Always wrap `execute()` calls in try-catch blocks
7. **Task Granularity**: Break large tasks into smaller chunks for better load balancing

## Performance Tips

- Use transferables for data > 1MB
- Adjust `maxWorkers` in `thready-js/thready.config.js` to match your workload
- Monitor stats with `thready.getStats()` to tune pool size
- Reuse the same worker script for multiple task types
- Keep worker scripts focused and pure

## Browser Support

Works in all modern browsers that support Web Workers:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)

## License

ISC © Ram Krishna Yadav

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

Found a bug or have a feature request? [Open an issue](https://github.com/imramkrishna/Thready/issues)

## Links

- [GitHub Repository](https://github.com/imramkrishna/Thready)
- [npm Package](https://www.npmjs.com/package/thready)
