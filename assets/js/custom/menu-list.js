
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

function AddMenuStoreToHtmlTable(){
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('tbody');
    
    try {
        await openDatabase();
        const menuItems = await getAllData('menu');
        tableBody.innerHTML = ''; // Clear existing static content
        menuItems.forEach((item, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.description}</td>
                <td>${item.price}</td>
                <td>${item.day}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editItem(${item.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteItem(${item.id})">Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Failed to load menu items:', error);
    }
});
}

AddMenuStoreToHtmlTable();