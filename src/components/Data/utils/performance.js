import { debounce, throttle } from 'lodash';

/**
 * Chunk processor for handling large datasets
 * Processes data in chunks to avoid blocking the main thread
 */
export class ChunkProcessor {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 1000;
    this.delay = options.delay || 0;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || console.error;
  }

  /**
   * Process an array in chunks
   * @param {Array} array - Array to process
   * @param {Function} processor - Function to process each item
   * @returns {Promise} Resolves when all chunks are processed
   */
  async processArray(array, processor) {
    const chunks = this.createChunks(array);
    const results = [];
    let processedCount = 0;

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkResults = await this.processChunk(chunk, processor);
        results.push(...chunkResults);
        
        processedCount += chunk.length;
        const progress = (processedCount / array.length) * 100;
        this.onProgress(progress, processedCount, array.length);

        if (this.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      }

      this.onComplete(results);
      return results;
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }

  /**
   * Create chunks from an array
   * @param {Array} array - Array to chunk
   * @returns {Array} Array of chunks
   */
  createChunks(array) {
    const chunks = [];
    for (let i = 0; i < array.length; i += this.chunkSize) {
      chunks.push(array.slice(i, i + this.chunkSize));
    }
    return chunks;
  }

  /**
   * Process a single chunk
   * @param {Array} chunk - Chunk to process
   * @param {Function} processor - Function to process each item
   * @returns {Promise} Resolves with processed chunk
   */
  async processChunk(chunk, processor) {
    return Promise.all(chunk.map(processor));
  }
}

/**
 * Worker pool for parallel processing
 * Uses Web Workers for CPU-intensive tasks
 */
export class WorkerPool {
  constructor(workerScript, options = {}) {
    this.workerScript = workerScript;
    this.maxWorkers = options.maxWorkers || navigator.hardwareConcurrency || 4;
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = 0;
  }

  /**
   * Execute a task using a worker
   * @param {any} data - Data to process
   * @returns {Promise} Resolves with worker result
   */
  async execute(data) {
    return new Promise((resolve, reject) => {
      const task = { data, resolve, reject };

      if (this.activeWorkers < this.maxWorkers) {
        this.runTask(task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  /**
   * Run a task with a worker
   * @param {Object} task - Task to run
   */
  runTask(task) {
    const worker = this.getWorker();
    this.activeWorkers++;

    worker.onmessage = (e) => {
      this.activeWorkers--;
      task.resolve(e.data);
      this.processNextTask();
    };

    worker.onerror = (e) => {
      this.activeWorkers--;
      task.reject(e.error);
      this.processNextTask();
    };

    worker.postMessage(task.data);
  }

  /**
   * Get an available worker
   * @returns {Worker} Web Worker instance
   */
  getWorker() {
    if (this.workers.length < this.maxWorkers) {
      const worker = new Worker(this.workerScript);
      this.workers.push(worker);
      return worker;
    }
    return this.workers[this.activeWorkers % this.maxWorkers];
  }

  /**
   * Process next task in queue
   */
  processNextTask() {
    if (this.taskQueue.length > 0 && this.activeWorkers < this.maxWorkers) {
      const task = this.taskQueue.shift();
      this.runTask(task);
    }
  }

  /**
   * Terminate all workers
   */
  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.activeWorkers = 0;
    this.taskQueue = [];
  }
}

/**
 * Memory-efficient data structure for large datasets
 * Uses sparse arrays and lazy evaluation
 */
export class VirtualDataset {
  constructor(options = {}) {
    this.pageSize = options.pageSize || 100;
    this.maxPages = options.maxPages || 10;
    this.pages = new Map();
    this.totalItems = 0;
    this.fetchPage = options.fetchPage || (() => []);
  }

  /**
   * Get an item by index
   * @param {number} index - Item index
   * @returns {Promise} Resolves with requested item
   */
  async getItem(index) {
    const pageIndex = Math.floor(index / this.pageSize);
    const itemIndex = index % this.pageSize;

    await this.ensurePageLoaded(pageIndex);
    return this.pages.get(pageIndex)[itemIndex];
  }

  /**
   * Ensure a page is loaded
   * @param {number} pageIndex - Page index to load
   */
  async ensurePageLoaded(pageIndex) {
    if (!this.pages.has(pageIndex)) {
      const items = await this.fetchPage(pageIndex, this.pageSize);
      this.pages.set(pageIndex, items);

      // Remove old pages if we exceed maxPages
      if (this.pages.size > this.maxPages) {
        const oldestPage = Math.min(...this.pages.keys());
        this.pages.delete(oldestPage);
      }
    }
  }

  /**
   * Clear all cached pages
   */
  clear() {
    this.pages.clear();
  }
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Measure execution time of a function
   * @param {Function} fn - Function to measure
   * @param {string} label - Label for the measurement
   * @returns {Function} Wrapped function
   */
  measure: (fn, label) => {
    return (...args) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      console.log(`${label}: ${end - start}ms`);
      return result;
    };
  },

  /**
   * Create a debounced version of a function
   * @param {Function} fn - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: (fn, wait) => debounce(fn, wait),

  /**
   * Create a throttled version of a function
   * @param {Function} fn - Function to throttle
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Throttled function
   */
  throttle: (fn, wait) => throttle(fn, wait),
};
