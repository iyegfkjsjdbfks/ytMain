// Offline Storage - Minimal Implementation
export interface OfflineVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  downloadedAt: number;
}

export interface Subscription {
  channelId: string;
  channelName: string;
  subscribedAt: number;
}

export interface PendingUpload {
  id: string;
  title: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  createdAt: number;
}

export class OfflineStorage {
  private dbName = 'YouTubeOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('subscriptions')) {
          db.createObjectStore('subscriptions', { keyPath: 'channelId' });
        }
        
        if (!db.objectStoreNames.contains('pendingUploads')) {
          db.createObjectStore('pendingUploads', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  async saveVideo(video: OfflineVideo): Promise<void> {
    const store = await this.getStore('videos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(video);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getVideos(): Promise<OfflineVideo[]> {
    const store = await this.getStore('videos');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    const store = await this.getStore('videos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveSubscription(subscription: Subscription): Promise<void> {
    const store = await this.getStore('subscriptions', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(subscription);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const store = await this.getStore('subscriptions');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSubscription(channelId: string): Promise<void> {
    const store = await this.getStore('subscriptions', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(channelId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async savePendingUpload(upload: Omit<PendingUpload, 'id' | 'createdAt' | 'status'>): Promise<number> {
    const store = await this.getStore('pendingUploads', 'readwrite');
    return new Promise((resolve, reject) => {
      const uploadData = {
        ...upload,
        status: 'pending' as const,
        createdAt: Date.now()
      };
      const request = store.add(uploadData);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingUploads(): Promise<PendingUpload[]> {
    const store = await this.getStore('pendingUploads');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUploadStatus(id: number, status: 'pending' | 'uploading' | 'completed' | 'failed'): Promise<void> {
    const store = await this.getStore('pendingUploads', 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const upload = getRequest.result;
        if (upload) {
          upload.status = status;
          const putRequest = store.put(upload);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Upload not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deletePendingUpload(id: number): Promise<void> {
    const store = await this.getStore('pendingUploads', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffTime = Date.now() - maxAge;
    
    // Clean up old videos
    const videosStore = await this.getStore('videos', 'readwrite');
    const videosRequest = videosStore.openCursor();
    
    videosRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const video = cursor.value;
        if (video.downloadedAt < cutoffTime) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      } catch (error) {
        console.warn('Storage estimation failed:', error);
      }
    }
    return { used: 0, quota: 0 };
  }
}

export const offlineStorage = new OfflineStorage();

// Initialize on load
offlineStorage
  .init()
  .catch((error) => {
    console.error('Failed to initialize offline storage:', error);
  });

export const isOnline = (): boolean => navigator.onLine;

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
};

export const syncPendingActions = async (): Promise<void> => {
  if (!navigator.onLine) return;
  
  try {
    const pendingUploads = await offlineStorage.getPendingUploads();
    const pendingUploadsToProcess = pendingUploads.filter(upload => upload.status === 'pending');
    
    for (const upload of pendingUploadsToProcess) {
      try {
        await offlineStorage.updateUploadStatus(upload.id, 'uploading');
        // Actual upload logic would go here
        await offlineStorage.updateUploadStatus(upload.id, 'completed');
      } catch (error) {
        await offlineStorage.updateUploadStatus(upload.id, 'failed');
        console.error('Upload failed:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

window.addEventListener('online', () => {
  syncPendingActions().catch(console.error);
});