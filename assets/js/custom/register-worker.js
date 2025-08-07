
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



document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const dob = document.getElementById('dob').value;
    const pob = document.getElementById('pob').value;
    const gender = document.getElementById('gender').value;
    const department = document.getElementById('department').value;
    const status = document.getElementById('status').value;
    // const contact = document.getElementById('contact').value;
    // const email = document.getElementById('email').value;

    const newWorker = {
        firstName,
        lastName,
        dob,
        pob,
        gender,
        department,
        status
    };

    try {
        await addData('workers', newWorker);
        alert('Worker registered successfully!');
        event.target.reset(); // Clear the form
    } catch (error) {
        alert('Failed to register worker. Check the console for details.');
    }
});