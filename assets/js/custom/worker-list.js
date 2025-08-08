var filterForm = document.getElementById('filterForm');
var filterName = document.getElementById('filterName');
var filterType = document.getElementById('filterType');
var filterStatus = document.getElementById('filterStatus');
var filterDateFrom = document.getElementById('filterDateFrom');
var filterDateTo = document.getElementById('filterDateTo');
var clearFilters = document.getElementById('clearFilters');
var table = document.querySelector('table');
var tbody = table.querySelector('tbody');

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
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${worker.firstName} ${worker.lastName}</td>
                <td>${totalconsumed}</td>
                <td>${worker.department}</td>
                <td>${worker.status}</td>
                <td>
                  <a class="btn btn-sm btn-primary" style="background:#ff6600; border:none;" href="./register-consumption.html?workerId=${worker.id}&name=${encodeURIComponent(worker.firstName + ' ' + worker.lastName)}&department=${encodeURIComponent(worker.department)}&status=${encodeURIComponent(worker.status)}">Register Consumption</a>
                </td>
            `;
        });
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
});