
let currentRow = null;
   
    document.querySelectorAll('.action-btn[data-action="mark-paid"]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        currentRow = e.target.closest('tr');
        new bootstrap.Modal(document.getElementById('markPaidModal')).show();
      });
    });
    document.getElementById('confirmMarkPaid').onclick = function() {
      showAlert('Debt marked as paid!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('markPaidModal')).hide();
    };

    
    document.querySelectorAll('.action-btn[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        currentRow = e.target.closest('tr');
        const cells = currentRow.querySelectorAll('td');
        document.getElementById('editWorkerName').value = cells[0].textContent;
        document.getElementById('editType').value = cells[1].textContent;
        document.getElementById('editAmount').value = cells[2].textContent;
        document.getElementById('editDate').value = cells[3].textContent;
        document.getElementById('editStatus').value = cells[4].textContent;
        document.getElementById('editDebt').value = cells[5].textContent;
        new bootstrap.Modal(document.getElementById('editModal')).show();
      });
    });
    document.getElementById('saveEdit').onclick = function() {
      showAlert('Record updated!', 'info');
      bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    };

    
    document.querySelectorAll('.action-btn[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        currentRow = e.target.closest('tr');
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
      });
    });
    /*document.getElementById('confirmDelete').onclick = function() {
      showAlert('Record deleted!', 'danger');
      bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    };*/

    
    function showAlert(message, type) {
      const alertDiv = document.getElementById('actionAlert');
      alertDiv.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
      alertDiv.textContent = message;
      alertDiv.classList.remove('d-none');
      setTimeout(() => alertDiv.classList.add('d-none'), 2000);
    }

const filterForm = document.getElementById('filterForm');
    const filterName = document.getElementById('filterName');
    const filterType = document.getElementById('filterType');
    const filterStatus = document.getElementById('filterStatus');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const clearFilters = document.getElementById('clearFilters');
    const table = document.querySelector('table');
    const tbody = table.querySelector('tbody');

    function filterRows() {
      const nameVal = filterName.value.trim().toLowerCase();
      const typeVal = filterType.value;
      const statusVal = filterStatus.value;
      const dateFromVal = filterDateFrom.value;
      const dateToVal = filterDateTo.value;
      Array.from(tbody.rows).forEach(row => {
        const [name, type, , date, status] = [0,1,2,3,4].map(i => row.cells[i].textContent.trim());
        let show = true;
        if (nameVal && !name.toLowerCase().includes(nameVal)) show = false;
        if (typeVal && type !== typeVal) show = false;
        if (statusVal && status !== statusVal) show = false;
        if (dateFromVal && date < dateFromVal) show = false;
        if (dateToVal && date > dateToVal) show = false;
        row.style.display = show ? '' : 'none';
      });
    }
    filterForm.addEventListener('input', filterRows);
    clearFilters.addEventListener('click', function() {
      filterName.value = '';
      filterType.value = '';
      filterStatus.value = '';
      filterDateFrom.value = '';
      filterDateTo.value = '';
      filterRows();
    });

    function exportTableToCSV(filename) {
      const rows = Array.from(tbody.rows).filter(row => row.style.display !== 'none');
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      let csv = headers.slice(0, -1).join(',') + '\n'; // Exclude Actions column
      rows.forEach(row => {
        const cells = Array.from(row.cells).slice(0, -1); // Exclude Actions column
        csv += cells.map(cell => '"' + cell.textContent.replace(/"/g, '""') + '"').join(',') + '\n';
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    document.getElementById('exportCSV').onclick = function() {
      exportTableToCSV('worker_debts.csv');
    };

    
    function exportTableToExcel(filename) {
      const rows = Array.from(tbody.rows).filter(row => row.style.display !== 'none');
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim()).slice(0, -1); // Exclude Actions
      const data = [headers];
      rows.forEach(row => {
        const cells = Array.from(row.cells).slice(0, -1); // Exclude Actions
        data.push(cells.map(cell => cell.textContent));
      });
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'WorkerDebts');
      XLSX.writeFile(wb, filename);
    }
    document.getElementById('exportExcel').onclick = function() {
      exportTableToExcel('worker_debts.xlsx');
    };

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

    


document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('tbody');

    try {
        const workers = await getAllData('workers');
        const consumptions = await getAllData('consumptions');
        
        
        const debts = workers.map(worker => {
            const workerConsumptions = consumptions.filter(c => c.workerId === worker.id);
            const totalDebt = workerConsumptions.reduce((sum, c) => sum + c.amount, 0);
            return {
                ...worker,
                totalDebt
            };
        });

        tableBody.innerHTML = ''; 
        debts.forEach((worker, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${worker.firstName} ${worker.lastName}</td>
                <td>-</td> <td>-</td> <td>-</td> <td>${worker.department}</td>
                <td>${worker.status}</td>
                <td>${worker.totalDebt}</td>
                <td>
                    <button class="btn action-btn" data-action="mark-paid" onclick="markPaid(${worker.id})">
                        <i class="fa fa-check"></i> Mark as Paid
                    </button>
                    <button class="btn action-btn" data-action="edit" onclick="editWorker(${worker.id})">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                </td>
            `;
        });

    } catch (error) {
        console.error('Failed to load worker debts:', error);
    }
});