document.addEventListener('DOMContentLoaded', function() {
  const updateBtn = document.querySelector("button[type='submit']")
  
  if (updateBtn) {
    // Enable the button since the form will have data
    updateBtn.removeAttribute("disabled")
  }
}) 