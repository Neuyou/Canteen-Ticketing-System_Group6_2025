
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
      exportTableToCSV('worker_list.csv');
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
      XLSX.utils.book_append_sheet(wb, ws, 'WorkerList');
      XLSX.writeFile(wb, filename);
    }
    document.getElementById('exportExcel').onclick = function() {
      exportTableToExcel('worker_list.xlsx');
    };


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


fetch('../../components/footer.html').then(res => res.text()).then(data => {
      document.getElementById('footer-include').innerHTML = data;
      const yearSpan = document.getElementById('footerYear');
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
            let totalconsumed = 0;
            const row = tableBody.insertRow();
            consumption.forEach((consume) => {
              if((worker.firstName + worker.lastName) === consume.worker){
                 totalconsumed += consume.price;
              }
            });
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${worker.firstName} ${worker.lastName}</td>
                <td>${totalconsumed}</td>
                <td>${worker.department}</td>
                <td>${worker.status}</td>
            `;
        });
    } catch (error) {
        console.error('Failed to load workers:', error);
    }
});