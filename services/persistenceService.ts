import { Vehicle } from '../types';

const DB_NAME = 'FleetManagementDB';
const DB_VERSION = 1;
const STORE_NAME = 'fleetData';
const DATA_KEY = 'fleetState';

export interface StoredFleetData {
  vehicles: Vehicle[];
  fileName: string;
  lastUpdated: Date;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject('Error opening IndexedDB.');
    };
  });
};

export const saveFleetData = async (data: StoredFleetData): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, DATA_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error saving data to IndexedDB:', (event.target as IDBTransaction).error);
      reject('Error saving data.');
    };
  });
};

export const loadFleetData = async (): Promise<StoredFleetData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(DATA_KEY);

    request.onsuccess = (event) => {
      const result = (event.target as IDBRequest).result;
      resolve(result ? (result as StoredFleetData) : null);
    };

    request.onerror = (event) => {
      console.error('Error loading data from IndexedDB:', (event.target as IDBTransaction).error);
      reject('Error loading data.');
    };
  });
};

export const clearFleetData = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error clearing data from IndexedDB:', (event.target as IDBTransaction).error);
      reject('Error clearing data.');
    };
  });
};
