// IndexedDB storage for user's floss collections.

import { SingleFloss, sortedFlosses } from "./Floss";

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

    const request = indexedDB.open("collections", 2);
    request.onerror = (event) => reject(request.error);
    request.onblocked = (event) => {
      console.error("Version change blocked by open database in another tab.");
    };
    request.onsuccess = (event) => {
      _db = request.result;
      resolve(_db);
    };
    request.onupgradeneeded = (event) => {
      console.log(
        `Upgrading collections from version ${event.oldVersion} to ${event.newVersion}`,
      );
      const db = request.result;
      if (db.objectStoreNames.contains("collections")) {
        console.log("Deleting old collections object store.");
        db.deleteObjectStore("collections");
      }
      db.createObjectStore("collections", { keyPath: "name" });
    };
  });
}

// Database-stored version of a Collection.
interface CollectionRecord {
  name: string;
  flossNames: string[];
}

// A user's floss collection.
export class Collection {
  readonly name: string;
  readonly flosses: SingleFloss[];
  // Non-clonable value to block accidentally storing this object directly in the database.
  private readonly _cloneBlocker: Symbol;

  constructor(name: string, flosses: SingleFloss[]) {
    this.name = name;
    this.flosses = flosses;
    this._cloneBlocker = Symbol();
  }

  // New collection with the given flosses.
  withFlosses(flosses: SingleFloss[]): Collection {
    return new Collection(this.name, sortedFlosses(flosses));
  }

  // Serialize to database record.
  private toRecord(): CollectionRecord {
    return { name: this.name, flossNames: this.flosses.map((f) => f.name) };
  }

  // Deserialize from database record./cwl1
  private static fromRecord(record: CollectionRecord): Collection {
    return new Collection(
      record.name,
      record.flossNames.map(SingleFloss.fromName),
    );
  }

  // Retrieve all collections from the database.
  static async all(): Promise<Collection[]> {
    console.time("open");
    const db = await openDb();
    console.timeEnd("open");
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readonly");
      const store = tx.objectStore("collections");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records: CollectionRecord[] = request.result;
        resolve(records.map(Collection.fromRecord));
      };
    });
  }

  // Create a new Collection in the database.
  static async create(
    name: string,
    flosses: SingleFloss[] = [],
  ): Promise<Collection> {
    if (!name) {
      throw new Error("Name cannot be empty");
    }
    const collection = new Collection(name, flosses);
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      const request = store.add(collection.toRecord());
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(collection);
    });
  }

  // Get a Collection from the database by name.
  static async get(name: string): Promise<Collection> {
    const db = await openDb();
    const tx = db.transaction("collections", "readonly");
    const store = tx.objectStore("collections");
    const request = store.get(name);
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(Collection.fromRecord(request.result));
      };
    });
  }

  // Rename collection in the database.
  async rename(newName: string): Promise<Collection> {
    if (!newName) {
      throw new Error("New name cannot be empty");
    }
    const db = await openDb();
    const newCollection = new Collection(newName, this.flosses);
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      store.delete(this.name);
      const request = store.add(newCollection.toRecord());
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(newCollection);
    });
  }

  // Save collection to the database.
  async save(): Promise<Collection> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("collections", "readwrite");
      const store = tx.objectStore("collections");
      const request = store.put(this.toRecord());
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(this);
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
