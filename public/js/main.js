var productNameInp = $('#pName');
var productPriceInp = $('#pPrice');
var productCategoryInp = $('#pCat');
var productDescriptionInp = $('#pDesc');
var productQuantityInp = $('#pQuant');
var addBtn = $('#addBtn');
var resetBtn = $('#resetBtn');
var updateBtn = $('#updateBtn');
updateBtn.hide();
var inputs = $('.form-control');
var currentIndex;
var alertName = $('#alertName');
var alertPrice = $('#alertPrice');
var alertCate = $('#alertCate');
var alertDesc = $('#alertDesc');
var alertQuant= $('#alertQuant');
var searchNameInput = $('#searchName');
var searchCateInput = $('#searchCate');

var products = [];

// Function to make an AJAX request to fetch products from the server
function fetchProducts() {
    $.ajax({
        url: '/api/products',
        method: 'GET',
        success: function (data) {
            products = data;
            displayProduct();
        }
    });
}

// Fetch products when the page loads
fetchProducts();

addBtn.on('click', function () {
    if (validProductName() && validProductPrice() && validProductCate() && validProductQuant() && !isProductExist()) {
        var product = {
            name: productNameInp.val(),
            price: productPriceInp.val(),
            cate: productCategoryInp.val(),
            desc: productDescriptionInp.val(),
            quant:productQuantityInp.val(),
        };
        addProduct(product);
    } else if (isProductExist()) {
        alert('This Product already exists');
    } else {
        alert('Invalid input or empty fields');
    }
});

resetBtn.on('click', function () {
    resetForm();
    updateBtn.hide();
    addBtn.show();
});

updateBtn.on('click', function () {
    console.log('Update button clicked');
    if (validProductName() && validProductPrice() && validProductCate() && validProductQuant() && !isProductExist()) {
        var product = {
            name: productNameInp.val(),
            price: productPriceInp.val(),
            cate: productCategoryInp.val(),
            desc: productDescriptionInp.val(),
            quant: productQuantityInp.val(),
        };
        updateProduct(currentIndex, product);
    } else if (isProductExist()) {
        alert('This Product already exists');
    } else {
        alert('Invalid input or empty fields');
    }
});


// Function to make an AJAX request to add a product
function addProduct(product) {
    $.ajax({
        url: '/api/products',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(product),
        success: function (data) {
            fetchProducts(); // Fetch products again after adding
            resetForm();
        }
    });
}



// Function to make an AJAX request to update a product
function updateProduct(index, product) {
    console.log('Updating product:', index, product);
    $.ajax({
        url: `/api/products/${index + 1}`, // Assuming your API uses 1-based index
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(product),
        success: function (data) {
            console.log('Product updated successfully:', data);
            fetchProducts(); // Fetch products again after updating
            resetForm();
        },
        error: function (error) {
            console.error('Error updating product:', error);
            alert('Error updating product. Please check your input and try again.');
            // Handle error (e.g., show an alert to the user)
        }
    });
}

function displayProduct() {
    var row = '';
    for (var i = 0; i < products.length; i++) {
        row +=
            `<tr>
            <td>${i + 1}</td>
            <td>${products[i].name}</td>
            <td>${products[i].price}</td>
            <td>${products[i].cate}</td>
            <td>${products[i].desc}</td>
            <td>${products[i].quant}</td>
            <td><button class="btn btn-warning" onclick="getProductInfo(${i})">Update</button></td>
            <td><button class="btn btn-danger" onclick="deleteProduct(${i})">Delete</button></td>
        </tr>`;
    }
    $('#myTable').html(row);
}

function resetForm() {
    for (var i = 0; i < inputs.length; i++) {
        $(inputs[i]).val('');
        $(inputs[i]).removeClass('is-valid').removeClass('is-invalid');
    }
}

function deleteProduct(index) {
    var productId = products[index].id;

    // Send a DELETE request to the server to delete the product
    $.ajax({
        url: `/api/products/${productId}`,
        method: 'DELETE',
        success: function (data) {
            // On successful deletion, update the products array and re-display
            products.splice(index, 1);
            displayProduct();
        },
        error: function (error) {
            console.error('Error deleting product:', error);
        }
    });
}



    function getProductInfo(index) {
        currentIndex = index;
        var currentProduct = products[index];
        productNameInp.val(currentProduct.name).removeClass('is-invalid').removeClass('is-valid');
        productPriceInp.val(currentProduct.price).removeClass('is-invalid').removeClass('is-valid');
        productCategoryInp.val(currentProduct.cate).removeClass('is-invalid').removeClass('is-valid');
        productDescriptionInp.val(currentProduct.desc);
        productQuantityInp.val(currentProduct.quant).removeClass('is-valid is-invalid');
        updateBtn.show();
        addBtn.hide();
    }


function searchName(searchText){
    var row = '';
    for (var i = 0; i < products.length; i++){
        if(products[i].name.toLowerCase().includes(searchText.toLowerCase())){
            row +=
            `<tr>
                <td>${i+1}</td>
                <td>${products[i].name}</td>
                <td>${products[i].price}</td>
                <td>${products[i].cate}</td>
                <td>${products[i].desc}</td>
                <td>${products[i].quant}</td>
                <td><button class="btn btn-warning" onclick = "getProductInfo(${i})">Update</button></td>
                <td><button class="btn btn-danger" onclick = "deleteProduct(${i})">Delete</button></td>
            </tr>`
        }
        document.getElementById('myTable').innerHTML = row;
    }
}

function searchCate(searchText){
    var row = '';
    for (var i = 0; i < products.length; i++){
        if(products[i].cate.toLowerCase().includes(searchText.toLowerCase())){
            row +=
            `<tr>
                <td>${i+1}</td>
                <td>${products[i].name}</td>
                <td>${products[i].price}</td>
                <td>${products[i].cate}</td>
                <td>${products[i].desc}</td>
                <td>${products[i].quant}</td>
                <td><button class="btn btn-warning" onclick = "getProductInfo(${i})">Update</button></td>
                <td><button class="btn btn-danger" onclick = "deleteProduct(${i})">Delete</button></td>
            </tr>`
        }
        document.getElementById('myTable').innerHTML = row;
    }
}

function validProductDesc() {
        if (productDescriptionInp.val().trim() !== '') {
        productDescriptionInp.addClass('is-valid');
        productDescriptionInp.removeClass('is-invalid');
        alertDesc.addClass('d-none');
        return true;
    } else {
        productDescriptionInp.addClass('is-invalid');
        productDescriptionInp.removeClass('is-valid');
        alertDesc.removeClass('d-none');
        return false;
    }
}
function validProductName() {
    var regexName = /^[A-Z][a-z]{2,10}$/;
    if (regexName.test(productNameInp.val())) {
        productNameInp.addClass('is-valid');
        productNameInp.removeClass('is-invalid');
        alertName.addClass('d-none');
        return true;
    } else {
        productNameInp.addClass('is-invalid');
        productNameInp.removeClass('is-valid');
        alertName.removeClass('d-none');
        return false;
    }
}

function validProductPrice() {
    var regexPrice = /^([5-9][0-9]|[0-9][0-9][0-9]|[0-9][0-9][0-9][0-9]|10000)$/;
    if (regexPrice.test(productPriceInp.val())) {
        productPriceInp.addClass('is-valid');
        productPriceInp.removeClass('is-invalid');
        alertPrice.addClass('d-none');
        return true;
    } else {
        productPriceInp.addClass('is-invalid');
        productPriceInp.removeClass('is-valid');
        alertPrice.removeClass('d-none');
        return false;
    }
}

function validProductCate() {
    if (productCategoryInp.val().toLowerCase() === productNameInp.val().toLowerCase()) {
        productCategoryInp.addClass('is-valid');
        productCategoryInp.removeClass('is-invalid');
        alertCate.addClass('d-none');
        return true;
    } else {
        productCategoryInp.addClass('is-invalid');
        productCategoryInp.removeClass('is-valid');
        alertCate.removeClass('d-none');
        return false;
    }
}

function validProductQuant() {
        var regexQuantity = /^[1-9]\d*$/;
    if (regexQuantity.test(productQuantityInp.val())) {
        productQuantityInp.addClass('is-valid');
        productQuantityInp.removeClass('is-invalid');
        alertQuant.addClass('d-none');
        return true;
    } else {
        productQuantityInp.addClass('is-invalid');
        productQuantityInp.removeClass('is-valid');
        alertQuant.removeClass('d-none');
        return false;
    }
}

function isProductExist() {
    var inputName = productNameInp.val().toLowerCase();
    var inputCategory = productCategoryInp.val().toLowerCase();

    for (var i = 0; i < products.length; i++) {
        var existingName = products[i].name.toLowerCase();
        var existingCategory = products[i].cate.toLowerCase();

        if (existingName === inputName && existingCategory === inputCategory) {
            return true;
        }
    }

    return false;
}


productNameInp.on('input',validProductName);
productPriceInp.on('input',validProductPrice);
productCategoryInp.on('input',validProductCate);
productDescriptionInp.on('input',validProductDesc);
productQuantityInp.on('input', validProductQuant);


searchNameInput.on('keyup', function (){
    searchName(this.value);
})

searchCateInput.on('keyup', function (){
    searchCate(this.value);
})
