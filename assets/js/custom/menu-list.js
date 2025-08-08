fetch('../../components/header.html').then(res => res.text()).then(data => {
      document.getElementById('header-include').innerHTML = data;
      
      var navLinks = document.querySelectorAll('#header-include .nav-link');
      for (var i = 0; i < navLinks.length; i++) {
        var link = navLinks[i];
        if (link.textContent.indexOf("Dashboard") !== -1) {
          link.href = "../../index.html";
        }
        if (link.textContent.indexOf("Register Worker") !== -1) {
          link.href = "./register-worker.html";
        }
        if (link.textContent.indexOf("Register Consumption") !== -1) {
          link.href = "./register-consumption.html";
        }
        if (link.textContent.indexOf("Worker Debts") !== -1) {
          link.href = "./worker-debts.html";
        }
        if (link.textContent.indexOf("Menu") !== -1) {
          link.href = "./menu-dashboard.html";
        }
        if (link.textContent.indexOf("Add Menu Item") !== -1) {
          link.href = "./menu-add.html";
        }
        if (link.textContent.indexOf("Menu List") !== -1) {
          link.href = "./menu-list.html";
        }
        if (link.textContent.indexOf("Worker List") !== -1) {
          link.href = "./worker-list.html";
        }
      }
    });

fetch('../../components/footer.html').then(res => res.text()).then(data => {
      document.getElementById('footer-include').innerHTML = data;
      const yearSpan = document.getElementById('footerYear');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
      });

// Render table with optional filters (simple version)
function renderMenuTable(filters) {
  var tableBody = document.querySelector('tbody');
  if (!tableBody) return;
  if (!filters) filters = {};

  getAllData('menu').then(function(menuItems) {
    var nameFilter = (filters.name || '').toLowerCase();
    var typeFilter = (filters.type || '');
    var dayFilter = (filters.day || '').toLowerCase();

    // Build filtered list using simple loop
    var filtered = [];
    for (var i = 0; i < menuItems.length; i++) {
      var item = menuItems[i];
      var nameOk = nameFilter ? String(item.name || '').toLowerCase().indexOf(nameFilter) !== -1 : true;
      var typeOk = typeFilter ? item.type === typeFilter : true;
      var dayOk = dayFilter ? String(item.day || '').toLowerCase().indexOf(dayFilter) !== -1 : true;
      if (nameOk && typeOk && dayOk) {
        filtered.push(item);
      }
    }

    // Render rows
    tableBody.innerHTML = '';
    for (var j = 0; j < filtered.length; j++) {
      var it = filtered[j];
      var row = tableBody.insertRow();
      row.innerHTML =
        '<td>' + (j + 1) + '</td>' +
        '<td>' + (it.name || '') + '</td>' +
        '<td>' + (it.type || '') + '</td>' +
        '<td>' + (it.description || '') + '</td>' +
        '<td>' + (it.price || '') + '</td>' +
        '<td>' + (it.day || '') + '</td>' +
        '<td>' +
          '<button class="btn btn-warning btn-sm" onclick="editItem(' + it.id + ')">Edit</button> ' +
          '<button class="btn btn-danger btn-sm" onclick="deleteItem(' + it.id + ')">Delete</button>' +
        '</td>';
    }
  }).catch(function(error) {
    console.error('Failed to load menu items:', error);
  });
}

// Expose handlers for inline onclick
window.deleteItem = function(id) {
  if (!confirm('Delete this menu item?')) return;
  openDatabase().then(function(){
    var tx = db.transaction(['menu'], 'readwrite');
    var store = tx.objectStore('menu');
    store.delete(id);
    tx.oncomplete = function() {
      renderMenuTable({});
    };
    tx.onerror = function(e) { console.error('Failed to delete item:', e); };
  }).catch(function(e){ console.error('Delete error:', e); });
}

window.editItem = function(id) {
  openDatabase().then(function(){
    var txGet = db.transaction(['menu'], 'readonly');
    var storeGet = txGet.objectStore('menu');
    var req = storeGet.get(id);
    req.onsuccess = function() {
      var item = req.result;
      if (!item) { alert('Item not found'); return; }
      var newName = prompt('Edit name:', item.name || '');
      if (newName === null) newName = item.name;
      var newType = prompt('Edit type (Food/Drink/Food and Drink):', item.type || '');
      if (newType === null) newType = item.type;
      var newDesc = prompt('Edit description:', item.description || '');
      if (newDesc === null) newDesc = item.description;
      var newPriceStr = prompt('Edit price:', String(item.price || ''));
      if (newPriceStr === null) newPriceStr = String(item.price || '');
      var newDay = prompt('Edit day(s):', String(item.day || ''));
      if (newDay === null) newDay = String(item.day || '');

      var newPrice = newPriceStr === '' ? item.price : Number(newPriceStr);
      var updated = {
        id: item.id,
        name: newName,
        type: newType,
        description: newDesc,
        price: newPrice,
        day: newDay
      };

      var txPut = db.transaction(['menu'], 'readwrite');
      var storePut = txPut.objectStore('menu');
      storePut.put(updated);
      txPut.oncomplete = function() {
        renderMenuTable({});
      };
      txPut.onerror = function(e) { console.error('Failed to update item:', e); };
    };
    req.onerror = function(e) { console.error('Failed to fetch item:', e); };
  }).catch(function(e){ console.error('Edit error:', e); });
}

// Initialize: open DB, wire Search button, render initial table
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await openDatabase();
  } catch {}

  // Wire search button
  const form = document.querySelector('form.row');
  if (form) {
    const searchBtn = form.querySelector('button.btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        const nameInput = form.querySelector('input[type="text"]');
        const selects = form.querySelectorAll('select');
        const typeSel = selects[0];
        const daySel = selects[1];
        renderMenuTable({
          name: (nameInput && nameInput.value) ? nameInput.value : '',
          type: (typeSel && typeSel.value) ? typeSel.value : '',
          day: (daySel && daySel.value) ? daySel.value : ''
        });
      });
    }
  }

  // Initial render
  renderMenuTable({});
});