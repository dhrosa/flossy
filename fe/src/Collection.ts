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
      store.add({ name: this.name });
      tx.oncomplete = () => {
        resolve();
        console.log("save complete");
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  static async all(): Promise<Collection[]> {
    const db = await openDb();
    const tx = db.transaction("collections", "readonly");
    const store = tx.objectStore("collections");
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      console.log("greetings");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records: CollectionRecord[] = request.result;
        resolve(records.map((record) => new Collection(record.name)));
      };
    });
  }
}
