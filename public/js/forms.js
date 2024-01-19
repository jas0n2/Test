// form loading animation
const form = [...document.querySelector('.form').children];

form.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i * 100);
});

// form validation
const nameInput = document.querySelector('.name') || null;
const emailInput = document.querySelector('.email');
const passwordInput = document.querySelector('.password');
const submitBtn = document.querySelector('.submit-btn');

submitBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default form submission

    const endpoint = nameInput ? '/register-user' : '/login-user';
    const method = nameInput ? 'POST' : 'POST'; // Set to POST for both registration and login

    const requestBody = {
        email: emailInput.value,
        password: passwordInput.value,
    };

    // Add name to the requestBody if it's a registration
    if (nameInput) {
        requestBody.name = nameInput.value;
    }

    performAuthentication(endpoint, requestBody, method);
});

function performAuthentication(endpoint, requestBody, method) {
    fetch(endpoint, {
        method: method,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(requestBody)
    })
        .then(res => res.json())
        .then(data => {
            handleServerResponse(data, !!requestBody.name);
        });
}



const handleServerResponse = (data, isRegistration) => {
    if (data.success) {
      console.log('Success:', data.message);
  
      // Redirect to the specified URL or a default dashboard URL
      const redirectURL = isRegistration ? '/login.html' : (data.redirectURL || '/dashboard');
      window.location.replace(redirectURL);
    } else {
      console.error('Error:', data.error || 'Unknown error occurred.');
      displayErrorMessage(data.error || 'Unknown error occurred.');
    }
  };


  

function alertBox(data) {
    const alertContainer = document.querySelector('.alert-box');
    const alertMsg = document.querySelector('.alert');
    alertMsg.innerHTML = data;

    alertContainer.style.top = `5%`;
    setTimeout(() => {
        alertContainer.style.top = null;
    }, 5000);
}
