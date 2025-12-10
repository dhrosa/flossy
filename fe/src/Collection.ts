// IndexedDB storage for user's floss collections.

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("collections", 1);
    request.onerror = (event) => reject(request.error);
    request.onsuccess = (event) => resolve(request.result);
    request.onupgradeneeded = (event) => {
      console.log(
        `Upgrading collections from version ${event.oldVersion} to ${event.newVersion}`,
      );
      const db = request.result;
      db.createObjectStore("collections", { keyPath: "name" });
    };
  });
}

interface CollectionRecord {
  name: string;
}

export class Collection {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  async save(): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      const request = store.add(this);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async rename(newName: string): Promise<Collection> {
    const db = await openDb();
    const newCollection = new Collection(newName);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      const deleteRequest = store.delete(this.name);
      const addRequest = store.add(newCollection);
      addRequest.onerror = () => reject(addRequest.error);
      addRequest.onsuccess = () => resolve(newCollection);
    });
  }

  async delete(): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      const request = store.delete(this.name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async all(): Promise<Collection[]> {
    const db = await openDb();
    const tx = db.transaction("collections", "readonly");
    const store = tx.objectStore("collections");
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records: CollectionRecord[] = request.result;
        resolve(records.map((record) => new Collection(record.name)));
      };
    });
  }
}
