

document.addEventListener('DOMContentLoaded', async () => {
    const workerSelect = document.getElementById('worker');
    // const departmentSelect = document.getElementById('department');
    // const statusSelect = document.getElementById('status');

    try {
        await openDatabase();
        const workers = await getAllData('workers');
        workers.forEach(worker => {
            const option = document.createElement('option');
            option.value = worker.id;
            option.textContent = `${worker.firstName} ${worker.lastName}`;
            workerSelect.appendChild(option);
        });
        
        
    } catch (error) {
        console.error('Failed to load workers:', error);
    }
});

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const workername = parseInt(document.getElementById('worker').value);
    const typeFood = document.getElementById('typeOfFood').value;
    const typeDrink = document.getElementById('typeOfDrink').value;
    const department = document.getElementById('department').value;
    const status = document.getElementById('status').value;
    const amountFood = parseInt(document.getElementById('amountFood').value);
    const amountDrink = parseInt(document.getElementById('amountDrink').value);
    const price = parseFloat(document.getElementById('price').value);
    const consumptiondate = document.getElementById('date').value;

    const newConsumption = {
        workername,
        typeFood,
        typeDrink,
        department,
        status,
        amountFood,
        amountDrink,
        price,
        consumptiondate
    };

    try {
        await addData('consumptions', newConsumption);
        alert('Consumption registered successfully!');
        event.target.reset();
    } catch (error) {
        alert('Failed to register consumption. Check the console for details.');
    }
});