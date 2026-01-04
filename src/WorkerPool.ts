import type{ WorkerMessage, WorkerResponse,Task,WorkerPoolConfig } from './types.js';

// ============================================================================
// WORKER SCRIPT (worker.ts)
// This runs in a separate thread - keep it framework-agnostic
// ============================================================================
// Worker message types
// ============================================================================
// WORKER POOL MANAGER (main thread)
// ============================================================================

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Task[] = [];
  private activeTasks: Map<string, Task> = new Map();
  private workerTaskMap: Map<Worker, string> = new Map();
  private maxWorkers: number;
  private workerScript: string | (() => Worker);

  constructor(config: WorkerPoolConfig) {
    this.maxWorkers = config.maxWorkers || navigator.hardwareConcurrency || 4;
    this.workerScript = config.workerScript;
    this.initialize();
  }

  private initialize(): void {
    // Create initial pool of workers
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): Worker {
    let worker: Worker;

    if (typeof this.workerScript === 'function') {
      worker = this.workerScript();
    } else {
      worker = new Worker(this.workerScript);
    }

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleWorkerMessage(worker, event.data);
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.handleWorkerError(worker, error);
    };

    this.workers.push(worker);
    this.availableWorkers.push(worker);

    return worker;
  }

  private handleWorkerMessage(worker: Worker, response: WorkerResponse): void {
    const taskId = response.id;
    const task = this.activeTasks.get(taskId);

    if (!task) return;

    if (response.type === 'result') {
      task.resolve(response.payload);
      this.activeTasks.delete(taskId);
      this.workerTaskMap.delete(worker);
      this.returnWorkerToPool(worker);
    } else if (response.type === 'error') {
      task.reject(new Error(response.payload));
      this.activeTasks.delete(taskId);
      this.workerTaskMap.delete(worker);
      this.returnWorkerToPool(worker);
    }
  }

  private handleWorkerError(worker: Worker, error: ErrorEvent): void {
    const taskId = this.workerTaskMap.get(worker);
    if (taskId) {
      const task = this.activeTasks.get(taskId);
      if (task) {
        task.reject(new Error(error.message));
        this.activeTasks.delete(taskId);
      }
    }
    
    // Remove dead worker and create new one
    const index = this.workers.indexOf(worker);
    if (index > -1) {
      this.workers.splice(index, 1);
    }
    const availIndex = this.availableWorkers.indexOf(worker);
    if (availIndex > -1) {
      this.availableWorkers.splice(availIndex, 1);
    }
    
    worker.terminate();
    this.createWorker();
  }

  private returnWorkerToPool(worker: Worker): void {
    this.availableWorkers.push(worker);
    this.processQueue();
  }

  private processQueue(): void {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.availableWorkers.shift()!;
      this.executeTask(worker, task);
    }
  }

  private executeTask(worker: Worker, task: Task): void {
    this.activeTasks.set(task.id, task);
    this.workerTaskMap.set(worker, task.id);

    const message: WorkerMessage = {
      id: task.id,
      type: 'task',
      taskType: task.type,
      payload: task.payload
    };

    if (task.transferables && task.transferables.length > 0) {
      worker.postMessage(message, task.transferables);
    } else {
      worker.postMessage(message);
    }
  }

  public async run<T = any>(
    taskType: string,
    payload: any,
    transferables?: Transferable[]
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: Task<T> = {
        id: `task_${Date.now()}_${Math.random()}`,
        type: taskType,
        payload,
        resolve,
        reject,
        transferables
      };

      if (this.availableWorkers.length > 0) {
        const worker = this.availableWorkers.shift()!;
        this.executeTask(worker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  public getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length
    };
  }

  public terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.activeTasks.clear();
    this.workerTaskMap.clear();
  }
}



// ============================================================================
// USAGE EXAMPLES FOR DIFFERENT FRAMEWORKS
// ============================================================================

// EXAMPLE 1: Vanilla JavaScript
/*
import { threadPool } from './threadPool';

// Initialize with worker script path
threadPool.init({
  maxWorkers: 4,
  workerScript: './worker.js'
});

// Execute tasks
async function heavyCalculation() {
  const result = await threadPool.execute('fibonacci', 40);
  console.log('Fibonacci result:', result);
}

// With transferables (zero-copy)
async function processImageData(imageData) {
  const pixels = imageData.data;
  const result = await threadPool.execute(
    'processImage',
    pixels,
    [pixels.buffer] // Transfer ownership
  );
  console.log('Processed pixels:', result);
}
*/

// EXAMPLE 2: React
/*
import { threadPool } from './threadPool';
import { useEffect, useState } from 'react';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize on mount
    threadPool.init({
      maxWorkers: 4,
      workerScript: '/worker.js'
    });

    // Cleanup on unmount
    return () => threadPool.shutdown();
  }, []);

  const handleHeavyTask = async () => {
    setLoading(true);
    try {
      const data = await threadPool.execute('processLargeArray', 
        Array.from({ length: 1000000 }, (_, i) => i)
      );
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleHeavyTask} disabled={loading}>
        Run Heavy Task
      </button>
      {loading && <p>Processing...</p>}
      {result && <p>Result length: {result.length}</p>}
    </div>
  );
}
*/

// EXAMPLE 3: Vue 3
/*
import { threadPool } from './threadPool';
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const result = ref(null);
    const loading = ref(false);

    onMounted(() => {
      threadPool.init({
        maxWorkers: 4,
        workerScript: '/worker.js'
      });
    });

    onUnmounted(() => {
      threadPool.shutdown();
    });

    const runTask = async () => {
      loading.value = true;
      try {
        result.value = await threadPool.execute('fibonacci', 35);
      } finally {
        loading.value = false;
      }
    };

    return { result, loading, runTask };
  }
};
*/

// EXAMPLE 4: Angular
/*
import { threadPool } from './threadPool';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="runTask()" [disabled]="loading">Run Task</button>
    <p *ngIf="loading">Processing...</p>
    <p *ngIf="result">Result: {{ result }}</p>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  result: any = null;
  loading = false;

  ngOnInit() {
    threadPool.init({
      maxWorkers: 4,
      workerScript: './worker.js'
    });
  }

  ngOnDestroy() {
    threadPool.shutdown();
  }

  async runTask() {
    this.loading = true;
    try {
      this.result = await threadPool.execute('fibonacci', 35);
    } finally {
      this.loading = false;
    }
  }
}
*/

// EXAMPLE 5: Svelte
/*
<script>
  import { threadPool } from './threadPool';
  import { onMount, onDestroy } from 'svelte';
  
  let result = null;
  let loading = false;

  onMount(() => {
    threadPool.init({
      maxWorkers: 4,
      workerScript: '/worker.js'
    });
  });

  onDestroy(() => {
    threadPool.shutdown();
  });

  async function runTask() {
    loading = true;
    try {
      result = await threadPool.execute('fibonacci', 35);
    } finally {
      loading = false;
    }
  }
</script>

<button on:click={runTask} disabled={loading}>Run Task</button>
{#if loading}<p>Processing...</p>{/if}
{#if result}<p>Result: {result}</p>{/if}
*/