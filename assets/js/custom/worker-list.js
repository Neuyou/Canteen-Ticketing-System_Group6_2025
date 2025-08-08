var filterForm = document.getElementById('filterForm');
var filterName = document.getElementById('filterName');
var filterType = document.getElementById('filterType');
var filterStatus = document.getElementById('filterStatus');
var filterDateFrom = document.getElementById('filterDateFrom');
var filterDateTo = document.getElementById('filterDateTo');
var clearFilters = document.getElementById('clearFilters');
var table = document.querySelector('table');
var tbody = table.querySelector('tbody');
// State for delete confirmation modal
var currentDeleteWorkerId = null;
var currentDeleteRow = null;

// Helper: renumber the first column after any deletion
function renumberTableRows() {
  if (!tbody) { return; }
  var rows = tbody.rows;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] && rows[i].cells && rows[i].cells[0]) {
      rows[i].cells[0].textContent = (i + 1);
    }
  }
}

function filterRows() {
  var nameVal = (filterName && filterName.value ? filterName.value : '').trim().toLowerCase();
  var deptVal = (filterType && filterType.value) ? filterType.value : '';
  var statusVal = (filterStatus && filterStatus.value) ? filterStatus.value : '';
  var rows = tbody.rows;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var name = (row.cells[1] && row.cells[1].textContent) ? row.cells[1].textContent.trim().toLowerCase() : '';
    var dept = (row.cells[3] && row.cells[3].textContent) ? row.cells[3].textContent.trim() : '';
    var status = (row.cells[4] && row.cells[4].textContent) ? row.cells[4].textContent.trim() : '';
    var show = true;
    if (nameVal && name.indexOf(nameVal) === -1) show = false;
    if (deptVal && dept !== deptVal) show = false;
    if (statusVal && status !== statusVal) show = false;
    row.style.display = show ? '' : 'none';
  }
}
if (filterForm) {
  filterForm.addEventListener('input', filterRows);
}
if (clearFilters) {
  clearFilters.addEventListener('click', function() {
    filterRows();
  });
}

function exportTableToCSV(filename) {
  // Collect visible rows
  var visibleRows = [];
  for (var i = 0; i < tbody.rows.length; i++) {
    var r = tbody.rows[i];
    if (r.style.display !== 'none') {
      visibleRows.push(r);
    }
  }
  // Collect headers (exclude Actions column which is last)
  var ths = table.querySelectorAll('thead th');
  var headerTexts = [];
  for (var h = 0; h < ths.length - 1; h++) {
    headerTexts.push(ths[h].textContent.trim());
  }
  var csv = headerTexts.join(',') + '\n';

  // Append rows
  for (var j = 0; j < visibleRows.length; j++) {
    var row = visibleRows[j];
    var parts = [];
    for (var c = 0; c < row.cells.length - 1; c++) { // Exclude Actions column
      var txt = row.cells[c].textContent;
      txt = '"' + txt.replace(/"/g, '""') + '"';
      parts.push(txt);
    }
    csv += parts.join(',') + '\n';
  }
  var blob = new Blob([csv], { type: 'text/csv' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
var exportCSVBtn = document.getElementById('exportCSV');
if (exportCSVBtn) {
  exportCSVBtn.onclick = function() {
    exportTableToCSV('worker_list.csv');
  };
}

function exportTableToExcel(filename) {
  var visibleRows = [];
  for (var i = 0; i < tbody.rows.length; i++) {
    var row = tbody.rows[i];
    if (row.style.display !== 'none') {
      visibleRows.push(row);
    }
  }
  var ths = table.querySelectorAll('thead th');
  var headers = [];
  for (var h = 0; h < ths.length - 1; h++) { // Exclude Actions
    headers.push(ths[h].textContent.trim());
  }
  var data = [headers];
  for (var j = 0; j < visibleRows.length; j++) {
    var r = visibleRows[j];
    var cells = [];
    for (var c = 0; c < r.cells.length - 1; c++) { // Exclude Actions
      cells.push(r.cells[c].textContent);
    }
    data.push(cells);
  }
  var ws = XLSX.utils.aoa_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'WorkerList');
  XLSX.writeFile(wb, filename);
}
var exportExcelBtn = document.getElementById('exportExcel');
if (exportExcelBtn) {
  exportExcelBtn.onclick = function() {
    exportTableToExcel('worker_list.xlsx');
  };
}

fetch('../../components/header.html').then(res => res.text()).then(data => {
  document.getElementById('header-include').innerHTML = data;
  var navLinks = document.querySelectorAll('#header-include .nav-link');
  for (var i = 0; i < navLinks.length; i++){
    var link = navLinks[i];
    if (link.textContent.indexOf("Dashboard") !== -1) { link.href = "../../index.html"; }
    if (link.textContent.indexOf("Register Worker") !== -1) { link.href = "./register-worker.html"; }
    if (link.textContent.indexOf("Register Consumption") !== -1) { link.href = "./register-consumption.html"; }
    if (link.textContent.indexOf("Worker Debts") !== -1) { link.href = "./worker-debts.html"; }
    if (link.textContent.indexOf("Menu") !== -1) { link.href = "./menu-dashboard.html"; }
    if (link.textContent.indexOf("Add Menu Item") !== -1) { link.href = "./menu-add.html"; }
    if (link.textContent.indexOf("Menu List") !== -1) { link.href = "./menu-list.html"; }
    if (link.textContent.indexOf("Worker List") !== -1) { link.href = "./worker-list.html"; }
  }
});

fetch('../../components/footer.html').then(res => res.text()).then(data => {
  document.getElementById('footer-include').innerHTML = data;
  var yearSpan = document.getElementById('footerYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});


document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#workerTableBody'); 
    try {
        await openDatabase();
        const workers = await getAllData('workers');
        const consumption = await getAllData('consumptions');

        console.log(workers)
        workers.forEach((worker, index) => {
            var totalconsumed = 0;
            var row = tableBody.insertRow();
            consumption.forEach(function(consume) {
              if (consume.workername === worker.id) {
                totalconsumed += consume.price;
              }
            });
            // Determine active flag (default true if undefined)
            var isActive = (typeof worker.active === 'undefined') ? true : !!worker.active;
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${worker.firstName} ${worker.lastName}</td>
                <td>${totalconsumed}</td>
                <td>${worker.department}</td>
                <td>${worker.status}</td>
                <td>
                  <a class="btn btn-sm btn-primary btn-register" data-active="${isActive ? 'true' : 'false'}" style="background:#ff6600; border:none; opacity:${isActive ? '1' : '0.6'};" href="./register-consumption.html?workerId=${worker.id}&name=${encodeURIComponent(worker.firstName + ' ' + worker.lastName)}&department=${encodeURIComponent(worker.department)}&status=${encodeURIComponent(worker.status)}">Register Consumption</a>
                  <button class="btn btn-sm btn-secondary btn-toggle-active" style="margin-left:6px; background:${isActive ? '#6c757d' : '#198754'}; border:none;" data-worker-id="${worker.id}" data-active="${isActive ? 'true' : 'false'}">${isActive ? 'Deactivate' : 'Activate'}</button>
                  <button class="btn btn-sm btn-primary btn-delete-worker" style="margin-left:6px; margin-top: 2px; background:#ff6600; border:none;" data-worker-id="${worker.id}">Delete</button>
                </td>
            `;
        });
        // Block register for inactive workers
        var regLinks = document.querySelectorAll('.btn-register');
        for (var rl = 0; rl < regLinks.length; rl++) {
          regLinks[rl].addEventListener('click', function(e){
            var a = e.currentTarget;
            var act = a.getAttribute('data-active');
            if (act === 'false') {
              e.preventDefault();
              var resultMsgEl = document.getElementById('resultModalMessage');
              var resultModalEl = document.getElementById('resultModal');
              if (resultMsgEl) { resultMsgEl.textContent = 'This worker is inactive. Reactivate to register consumption.'; }
              if (resultModalEl) { new bootstrap.Modal(resultModalEl).show(); }
            }
          });
        }

        // Toggle Active handlers
        var togBtns = document.querySelectorAll('.btn-toggle-active');
        for (var t = 0; t < togBtns.length; t++) {
          togBtns[t].addEventListener('click', function(evt){
            var btn = evt.currentTarget;
            var wid = btn.getAttribute('data-worker-id');
            if (!wid) { return; }
            openDatabase().then(function(){
              var tx = db.transaction(['workers'], 'readwrite');
              var store = tx.objectStore('workers');
              var getReq = store.get(parseInt(wid));
              getReq.onsuccess = function(ev){
                var w = ev.target.result;
                if (!w) { return; }
                var nowActive = !(w.active === false); // default true
                var newActive = !nowActive;
                w.active = newActive;
                store.put(w).onsuccess = function(){
                  // Update UI: button label/color and register link state
                  btn.textContent = newActive ? 'Deactivate' : 'Activate';
                  btn.style.background = newActive ? '#6c757d' : '#198754';
                  btn.setAttribute('data-active', newActive ? 'true' : 'false');
                  var tr = btn.closest('tr');
                  if (tr) {
                    var reg = tr.querySelector('.btn-register');
                    if (reg) {
                      reg.setAttribute('data-active', newActive ? 'true' : 'false');
                      reg.style.opacity = newActive ? '1' : '0.6';
                    }
                  }
                  // feedback
                  var resultMsgEl = document.getElementById('resultModalMessage');
                  var resultModalEl = document.getElementById('resultModal');
                  if (resultMsgEl) { resultMsgEl.textContent = newActive ? 'Worker activated.' : 'Worker deactivated.'; }
                  if (resultModalEl) { new bootstrap.Modal(resultModalEl).show(); }
                };
              };
            });
          });
        }
        // Attach delete handlers
        var delBtns = document.querySelectorAll('.btn-delete-worker');
        for (var b = 0; b < delBtns.length; b++) {
          delBtns[b].addEventListener('click', function(evt) {
            var btn = evt.currentTarget;
            var wid = btn.getAttribute('data-worker-id');
            if (!wid) { return; }
            currentDeleteWorkerId = parseInt(wid);
            currentDeleteRow = btn.closest('tr');
            var nameCell = currentDeleteRow && currentDeleteRow.cells && currentDeleteRow.cells[1] ? currentDeleteRow.cells[1].textContent : '';
            var msgEl = document.getElementById('deleteWorkerMessage');
            if (msgEl) { msgEl.textContent = 'Are you sure you want to delete ' + nameCell + ' and all their consumptions?'; }
            var modalEl = document.getElementById('deleteWorkerModal');
            if (modalEl) { new bootstrap.Modal(modalEl).show(); }
          });
        }

        // Confirm delete handler (attach once)
        var confirmBtn = document.getElementById('confirmDeleteWorker');
        if (confirmBtn && !confirmBtn._wired) {
          confirmBtn._wired = true;
          confirmBtn.addEventListener('click', function(){
            var resultMsgEl = document.getElementById('resultModalMessage');
            var resultModalEl = document.getElementById('resultModal');
            var delModalEl = document.getElementById('deleteWorkerModal');
            if (!currentDeleteWorkerId) { if (delModalEl) { bootstrap.Modal.getInstance(delModalEl).hide(); } return; }
            openDatabase().then(function(){
              var tx = db.transaction(['workers'], 'readwrite');
              var store = tx.objectStore('workers');
              var req = store.delete(currentDeleteWorkerId);
              req.onsuccess = function(){
                deleteConsumptionsByWorker(currentDeleteWorkerId).then(function(){
                  if (currentDeleteRow && currentDeleteRow.parentNode) { currentDeleteRow.parentNode.removeChild(currentDeleteRow); }
                  renumberTableRows();
                  if (delModalEl) { bootstrap.Modal.getInstance(delModalEl).hide(); }
                  if (resultMsgEl) { resultMsgEl.textContent = 'Worker deleted successfully.'; }
                  if (resultModalEl) { new bootstrap.Modal(resultModalEl).show(); }
                  currentDeleteWorkerId = null; currentDeleteRow = null;
                }).catch(function(err){
                  console.error('Failed to delete consumptions:', err);
                  if (delModalEl) { bootstrap.Modal.getInstance(delModalEl).hide(); }
                  if (resultMsgEl) { resultMsgEl.textContent = 'Worker deleted, but failed to remove consumptions.'; }
                  if (resultModalEl) { new bootstrap.Modal(resultModalEl).show(); }
                  currentDeleteWorkerId = null; currentDeleteRow = null;
                });
              };
              req.onerror = function(e){
                console.error('Failed to delete worker:', e);
                if (delModalEl) { bootstrap.Modal.getInstance(delModalEl).hide(); }
                if (resultMsgEl) { resultMsgEl.textContent = 'Failed to delete worker.'; }
                if (resultModalEl) { new bootstrap.Modal(resultModalEl).show(); }
                currentDeleteWorkerId = null; currentDeleteRow = null;
              };
            }).catch(function(e){
              console.error('DB open failed:', e);
              if (delModalEl) { bootstrap.Modal.getInstance(delModalEl).hide(); }
              if (resultMsgEl) { resultMsgEl.textContent = 'Database error.'; }
              if (resultModalEl) { new bootstrap.Modal(resultModalEl).show(); }
              currentDeleteWorkerId = null; currentDeleteRow = null;
            });
          });
        }
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
  });