const SearchEngineDB = (() => {
  const dbName = "SearchEngineProjectDB";
  const storeName = "knowledgeRecords";
  const mirrorKey = "searchEngineCustomData";

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not supported"));
        return;
      }

      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: "id" });
          store.createIndex("title", "title", { unique: false });
          store.createIndex("category", "category", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function runStore(mode, callback) {
    return openDatabase().then(
      (db) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, mode);
          const store = transaction.objectStore(storeName);
          const request = callback(store);

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          transaction.oncomplete = () => db.close();
          transaction.onerror = () => {
            db.close();
            reject(transaction.error);
          };
        })
    );
  }

  function readMirror() {
    return JSON.parse(localStorage.getItem(mirrorKey) || "[]");
  }

  function writeMirror(records) {
    localStorage.setItem(mirrorKey, JSON.stringify(records));
  }

  function normalizeRecord(record) {
    const now = new Date().toISOString();
    return {
      id: record.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
      title: record.title || "",
      category: record.category || "General",
      keywords: Array.isArray(record.keywords) ? record.keywords : [],
      summary: record.summary || "",
      answer: record.answer || "",
      points: Array.isArray(record.points) ? record.points : [],
      imageUrl: record.imageUrl || "",
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now
    };
  }

  async function getAll() {
    try {
      const records = (await runStore("readonly", (store) => store.getAll())).map(normalizeRecord);
      writeMirror(records);
      return records;
    } catch (error) {
      return readMirror().map(normalizeRecord);
    }
  }

  async function add(record) {
    const now = new Date().toISOString();
    const savedRecord = normalizeRecord({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: record.title,
      category: record.category,
      keywords: record.keywords,
      summary: record.summary,
      answer: record.answer,
      points: record.points,
      imageUrl: record.imageUrl,
      createdAt: now,
      updatedAt: now
    });

    try {
      await runStore("readwrite", (store) => store.put(savedRecord));
      const records = await getAll();
      writeMirror(records);
    } catch (error) {
      const records = [...readMirror(), savedRecord];
      writeMirror(records);
    }

    return savedRecord;
  }

  async function remove(id) {
    try {
      await runStore("readwrite", (store) => store.delete(id));
      const records = await getAll();
      writeMirror(records);
    } catch (error) {
      writeMirror(readMirror().filter((record) => record.id !== id));
    }
  }

  async function syncFromMirror() {
    const records = readMirror().map(normalizeRecord);
    if (!records.length) return;
    writeMirror(records);

    try {
      await Promise.all(records.map((record) => runStore("readwrite", (store) => store.put(record))));
    } catch (error) {
      // LocalStorage mirror remains available if IndexedDB is blocked.
    }
  }

  return {
    add,
    getAll,
    remove,
    syncFromMirror
  };
})();

window.SearchEngineDB = SearchEngineDB;
