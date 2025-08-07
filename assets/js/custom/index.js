import {ConvertIntToDay, ConvertIntToMonth} from './utilities.js';

fetch('../../components/header.html').then(res => res.text()).then(data => {
      document.getElementById('header-include').innerHTML = data;
      const logoimg = document.querySelector('#header-include img.logo');
      if(logoimg){
        logoimg.src = '/assets/images/mockups/lowfidmockup.jpg';
      }
    
    });
   
    fetch('../../components/footer.html').then(res => res.text()).then(data => {
      document.getElementById('footer-include').innerHTML = data;
      const yearSpan = document.getElementById('footerYear');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    });




document.addEventListener('DOMContentLoaded', async () => {
    const foodOfToday = document.getElementById("foodOfTheDay");
    let day = new Date().getDay();

    
    try {
        await openDatabase();
        const menuItems = await getAllData('menu');
        menuItems.forEach((item) => {
            const daylist = item.day;
            console.log(daylist)
            console.log(ConvertIntToDay(day))
            if(item.day == ConvertIntToDay(day)){
            console.log(item)
             foodOfToday.innerHTML = `
                <p>ITEM NAME: ${item.name}</p>
                <p>TYPE: ${item.type}</p>
                <p>DESCRIPTION: ${item.description}</p> 
                <p>PRICE: ${item.price}</p> 
            `;
            }
            
            
        });
    } catch (error) {
        console.error('Failed to load menu items:', error);
    }
});


