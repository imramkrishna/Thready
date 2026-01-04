// Node.js Worker Script for Thready (using worker_threads)
// This demonstrates how to create a worker for Node.js environments

import { parentPort } from 'worker_threads';

if (!parentPort) {
  throw new Error('This script must be run as a worker thread');
}

parentPort.on('message', (message) => {
  const { id, taskType, payload } = message;

  try {
    let result;

    switch (taskType) {
      case 'fibonacci':
        result = fibonacci(payload);
        break;

      case 'factorial':
        result = factorial(payload);
        break;

      case 'primeCheck':
        result = isPrime(payload);
        break;

      case 'sort':
        result = bubbleSort([...payload]);
        break;

      case 'processArray':
        result = payload.map((x) => x * 2 + 1);
        break;

      case 'heavyCalculation':
        result = heavyCalculation(payload);
        break;

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }

    // Send result back to main thread
    parentPort.postMessage({
      id,
      type: 'result',
      payload: result,
    });
  } catch (error) {
    // Send error back to main thread
    parentPort.postMessage({
      id,
      type: 'error',
      payload: error.message,
    });
  }
});

// Task implementations

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

function heavyCalculation(iterations) {
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
  }
  return result;
}
