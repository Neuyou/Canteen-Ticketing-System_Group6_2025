let currentRow = null;

function showAlert(message, type) {
  var alertDiv = document.getElementById('actionAlert');
  alertDiv.className = 'alert alert-' + type + ' position-fixed top-0 start-50 translate-middle-x mt-3';
  alertDiv.textContent = message;
  alertDiv.classList.remove('d-none');
  setTimeout(function(){ alertDiv.classList.add('d-none'); }, 2000);
}


const filterForm = document.getElementById('filterForm');
var filterName = document.getElementById('filterName');
var filterDepartment = document.getElementById('filterDepartment');
var filterStatus = document.getElementById('filterStatus');
var clearFilters = document.getElementById('clearFilters');
var table = document.querySelector('table');
var tbody = table.querySelector('tbody');

function filterRows() {
  var nameVal = (filterName && filterName.value ? filterName.value : '').trim().toLowerCase();
  var deptVal = (filterDepartment && filterDepartment.value) ? filterDepartment.value : '';
  var statusVal = (filterStatus && filterStatus.value) ? filterStatus.value : '';
  var rows = tbody.rows;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var name = (row.cells[1] && row.cells[1].textContent) ? row.cells[1].textContent.trim().toLowerCase() : '';
    var department = (row.cells[2] && row.cells[2].textContent) ? row.cells[2].textContent.trim() : '';
    var status = (row.cells[3] && row.cells[3].textContent) ? row.cells[3].textContent.trim() : '';
    var show = true;
    if (nameVal && name.indexOf(nameVal) === -1) show = false;
    if (deptVal && department !== deptVal) show = false;
    if (statusVal && status !== statusVal) show = false;
    row.style.display = show ? '' : 'none';
  }
}
if (filterForm) { filterForm.addEventListener('input', filterRows); }
if (clearFilters) {
  clearFilters.addEventListener('click', function() { filterRows(); });
}

function exportTableToCSV(filename) {
  var visibleRows = [];
  for (var vr = 0; vr < tbody.rows.length; vr++) {
    var rr = tbody.rows[vr];
    if (rr.style.display !== 'none') visibleRows.push(rr);
  }
  var ths = table.querySelectorAll('thead th');
  var headers = [];
  for (var h = 0; h < ths.length - 1; h++) { headers.push(ths[h].textContent.trim()); }
  var csv = headers.join(',') + '\n';
  for (var idx = 0; idx < visibleRows.length; idx++) {
    var rw = visibleRows[idx];
    var parts = [];
    for (var c = 0; c < rw.cells.length - 1; c++) {
      var txt = rw.cells[c].textContent.replace(/"/g, '""');
      parts.push('"' + txt + '"');
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
if (exportCSVBtn) { exportCSVBtn.onclick = function() { exportTableToCSV('worker_debts.csv'); }; }

    
function exportTableToExcel(filename) {
  var visibleRows = [];
  for (var i2 = 0; i2 < tbody.rows.length; i2++) {
    var row = tbody.rows[i2];
    if (row.style.display !== 'none') visibleRows.push(row);
  }
  var ths2 = table.querySelectorAll('thead th');
  var headers2 = [];
  for (var h2 = 0; h2 < ths2.length - 1; h2++) { headers2.push(ths2[h2].textContent.trim()); }
  var data = [headers2];
  for (var r2 = 0; r2 < visibleRows.length; r2++) {
    var rw2 = visibleRows[r2];
    var cells2 = [];
    for (var c2 = 0; c2 < rw2.cells.length - 1; c2++) { cells2.push(rw2.cells[c2].textContent); }
    data.push(cells2);
  }
  var ws = XLSX.utils.aoa_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'WorkerDebts');
  XLSX.writeFile(wb, filename);
}
var exportExcelBtn = document.getElementById('exportExcel');
if (exportExcelBtn) { exportExcelBtn.onclick = function() { exportTableToExcel('worker_debts.xlsx'); }; }

// Load header and footer components dynamically
    fetch('../../components/header.html').then(res => res.text()).then(data => {
      document.getElementById('header-include').innerHTML = data;
      const navLinks = document.querySelectorAll('#header-include .nav-link');
      navLinks.forEach(link =>{
        if (link.textContent.includes("Dashboard")) {
          link.href = "../../index.html";
          console.log(link.href);
        }
        if (link.textContent.includes("Register Worker")) {
          link.href = "./register-worker.html";
          console.log(link.href);
        }
        if (link.textContent.includes("Register Consumption")) {
          link.href = "./register-consumption.html";
          console.log(link.href);
        }
        if (link.textContent.includes("Worker Debts")) {
          link.href = "./worker-debts.html";
          console.log(link.href);
        }
        if (link.textContent.includes("Menu")) {
          link.href = "./menu-dashboard.html";
          console.log(link.href);
        }
        if (link.textContent.includes("Add Menu Item")) {
          link.href = "./menu-add.html";
          console.log(link.href);
        }
        if (link.textContent.includes("Menu List")) {
          link.href = "./menu-list.html";
          console.log(link.href);
        }
        if (link.textContent.includes("Worker List")) {
          link.href = "./worker-list.html";
          console.log(link.href);
        }
      });
    });

    //including the footer using js, to load the footer and get the current date using .getFullYear() function
    fetch('../../components/footer.html').then(res => res.text()).then(data => {
      document.getElementById('footer-include').innerHTML = data;
      const yearSpan = document.getElementById('footerYear');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
      });

    


async function renderDebts() {
  var tableBody = document.querySelector('tbody');
  tableBody.innerHTML = '';
  try {
    await openDatabase();
    var workers = await getAllData('workers');
    var consumptions = await getAllData('consumptions');

    var rowIndex = 1;
    for (var i = 0; i < workers.length; i++) {
      var w = workers[i];
      var totalDebt = 0;
      for (var j = 0; j < consumptions.length; j++) {
        var c = consumptions[j];
        if (parseInt(c.workername) === parseInt(w.id)) {
          if (typeof c.price === 'number') { totalDebt += c.price; }
          else if (c.price) { totalDebt += parseFloat(c.price); }
        }
      }
      if (totalDebt > 0) {
        var row = tableBody.insertRow();
        row.setAttribute('data-worker-id', w.id);
        var isActive = (typeof w.active === 'undefined') ? true : !!w.active;
        var cellsHtml = '' +
          '<td>' + (rowIndex) + '</td>' +
          '<td>' + w.firstName + ' ' + w.lastName + '</td>' +
          '<td>' + (w.department || '') + '</td>' +
          '<td>' + (w.status || '') + '</td>' +
          '<td>' + totalDebt + '</td>' +
          '<td>' +
            '<button class="btn action-btn me-1" style="background:#ff6600; color:#fff; border:none;" data-action="mark-paid"><i class="fa fa-check"></i> Mark as Paid</button>' +
            '<button class="btn action-btn me-1 btn-toggle-active" style="background:#ff6600; color:#fff; border:none;" data-active="' + (isActive ? 'true' : 'false') + '" style="' + (isActive ? 'background:#6c757d' : 'background:#198754') + '; color:#fff; border:none;"><i class="fa ' + (isActive ? 'fa-user-slash' : 'fa-user-check') + '"></i> ' + (isActive ? 'Deactivate' : 'Activate') + '</button>' +
            '<button class="btn action-btn" style="background:#ff6600; color:#fff; border:none;" data-action="edit"><i class="fa fa-edit"></i> Edit</button>' +
          '</td>';
        row.innerHTML = cellsHtml;
        rowIndex = rowIndex + 1;
      }
    }

    // Attach button handlers
    var markPaidBtns = document.querySelectorAll('.action-btn[data-action="mark-paid"]');
    for (var k = 0; k < markPaidBtns.length; k++) {
      markPaidBtns[k].addEventListener('click', function(e) {
        currentRow = e.target.closest('tr');
        new bootstrap.Modal(document.getElementById('markPaidModal')).show();
      });
    }

    // Toggle Active handlers
    var togBtns = document.querySelectorAll('.btn-toggle-active');
    for (var t = 0; t < togBtns.length; t++) {
      togBtns[t].addEventListener('click', function(e){
        var btn = e.currentTarget;
        var tr = btn.closest('tr');
        var wid = tr ? tr.getAttribute('data-worker-id') : null;
        if (!wid) { return; }
        openDatabase().then(function(){
          var tx = db.transaction(['workers'], 'readwrite');
          var store = tx.objectStore('workers');
          var getReq = store.get(parseInt(wid));
          getReq.onsuccess = function(ev){
            var w = ev.target.result;
            if (!w) { return; }
            var nowActive = !(w.active === false);
            var newActive = !nowActive;
            w.active = newActive;
            store.put(w).onsuccess = function(){
              // Update button state
              btn.innerHTML = '<i class="fa ' + (newActive ? 'fa-user-slash' : 'fa-user-check') + '"></i> ' + (newActive ? 'Deactivate' : 'Activate');
              btn.style.background = newActive ? '#6c757d' : '#198754';
              btn.setAttribute('data-active', newActive ? 'true' : 'false');
              showAlert(newActive ? 'Worker activated.' : 'Worker deactivated.', 'info');
            };
          };
        });
      });
    }
    var editBtns = document.querySelectorAll('.action-btn[data-action="edit"]');
    for (var m = 0; m < editBtns.length; m++) {
      editBtns[m].addEventListener('click', function(e) {
        currentRow = e.target.closest('tr');
        var cells = currentRow.querySelectorAll('td');
        document.getElementById('editWorkerName').value = cells[1].textContent;
        // Department and Status fields exist in modal (after HTML update)
        var deptInput = document.getElementById('editDepartment');
        var statusInput = document.getElementById('editStatus');
        if (deptInput) { deptInput.value = cells[2].textContent; }
        if (statusInput) { statusInput.value = cells[3].textContent; }
        var debtInput = document.getElementById('editDebt');
        if (debtInput) { debtInput.value = cells[4].textContent; }
        new bootstrap.Modal(document.getElementById('editModal')).show();
      });
    }

  } catch (error) {
    console.error('Failed to load worker debts:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  renderDebts();
});

document.getElementById('confirmMarkPaid').onclick = async function() {
  try {
    if (!currentRow) { return; }
    var workerId = currentRow.getAttribute('data-worker-id');
    await deleteConsumptionsByWorker(workerId);
    // Remove row from UI and close modal
    currentRow.parentNode.removeChild(currentRow);
    currentRow = null;
    bootstrap.Modal.getInstance(document.getElementById('markPaidModal')).hide();
    showAlert('Debt marked as paid!', 'success');
  } catch (e) {
    console.error('Error marking as paid:', e);
    showAlert('Failed to mark as paid.', 'danger');
  }
};

document.getElementById('saveEdit').onclick = async function() {
  try {
    if (!currentRow) { return; }
    var workerId = parseInt(currentRow.getAttribute('data-worker-id'));
    await openDatabase();
    var tx = db.transaction(['workers'], 'readwrite');
    var store = tx.objectStore('workers');
    var getReq = store.get(workerId);
    getReq.onsuccess = function(ev) {
      var w = ev.target.result || {};
      var deptInput = document.getElementById('editDepartment');
      var statusInput = document.getElementById('editStatus');
      var debtInput = document.getElementById('editDebt');
      var cellsNow = currentRow.querySelectorAll('td');
      var currentDebt = 0;
      if (cellsNow && cellsNow[4]) {
        var cdTxt = cellsNow[4].textContent;
        if (cdTxt) { currentDebt = parseFloat(cdTxt); }
      }
      var desiredDebt = (debtInput && debtInput.value) ? parseFloat(debtInput.value) : currentDebt;
      if (isNaN(currentDebt)) { currentDebt = 0; }
      if (isNaN(desiredDebt)) { desiredDebt = currentDebt; }
      var delta = desiredDebt - currentDebt;
      if (deptInput) { w.department = deptInput.value; }
      if (statusInput) { w.status = statusInput.value; }
      store.put(w).onsuccess = function() {
        // If debt changed, add a hidden manual adjustment consumption
        if (delta && Math.abs(delta) > 0) {
          var adj = {
            workername: workerId,
            typeFood: 'Manual Adjustment',
            typeDrink: '',
            department: w.department || (deptInput ? deptInput.value : ''),
            status: w.status || (statusInput ? statusInput.value : ''),
            amountFood: 0,
            amountDrink: 0,
            price: delta,
            consumptiondate: new Date().toISOString().slice(0,10),
            hidden: true,
            manualAdjustment: true
          };
          addData('consumptions', adj).then(function() {
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            showAlert('Record updated!', 'info');
            renderDebts();
          }).catch(function(err) {
            console.error('Failed to add adjustment consumption:', err);
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            showAlert('Record updated, but adjustment failed.', 'warning');
            renderDebts();
          });
        } else {
          bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
          showAlert('Record updated!', 'info');
          renderDebts();
        }
      };
    };
    getReq.onerror = function(err) { console.error('Failed to get worker for edit', err); };
  } catch (e) {
    console.error('Edit save failed:', e);
    showAlert('Failed to update.', 'danger');
  }
};

// Global handlers for dynamically rendered rows
window.markPaid = function(workerId) {
  const row = document.querySelector(`tr[data-worker-id="${workerId}"]`);
  if (row) {
    currentRow = row;
    new bootstrap.Modal(document.getElementById('markPaidModal')).show();
  }
}

window.editWorker = function(workerId) {
  const row = document.querySelector(`tr[data-worker-id="${workerId}"]`);
  if (row) {
    currentRow = row;
    const cells = currentRow.querySelectorAll('td');
    document.getElementById('editWorkerName').value = cells[0].textContent;
    document.getElementById('editType').value = cells[1].textContent;
    document.getElementById('editAmount').value = cells[2].textContent;
    document.getElementById('editDate').value = cells[3].textContent;
    document.getElementById('editStatus').value = cells[4].textContent;
    document.getElementById('editDebt').value = cells[5].textContent;
    new bootstrap.Modal(document.getElementById('editModal')).show();
  }
}