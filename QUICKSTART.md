# 🚀 Quick Start Guide - Thready

Get started with Thready in under 2 minutes!

## Install

```bash
npm install thready-js
```

## 3-Step Setup

### Step 1: Generate Templates

```bash
npx thready init
```

This creates a `thready-js/` folder with:
- `thready.config.js` - Pre-configured thready instance
- `thready.worker.mjs` - Node.js worker template  
- `thready.worker.js` - Browser worker template

### Step 2: Add Your Task Handlers

Edit `thready-js/thready.worker.mjs` (or `.js` for browser):

```javascript
// thready-js/thready.worker.mjs
import { parentPort } from 'worker_threads';

parentPort.on('message', (message) => {
  const { id, taskType, payload } = message;
  
  try {
    let result;
    
    // Add your custom handlers
    switch (taskType) {
      case 'fibonacci':
        result = fibonacci(payload);
        break;
      default:
        throw new Error(`Unknown task: ${taskType}`);
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
```

### Step 3: Use It!

```javascript
import thready from './thready-js/thready.config.js';

async function calculate() {
  const result = await thready.execute('fibonacci', 40);
  console.log('Result:', result);
}

calculate();
```

That's it! No manual initialization needed.

## Common Use Cases

### Parallel Processing

```javascript
import thready from './thready-js/thready.config.js';

const tasks = [30, 32, 34, 36, 38].map(n => 
  thready.execute('fibonacci', n)
);
const results = await Promise.all(tasks);
```

### With React

```jsx
import thready from './thready-js/thready.config.js';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    return () => thready.shutdown();
  }, []);
  
  const handleClick = async () => {
    const result = await thready.execute('fibonacci', 40);
    console.log(result);
  };
  
  return <button onClick={handleClick}>Calculate</button>;
}
```

### Customize Configuration

Edit `thready-js/thready.config.js` to adjust worker count:

```javascript
thready.init({
  maxWorkers: 8, // Increase workers
  worker: () => new Worker(join(__dirname, './thready.worker.mjs'))
});
```

## API

```javascript
// Import pre-configured instance
import thready from './thready-js/thready.config.js';

// Execute task
await thready.execute(taskType, payload, transferables?);

// Get statistics
const stats = thready.getStats();

// Cleanup
thready.shutdown();
```

## Need More?

See [README.md](README.md) for full documentation.

Happy threading! 🧵
