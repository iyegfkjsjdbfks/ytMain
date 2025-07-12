// Offline Storage Utilities for PWA functionality

// IndexedDB wrapper for offline data storage
class OfflineStorage {
  private dbName = 'youtubex-offline';
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

        // Videos store
        if (!db.objectStoreNames.contains('videos')) {
          const videosStore = db.createObjectStore('videos', { keyPath: 'id' });
          videosStore.createIndex('uploadDate', 'uploadDate', { unique: false });
          videosStore.createIndex('channelId', 'channelId', { unique: false });
        }

        // User actions store (likes, comments, etc.)
        if (!db.objectStoreNames.contains('userActions')) {
          const actionsStore = db.createObjectStore('userActions', { keyPath: 'id', autoIncrement: true });
          actionsStore.createIndex('type', 'type', { unique: false });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Watch history store
        if (!db.objectStoreNames.contains('watchHistory')) {
          const historyStore = db.createObjectStore('watchHistory', { keyPath: 'id' });
          historyStore.createIndex('watchedAt', 'watchedAt', { unique: false });
        }

        // Playlists store
        if (!db.objectStoreNames.contains('playlists')) {
          const playlistsStore = db.createObjectStore('playlists', { keyPath: 'id' });
          playlistsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Subscriptions store
        if (!db.objectStoreNames.contains('subscriptions')) {
          const subscriptionsStore = db.createObjectStore('subscriptions', { keyPath: 'channelId' });
          subscriptionsStore.createIndex('subscribedAt', 'subscribedAt', { unique: false });
        }

        // Pending uploads store
        if (!db.objectStoreNames.contains('pendingUploads')) {
          const uploadsStore = db.createObjectStore('pendingUploads', { keyPath: 'id', autoIncrement: true });
          uploadsStore.createIndex('createdAt', 'createdAt', { unique: false });
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

  // Video operations
  async saveVideo(video: any): Promise<void> {
    const store = await this.getStore('videos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ ...video, cachedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getVideo(id: string): Promise<any | null> {
    const store = await this.getStore('videos');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllVideos(): Promise<any[]> {
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

  // User actions operations (for background sync)
  async saveUserAction(action: {
    type: 'like' | 'dislike' | 'comment' | 'subscribe' | 'unsubscribe';
    videoId?: string;
    channelId?: string;
    data: any;
    endpoint: string;
    method: string;
  }): Promise<void> {
    const store = await this.getStore('userActions', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...action,
        timestamp: Date.now(),
        synced: false,
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions(): Promise<any[]> {
    const store = await this.getStore('userActions');
    return new Promise((resolve, reject) => {
      const index = store.index('synced');
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markActionSynced(id: number): Promise<void> {
    const store = await this.getStore('userActions', 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.synced = true;
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteAction(id: number): Promise<void> {
    const store = await this.getStore('userActions', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Watch history operations
  async saveWatchHistory(entry: {
    id: string;
    videoId: string;
    title: string;
    thumbnail: string;
    channelName: string;
    duration: number;
    watchedAt: number;
    progress: number;
  }): Promise<void> {
    const store = await this.getStore('watchHistory', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getWatchHistory(limit: number = 50): Promise<any[]> {
    const store = await this.getStore('watchHistory');
    return new Promise((resolve, reject) => {
      const index = store.index('watchedAt');
      const request = index.openCursor(null, 'prev');
      const results: any[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Playlist operations
  async savePlaylist(playlist: any): Promise<void> {
    const store = await this.getStore('playlists', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(playlist);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPlaylists(): Promise<any[]> {
    const store = await this.getStore('playlists');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Subscription operations
  async saveSubscription(subscription: {
    channelId: string;
    channelName: string;
    channelAvatar: string;
    subscribedAt: number;
  }): Promise<void> {
    const store = await this.getStore('subscriptions', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(subscription);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSubscriptions(): Promise<any[]> {
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

  // Pending uploads operations
  async savePendingUpload(upload: {
    title: string;
    description: string;
    file: File;
    thumbnail?: File;
    privacy: string;
    tags: string[];
  }): Promise<number> {
    const store = await this.getStore('pendingUploads', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...upload,
        createdAt: Date.now(),
        status: 'pending',
      });
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingUploads(): Promise<any[]> {
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
          upload.updatedAt = Date.now();
          const putRequest = store.put(upload);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
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

  // Cleanup operations
  async cleanupOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffTime = Date.now() - maxAge;

    // Clean old cached videos
    const videosStore = await this.getStore('videos', 'readwrite');
    const videosRequest = videosStore.openCursor();

    videosRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const video = cursor.value;
        if (video.cachedAt && video.cachedAt < cutoffTime) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    // Clean old watch history
    const historyStore = await this.getStore('watchHistory', 'readwrite');
    const historyRequest = historyStore.openCursor();

    historyRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const entry = cursor.value;
        if (entry.watchedAt < cutoffTime) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { used: 0, quota: 0 };
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();

// Initialize storage when module loads
offlineStorage.init().catch(console.error);

// Utility functions
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
  if (!navigator.onLine) {
return;
}

  try {
    const pendingActions = await offlineStorage.getPendingActions();

    for (const action of pendingActions) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });

        if (response.ok) {
          await offlineStorage.markActionSynced(action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync pending actions:', error);
  }
};

// Auto-sync when coming back online
window.addEventListener('online', () => {
  syncPendingActions();
});

export default offlineStorage;