
const dbName = 'PresChopDB';
const dbVersion = 1;
let db;

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Database error');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            
            if (!db.objectStoreNames.contains('workers')) {
                const workerStore = db.createObjectStore('workers', { keyPath: 'id', autoIncrement: true });
                workerStore.createIndex('FirstName', 'FirstName', { unique: false });
                workerStore.createIndex('LastName', 'LastName', { unique: false });
                workerStore.createIndex('DateOfBirth', 'DateOfBirth', { unique: false });
                workerStore.createIndex('PlaceOfBirth', 'PlaceOfBirth', { unique: false });
                workerStore.createIndex('Gender', 'Gender', { unique: false });
                workerStore.createIndex('Department', 'Department', { unique: false });
                workerStore.createIndex('Status', 'Status', { unique: false });
                console.log('Object store "workers" created');
            }

            
            if (!db.objectStoreNames.contains('menu')) {
                const menuStore = db.createObjectStore('menu', { keyPath: 'id', autoIncrement: true });
                menuStore.createIndex('ItemName', 'ItemName', { unique: false });
                menuStore.createIndex('Type', 'Type', { unique: false });
                menuStore.createIndex('Description', 'Description', { unique: false });
                menuStore.createIndex('Price', 'Price', { unique: false });
                menuStore.createIndex('Day', 'Day', { unique: false });
                console.log('Object store "menu" created');
            }

            
            if (!db.objectStoreNames.contains('consumptions')) {
                const consumptionStore = db.createObjectStore('consumptions', { keyPath: 'id', autoIncrement: true });
                consumptionStore.createIndex('Worker', 'Worker', { unique: false });
                consumptionStore.createIndex('Food', 'Food', { unique: false });
                consumptionStore.createIndex('Drink', 'Drink', { unique: false });
                consumptionStore.createIndex('Department', 'Department', { unique: false });
                consumptionStore.createIndex('AmountConsumedFood', 'AmountConsumedFood', { unique: false });
                consumptionStore.createIndex('AmountConsumedDrink', 'AmountConsumedDrink', { unique: false });
                consumptionStore.createIndex('Price', 'Price', { unique: false });
                consumptionStore.createIndex('ConsumptionDate', 'ConsumptionDate', { unique: false });
                console.log('Object store "consumptions" created');
            }
        };
    });
}


function addData(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => {
            console.log(`Data added to ${storeName} store`);
            resolve(request.result);
        };

        request.onerror = (event) => {
            console.error(`Error adding data to ${storeName}:`, event.target.error);
            reject(event.target.error);
        };
    });
}


function getAllData(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            console.error(`Error getting data from ${storeName}:`, event.target.error);
            reject(event.target.error);
        };
    });
}


openDatabase();

// Delete all consumptions for a given worker id
function deleteConsumptionsByWorker(workerId) {
    return new Promise(function(resolve, reject) {
        try {
            var transaction = db.transaction(['consumptions'], 'readwrite');
            var store = transaction.objectStore('consumptions');
            var request = store.openCursor();
            var deletedCount = 0;

            request.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var value = cursor.value;
                    if (value && parseInt(value.workername) === parseInt(workerId)) {
                        var deleteReq = cursor.delete();
                        deleteReq.onsuccess = function() { deletedCount = deletedCount + 1; };
                        deleteReq.onerror = function(e) { console.error('Error deleting consumption:', e.target.error); };
                    }
                    cursor.continue();
                } else {
                    resolve(deletedCount);
                }
            };

            request.onerror = function(event) {
                console.error('Error opening cursor for deletion:', event.target.error);
                reject(event.target.error);
            };
        } catch (err) {
            reject(err);
        }
    });
}


/*const request = indexedDB.open("PresChopDB", 1);

request.onerror = (event) => {
    if(event.target.error.name === "NotFoundError"){
        console.log("Database doesnot exist");
    } else {
        console.error("Error opening database:", event.target.error);
    }
};

request.onupgradeneeded = (event) => {
  const db = event.target.result;

  // Create object store for "books"
  const bookStore = db.createObjectStore("books", { keyPath: "id" });
  bookStore.createIndex("title", "title");
  bookStore.createIndex("author", "author");

  // Create object store for "authors"
  const authorStore = db.createObjectStore("authors", { keyPath: "id" });
  authorStore.createIndex("name", "name");
};


request.onsuccess = (event) => {
        console.log("Database exists or was created");
        const db = event.target.result;

  // Add data to "books" store
  const bookTransaction = db.transaction("books", "readwrite");
  const bookStore = bookTransaction.objectStore("books");

  bookStore.add({ id: 1, title: "Book 1", author: "Author 1" });
  bookStore.add({ id: 2, title: "Book 2", author: "Author 2" });

  bookTransaction.oncomplete = () => {
    console.log("Books added successfully");
  };

  // Add data to "authors" store
  const authorTransaction = db.transaction("authors", "readwrite");
  const authorStore = authorTransaction.objectStore("authors");

  authorStore.add({ id: 1, name: "Author 1" });
  authorStore.add({ id: 2, name: "Author 2" });

  authorTransaction.oncomplete = () => {
    console.log("Authors added successfully");
  };
};

request.onerror = (event) => {
  console.error("Error opening database:", event.target.error);

    };
*/

