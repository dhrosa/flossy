// IndexedDB storage for user's floss collections.

// Populated the first time we open the database.
let _db: IDBDatabase | null = null;

// Access database, opening it if needed.
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Use already-opened database if possible.
    if (_db) {
      resolve(_db);
      return;
    }

    const request = indexedDB.open("collections", 1);
    request.onerror = (event) => reject(request.error);
    request.onsuccess = (event) => {
      _db = request.result;
      resolve(_db);
    };
    request.onupgradeneeded = (event) => {
      console.log(
        `Upgrading collections from version ${event.oldVersion} to ${event.newVersion}`,
      );
      const db = request.result;
      db.createObjectStore("collections", { keyPath: "name" });
    };
  });
}

// Database-stored version of a Collection.
interface CollectionRecord {
  name: string;
}

// A user's floss collection.
export class Collection {
  readonly name: string;
  // Non-clonable value to block accidentally storing this object directly in the database.
  readonly _cloneBlocker: Symbol;

  constructor(name: string) {
    this.name = name;
    this._cloneBlocker = Symbol();
  }

  // Serialize to database record.
  private toRecord(): CollectionRecord {
    return { name: this.name };
  }

  // Deserialize from database record.
  private static fromRecord(record: CollectionRecord): Collection {
    return new Collection(record.name);
  }

  // Retrieve all collections from the database.
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

  // Create a new Collection in the database.
  static async create(name: string): Promise<Collection> {
    if (!name) {
      throw new Error("Name cannot be empty");
    }
    const collection = new Collection(name);
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      const request = store.add(collection.toRecord());
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(collection);
    });
  }

  // Rename collection in the database.
  async rename(newName: string): Promise<Collection> {
    if (!newName) {
      throw new Error("New name cannot be empty");
    }
    const db = await openDb();
    const newCollection = new Collection(newName);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      store.delete(this.name);
      const request = store.add(newCollection.toRecord());
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(newCollection);
    });
  }

  // Delete collection from the database.
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
}
