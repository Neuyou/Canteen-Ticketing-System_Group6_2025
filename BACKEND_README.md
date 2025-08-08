# Backend (IndexedDB) README

This project uses the browser's IndexedDB as its local database. The core helper functions are defined in `assets/js/custom/db.js` and are consumed by the page scripts (e.g., `worker-list.js`, `worker-debts.js`, `register-consumption.js`, `menu-*.js`).

Below is a beginner-friendly reference for each backend function, including parameters, return values, and what they do.

---

## Database Schema Overview

Object stores (tables):
- `workers` (keyPath: `id`, auto-increment)
- `menu` (keyPath: `id`, auto-increment)
- `consumptions` (keyPath: `id`, auto-increment)

Notes:
- The codebase typically works with worker fields like `firstName`, `lastName`, `department`, `status`, and an additional `active` flag (boolean) used by the UI. If `active` is undefined, it is treated as `true` (active).
- Each consumption includes (at minimum): `workername` (worker id), `price` (number), and other optional descriptive fields (e.g., `typeFood`, `typeDrink`, amounts, department, date). Some legacy index names in the schema are capitalized; the app primarily uses the plain object properties directly.

---

## Global Variables

- `dbName: string` – Name of the database ("PresChopDB").
- `dbVersion: number` – Database version (1).
- `db: IDBDatabase | undefined` – The open database instance, set by `openDatabase()`.

---

## Functions

### openDatabase()
- Purpose: Opens (and upgrades if needed) the IndexedDB database and sets the global `db` variable.
- Signature: `function openDatabase(): Promise<IDBDatabase>`
- Parameters: none
- Returns: `Promise` that resolves to the `IDBDatabase` instance.
- Behavior:
  - Creates object stores `workers`, `menu`, and `consumptions` on first run or upgrade.
  - On success, sets `db` and resolves.
  - On error, rejects with a simple error string or the native error.

Example:
```js
await openDatabase();
// db is now available
```

---

### addData(storeName, data)
- Purpose: Insert a single record into an object store.
- Signature: `function addData(storeName: string, data: object): Promise<number>`
- Parameters:
  - `storeName` – Name of the target object store (e.g., 'workers', 'menu', 'consumptions').
  - `data` – Plain object to store. If the object store uses an auto-increment key, the key is generated for you.
- Returns: `Promise` that resolves to the generated key (record id) on success.
- Behavior:
  - Opens a `readwrite` transaction and calls `store.add(data)`.
  - Resolves with the new record id if successful; rejects with the IndexedDB error on failure.

Example:
```js
await openDatabase();
const id = await addData('workers', { firstName: 'John', lastName: 'Doe', department: 'IT', status: 'Permanent', active: true });
```

---

### getAllData(storeName)
- Purpose: Read all records from an object store.
- Signature: `function getAllData(storeName: string): Promise<any[]>`
- Parameters:
  - `storeName` – Name of the target object store.
- Returns: `Promise` that resolves to an array of all records in the store.
- Behavior:
  - Opens a `readonly` transaction and calls `store.getAll()`.
  - Resolves with an array of items; rejects with the IndexedDB error on failure.

Example:
```js
await openDatabase();
const workers = await getAllData('workers');
```

---

### deleteConsumptionsByWorker(workerId)
- Purpose: Delete all consumption records that belong to a specific worker.
- Signature: `function deleteConsumptionsByWorker(workerId: number | string): Promise<number>`
- Parameters:
  - `workerId` – The worker id to match; internally compared using `parseInt`.
- Returns: `Promise` that resolves to the count of deleted records.
- Behavior:
  - Iterates a cursor over the `consumptions` store and deletes any record where `value.workername` matches the given `workerId`.
  - Resolves with the number of records deleted.

Example:
```js
await openDatabase();
const deletedCount = await deleteConsumptionsByWorker(12);
```

---

## Common Usage Patterns

- Always call `await openDatabase()` once before using `addData`, `getAllData`, or `deleteConsumptionsByWorker` on a page load.
- Use plain `for` loops and simple event listeners to keep code beginner-friendly.
- Treat missing `active` as active (true). UI code toggles this field and blocks registering new consumptions when `active === false`.

---

## Error Handling

- All functions return Promises that reject on error. Use `try/catch` or `.catch()` to handle failures.
- Browser console logs provide additional details about IndexedDB operations.

---

## Example Flow: Register a Consumption

1. `await openDatabase()`
2. Verify the selected worker is active by reading the worker from the `workers` store.
3. If active, `await addData('consumptions', newConsumption)`
4. Update the UI and totals as needed.

```js
await openDatabase();
var tx = db.transaction(['workers'], 'readonly');
var store = tx.objectStore('workers');
var req = store.get(workerId);
req.onsuccess = function(e){
  var w = e.target.result;
  if (w && w.active === false) {
    alert('Worker is inactive');
    return;
  }
  addData('consumptions', newConsumption).then(function(){
    alert('Saved');
  });
};
```

---

## Page-level Modules

This section explains how the main page scripts interact with the backend helpers.

### worker-list.js
- Purpose: Lists all workers with their total consumption, provides actions: Register Consumption, Activate/Deactivate, and Delete.
- Backend usage:
  - `await openDatabase()` – ensures the DB is ready.
  - `await getAllData('workers')` – loads all workers.
  - `await getAllData('consumptions')` – loads consumptions to compute totals per worker.
  - `deleteConsumptionsByWorker(workerId)` – used during a Delete action to clear the worker's debt records.
  - Direct IndexedDB operations (via `db`): `store.get(id)` and `store.put(worker)` to toggle the `active` flag.

Key functions/handlers:
- `renderWorkers()`
  - Params: none
  - Returns: void
  - What it does: Opens DB, reads all workers and consumptions, calculates `totalconsumed` per worker by matching `consumption.workername === worker.id`, renders the table rows, and attaches click handlers for actions.

- Toggle Active button handler
  - Params: none (reads `data-worker-id` from the clicked row)
  - Returns: void
  - What it does: Reads the worker via `store.get(id)`, flips `worker.active` (default active when undefined), saves via `store.put(worker)`, and updates the UI (button label/color and disabling the Register link when inactive).

- Delete Worker flow
  - Params: worker id (from row dataset)
  - Returns: Promise<void> (side effects only)
  - What it does: Shows a Bootstrap confirmation modal. On confirm, deletes the worker record (`store.delete(id)`) and calls `deleteConsumptionsByWorker(id)`, removes the table row, and renumbers rows.

- `renumberRows()`
  - Params: none
  - Returns: void
  - What it does: Updates the sequential "No" column after deletions.

Notes:
- The "Register Consumption" link is visually dimmed and blocked when `active === false`. A feedback modal explains why.

---

### worker-debts.js
- Purpose: Shows only workers with outstanding debt and provides actions: Mark as Paid, Edit (with manual adjustment), and Activate/Deactivate.
- Backend usage:
  - `await openDatabase()` – ensures the DB is ready.
  - `await getAllData('workers')` and `await getAllData('consumptions')` – compute each worker's `totalDebt` by summing prices for matching `workername`.
  - `deleteConsumptionsByWorker(workerId)` – used by Mark as Paid to clear all consumptions for that worker.
  - Direct IndexedDB operations: `store.get(id)` and `store.put(worker)` to toggle `active`; also read/modify worker fields during Edit.
  - `addData('consumptions', adjustment)` – adds a hidden "manual adjustment" consumption if the user edits the debt value; the adjustment reconciles the displayed total to the user-entered amount.

Key functions/handlers:
- `renderDebts()`
  - Params: none
  - Returns: void
  - What it does: Builds the table for workers whose computed `totalDebt > 0`, and attaches handlers for Mark Paid, Edit, and Toggle Active.

- `confirmMarkPaid` click handler
  - Params: none (uses `currentRow` to resolve the worker id)
  - Returns: Promise<void>
  - What it does: Calls `deleteConsumptionsByWorker(workerId)`, removes the row, and shows a success alert.

- `saveEdit` click handler
  - Params: none (uses modal input fields and `currentRow`)
  - Returns: Promise<void>
  - What it does: Loads the worker via `store.get(id)`, updates editable fields (department, status), computes the delta between current and desired debt, and if non-zero, creates a hidden adjustment consumption with `price = delta`. Saves, closes the modal, alerts, and refreshes the table.

- Toggle Active button handler
  - Params: none (reads worker id from the row)
  - Returns: Promise<void>
  - What it does: Flips `worker.active` and updates button state with a brief alert.

Notes:
- UI ensures no layout shift on hover for action buttons (constant border width; only color transitions).

---

### register-consumption.js
- Purpose: Lets a user register a consumption for a worker with filtering and pre-filled fields via query parameters.
- Backend usage:
  - `await openDatabase()` – ensures DB is ready.
  - `await getAllData('workers')` – populates the worker dropdown (filtered by department and name search).
  - `await getAllData('menu')` – used to populate available items (if applicable).
  - Before saving, reads the selected worker via `store.get(workerId)` to ensure `active !== false`.
  - `addData('consumptions', newConsumption)` – saves the new consumption when allowed.

Key flows:
- Autofill via Query Params
  - Params: `workerId`, `name`, `department`, `status` from the URL.
  - Effect: Pre-fills the form and selects the matching worker.

- Department Filter and Name Search
  - Params: User input from the department dropdown and search box.
  - Effect: Filters the options shown in the Worker select.

- Form Submit
  - Params: Form fields (worker, selected items, amounts, date, etc.)
  - Returns: Promise<void>
  - What it does: Verifies the worker is active (`active !== false`). If inactive, shows an alert and blocks saving. If active, calls `addData('consumptions', newConsumption)` and resets the form.

Notes:
- Inactive workers are blocked at two levels: UI (links may be disabled) and submit-time verification against the `workers` store.

---

### menu-dashboard.js
- Purpose: High-level overview for menu-related data (e.g., listing counts or summaries). May also provide navigation to other menu pages.
- Backend usage:
  - `await openDatabase()` – ensures DB is ready.
  - `await getAllData('menu')` – reads all menu items for counts/summary cards.
  - Optionally `await getAllData('consumptions')` – if the dashboard shows popular items or totals (depends on implementation).

Typical flow:
- On load, open DB, read `menu` items, compute simple aggregates (total items, items by type/day), and update the UI.

---

### menu-list.js
- Purpose: Displays all menu items in a table with Search/Filter and actions (Edit/Delete). Also provides CSV/Excel export buttons.
- Backend usage:
  - `await openDatabase()` – ensures DB is ready.
  - `await getAllData('menu')` – loads items for display and filtering.
  - Editing: reads an item (via `store.get(id)`) and saves changes with `store.put(updatedItem)` inside a `readwrite` transaction.
  - Deleting: removes an item using `store.delete(id)` inside a `readwrite` transaction.

Key handlers:
- Render table
  - Params: none
  - Returns: void
  - What it does: Loads menu items, applies filter/search if present, and builds table rows with action buttons.

- `editItem(id)`
  - Params: numeric `id`
  - Returns: void/Promise<void>
  - What it does: Loads the record, shows an edit form/modal, and on save, writes back with `store.put`.

- `deleteItem(id)`
  - Params: numeric `id`
  - Returns: Promise<void>
  - What it does: Confirms, then deletes the record with `store.delete(id)` and refreshes the list.

Notes:
- Buttons use beginner-friendly inline `onclick` or attached event listeners.
- Export features read the visible rows and generate CSV/XLSX files from the table.

---

### menu-add.js
- Purpose: Form to create a new menu item.
- Backend usage:
  - `await openDatabase()` – ensures DB is ready.
  - On submit, builds a menu object like `{ itemName, type, description, price, day }` and calls `addData('menu', newItem)`.

Submit flow:
- Validate form fields, convert `price` to number, then `await addData('menu', newItem)`.
- On success, show a success message and reset/redirect.

Notes:
- Keep property names consistent with the rest of the app when saving (e.g., `ItemName` vs `itemName`). The UI commonly reads direct properties; choose one style and stick with it.

---

## Maintenance Notes

- If you change store names or keys, bump `dbVersion` and handle migrations in `onupgradeneeded`.
- Keep data property names consistent across UI and storage code.
- Prefer numeric `workername` for joins between `consumptions` and `workers`.
- Please Ayuk, Guilaine, or any other team member pls read this and the backend first
