/**
 * SYNC QUEUE SERVICE - POLÍTICA E FILA DE SINCRONIZAÇÃO OFFLINE
 * Garante que alterações realizadas em modo offline ou durante oscilações de rede
 * sejam enfileiradas de forma segura e sincronizadas na ordem cronológica (FIFO)
 * assim que a conexão com o Supabase for restabelecida.
 */

export interface SyncQueueItem {
  id: string;
  action: 'UPSERT_PATIENT' | 'DELETE_PATIENT' | 'INSERT_AUDIT';
  entityId: string;
  payload: any;
  timestamp: string;
  retries: number;
}

const SYNC_QUEUE_KEY = 'micrologos_offline_sync_queue_v1';

class SyncQueueService {
  private inMemoryQueue: SyncQueueItem[] = [];
  private isProcessing = false;
  private listeners: Array<(count: number, isOnline: boolean) => void> = [];

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  private loadQueue(): void {
    try {
      const data = sessionStorage.getItem(SYNC_QUEUE_KEY);
      if (data) {
        this.inMemoryQueue = JSON.parse(data);
      }
    } catch {
      this.inMemoryQueue = [];
    }
  }

  private saveQueue(): void {
    try {
      sessionStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.inMemoryQueue));
    } catch {}
    this.notifyListeners();
  }

  public subscribe(callback: (count: number, isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    callback(this.inMemoryQueue.length, this.isOnline());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(): void {
    const count = this.inMemoryQueue.length;
    const online = this.isOnline();
    this.listeners.forEach((cb) => {
      try {
        cb(count, online);
      } catch {}
    });
  }

  private handleNetworkChange(isOnline: boolean): void {
    this.notifyListeners();
  }

  public enqueue(
    action: SyncQueueItem['action'],
    entityId: string,
    payload: any
  ): SyncQueueItem {
    const item: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      entityId,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    // If an existing pending action on the same entity exists, update or replace it
    const existingIndex = this.inMemoryQueue.findIndex(
      (q) => q.entityId === entityId && q.action === action
    );
    if (existingIndex >= 0) {
      this.inMemoryQueue[existingIndex] = item;
    } else {
      this.inMemoryQueue.push(item);
    }

    this.saveQueue();
    return item;
  }

  public getPendingCount(): number {
    return this.inMemoryQueue.length;
  }

  public getQueue(): SyncQueueItem[] {
    return [...this.inMemoryQueue];
  }

  public async flush(
    handlers: {
      onUpsertPatient: (patient: any) => Promise<boolean>;
      onDeletePatient: (id: string) => Promise<boolean>;
      onInsertAudit: (log: any) => Promise<boolean>;
    }
  ): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing || this.inMemoryQueue.length === 0 || !this.isOnline()) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    const remainingItems: SyncQueueItem[] = [];

    for (const item of this.inMemoryQueue) {
      let success = false;
      try {
        if (item.action === 'UPSERT_PATIENT') {
          success = await handlers.onUpsertPatient(item.payload);
        } else if (item.action === 'DELETE_PATIENT') {
          success = await handlers.onDeletePatient(item.entityId);
        } else if (item.action === 'INSERT_AUDIT') {
          success = await handlers.onInsertAudit(item.payload);
        }
      } catch (e) {
        success = false;
      }

      if (success) {
        processed++;
      } else {
        item.retries += 1;
        if (item.retries < 5) {
          remainingItems.push(item);
        } else {
          console.error(`Descartando item da fila após 5 tentativas: ${item.action} (${item.entityId})`);
        }
        failed++;
      }
    }

    this.inMemoryQueue = remainingItems;
    this.saveQueue();
    this.isProcessing = false;

    return { processed, failed };
  }

  public clear(): void {
    this.inMemoryQueue = [];
    this.saveQueue();
  }
}

export const syncQueueService = new SyncQueueService();
