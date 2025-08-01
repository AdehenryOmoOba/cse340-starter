'use strict'

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList")
if (classificationList) {
  classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value
    const loadingSpinner = document.getElementById("loadingSpinner");
    const inventoryDisplay = document.getElementById("inventoryDisplay");
    
    // If no classification is selected, clear the table and hide spinner
    if (!classification_id) {
      if (loadingSpinner) loadingSpinner.style.display = "none";
      if (inventoryDisplay) inventoryDisplay.innerHTML = "";
      return;
    }
    
    // Show loading spinner
    if (loadingSpinner) loadingSpinner.style.display = "block";
    if (inventoryDisplay) inventoryDisplay.innerHTML = "";
    
    let classIdURL = "/inv/getInventory/" + classification_id
    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw Error("Network response was not OK");
      })
      .then(function (data) {
        buildInventoryList(data);
        // Hide loading spinner
        if (loadingSpinner) loadingSpinner.style.display = "none";
      })
      .catch(function (error) {
        console.log('There was a problem: ', error.message)
        // Hide loading spinner on error
        if (loadingSpinner) loadingSpinner.style.display = "none";
        // Show error message in table
        if (inventoryDisplay) {
          inventoryDisplay.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #e74c3c; padding: 2rem;">Error loading inventory. Please try again.</td></tr>';
        }
      })
  })
}

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  // Set up the table labels
  let dataTable = '<thead>';
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
  dataTable += '</thead>';
  // Set up the table body
  dataTable += '<tbody>';
  // Iterate over all vehicles in the array and put each in a row
  data.forEach(function (element) {
    dataTable += `<tr><td>${element.inventory_make} ${element.inventory_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${element.inventory_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inventory_id}' title='Click to delete'>Delete</a></td></tr>`;
  })
  dataTable += '</tbody>';
  // Display the contents in the Inventory Management view
  inventoryDisplay.innerHTML = dataTable;
} 