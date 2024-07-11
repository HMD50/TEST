document.addEventListener('DOMContentLoaded', function() {
    const clickableElements = document.querySelectorAll('.nav-link, .btn-outline-light, .categories a, .add-to-cart');
  
    clickableElements.forEach(element => {
        element.classList.add('animate__animated', 'animate__pulse');
    });
  
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const cartCount = document.getElementById('cart-count');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPrice = 0;
  
    function updateCart() {
        if (cartItemsContainer && totalPriceElement && cartCount) {
            cartItemsContainer.innerHTML = '';
            totalPrice = 0;
            let totalQuantity = 0;
  
            cart.forEach((product, index) => {
                if (!product.quantity) {
                    product.quantity = 1;
                }
  
                const productElement = document.createElement('div');
                productElement.classList.add('col', 'mb-5');
                productElement.innerHTML = `
                    <div class="card h-100">
                        <span class="remove-item" onclick="removeItem(${index})">&times;</span>
                        <img class="card-img-top" src="${product.img}" alt="${product.name}">
                        <div class="card-body p-4">
                            <div class="text-center">
                                <h5 class="fw-bolder">${product.name}</h5>
                                ${product.price}$ × <span class="quantity">${product.quantity}</span>
                                <div class="quantity-control">
                                    <button onclick="changeQuantity(${index}, -1)">-</button>
                                    <span>${product.quantity}</span>
                                    <button onclick="changeQuantity(${index}, 1)">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(productElement);
                totalPrice += parseFloat(product.price) * product.quantity;
                totalQuantity += product.quantity;
            });
  
            totalPriceElement.textContent = `إجمالي السعر: ${totalPrice.toFixed(2)}$`;
            cartCount.textContent = totalQuantity;
        }
    }
  
    window.removeItem = function(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
  
    window.changeQuantity = function(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
  
    updateCart();
  
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const product = {
                name: button.getAttribute('data-name'),
                price: button.getAttribute('data-price'),
                img: button.getAttribute('data-img'),
                quantity: 1
            };
  
            const existingProductIndex = cart.findIndex(item => item.name === product.name);
            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push(product);
            }
  
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
  
            // إضافة تأثير الانتقال للمنتج
            const productImage = button.closest('.card').querySelector('.card-img-top');
            const productImageClone = productImage.cloneNode(true);
            const productImagePosition = productImage.getBoundingClientRect();
            productImageClone.style.position = 'fixed';
            productImageClone.style.left = `${productImagePosition.left}px`;
            productImageClone.style.top = `${productImagePosition.top}px`;
            productImageClone.style.width = `${productImagePosition.width}px`;
            productImageClone.style.height = `${productImagePosition.height}px`;
            productImageClone.style.transition = 'all 1s ease-in-out';
            document.body.appendChild(productImageClone);
  
            setTimeout(() => {
                const cartIcon = document.querySelector('.cart-icon');
                const cartIconPosition = cartIcon.getBoundingClientRect();
                productImageClone.style.left = `${cartIconPosition.left}px`;
                productImageClone.style.top = `${cartIconPosition.top}px`;
                productImageClone.style.width = '20px';
                productImageClone.style.height = '20px';
                productImageClone.style.opacity = '0';
            }, 10);
  
            setTimeout(() => {
                productImageClone.remove();
            }, 1010);
        });
    });
  
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} animate__animated animate__fadeIn`;
        alertDiv.role = 'alert';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.classList.add('animate__fadeOut');
            setTimeout(() => {
                alertDiv.remove();
            }, 500); // الانتظار حتى يكتمل تأثير fadeOut
        }, 800); // مدة العرض قبل الاختفاء
    }
  
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
  
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem('verificationCode', verificationCode);
            localStorage.setItem('unverifiedUser', JSON.stringify({ email, password }));
  
            const templateParams = {
                user_email: email,
                verification_code: verificationCode
            };
  
            emailjs.send('service_upg05t4', 'template_mx1esvm', templateParams)
                .then(function(response) {
                    console.log('Email sent successfully!', response.status, response.text);
                    showAlert('تم إرسال رمز التحقق إلى بريدك الإلكتروني.', 'success');
                    setTimeout(() => window.location.href = 'verify.html', 1000); // إعادة التوجيه بعد أقل من ثانية
                }, function(error) {
                    console.error('Failed to send email:', error);
                    showAlert('فشل في إرسال البريد الإلكتروني.', 'danger');
                });
  
            const adminTemplateParams = {
                admin_email: 'admin-email@example.com',
                new_user_email: email
            };
  
            emailjs.send('service_upg05t4', 'template_ft7cwe6', adminTemplateParams)
                .then(function(response) {
                    console.log('Admin notification sent successfully!', response.status, response.text);
                }, function(error) {
                    console.error('Failed to send admin notification:', error);
                });
        });
    }
  
    const verifyForm = document.getElementById('verifyForm');
    if (verifyForm) {
        verifyForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const code = document.getElementById('verificationCode').value;
            const storedCode = localStorage.getItem('verificationCode');
  
            if (code === storedCode) {
                const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser'));
                localStorage.setItem(unverifiedUser.email, JSON.stringify({ password: unverifiedUser.password, verified: true }));
                localStorage.removeItem('unverifiedUser');
                localStorage.removeItem('verificationCode');
                showAlert('تم التحقق من الحساب بنجاح!', 'success');
                localStorage.setItem('loggedIn', true);
                setTimeout(() => window.location.href = 'index.html', 1000); // إعادة التوجيه بعد أقل من ثانية
            } else {
                showAlert('رمز التحقق غير صحيح.', 'danger');
            }
        });
    }
  });
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const user = JSON.parse(localStorage.getItem(email));
        if (user && user.password === password && user.verified) {
            localStorage.setItem('loggedIn', true);
            window.location.href = 'index.html';
        } else {
            showAlert('البريد الإلكتروني أو كلمة المرور غير صحيحة أو الحساب غير مفعل.', 'danger');
        }
    });
  }
  
  function showRegisterForm() {
    const loginFormContainer = document.getElementById('loginForm')?.parentElement.parentElement.parentElement;
    const registerFormContainer = document.getElementById('registerFormContainer');
    if (loginFormContainer && registerFormContainer) {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'flex';
    }
  }
  
  function showLoginForm() {
    const loginFormContainer = document.getElementById('loginForm')?.parentElement.parentElement.parentElement;
    const registerFormContainer = document.getElementById('registerFormContainer');
    if (loginFormContainer && registerFormContainer) {
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'flex';
    }
  }
  
  // تهيئة EmailJS باستخدام معرف المستخدم
  (function(){
    emailjs.init("3_YpJUhbVoAR4VoVt");
  })();
  