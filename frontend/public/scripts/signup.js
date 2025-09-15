 // DOM elements
const signupForm = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Utility functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function validateForm(formData) {
    const { firstName, lastName, email, dateOfBirth, gender, password, confirmPassword, termsAccepted } = formData;
    
    console.log('🔍 Validating form data:');
    console.log('  - First Name Length:', firstName?.length || 0);
    console.log('  - Last Name Length:', lastName?.length || 0);
    console.log('  - Email:', `"${email}"`);
    console.log('  - Date of Birth:', `"${dateOfBirth}"`);
    console.log('  - Gender:', `"${gender}"`);
    console.log('  - Password Length:', password?.length || 0);
    console.log('  - Passwords Match:', password === confirmPassword);
    console.log('  - Terms Accepted:', termsAccepted);

    if (!firstName || firstName.trim().length < 2) {
        return { isValid: false, message: 'Please enter your first name (at least 2 characters)' };
    }

    if (!lastName || lastName.trim().length < 2) {
        return { isValid: false, message: 'Please enter your last name (at least 2 characters)' };
    }

    if (!validateEmail(email)) {
        return { 
            isValid: false, 
            message: 'Please enter a valid email address' 
        };
    }

    if (!dateOfBirth) {
        return { isValid: false, message: 'Please select your date of birth' };
    }

    // Check if date is in the past and user is at least 13
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    if (birthDate > today) {
        return { isValid: false, message: 'Date of birth cannot be in the future' };
    }

    if (age < 13) {
        return { isValid: false, message: 'You must be at least 13 years old to create an account' };
    }

    if (!gender) {
        return { isValid: false, message: 'Please select your gender' };
    }

    if (!validatePassword(password)) {
        return { 
            isValid: false, 
            message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
        };
    }

    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }

    if (!termsAccepted) {
        return { isValid: false, message: 'Please accept the terms and conditions' };
    }

    return { isValid: true };
}

// Form submission handler
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    hideMessages();

    console.log('🚀 Form submitted');
    console.log('📋 Form elements:');
    console.log('  - First Name:', signupForm.firstName?.value || 'MISSING');
    console.log('  - Last Name:', signupForm.lastName?.value || 'MISSING');
    console.log('  - Email:', signupForm.email?.value || 'MISSING');
    console.log('  - Date of Birth:', signupForm.dateOfBirth?.value || 'MISSING');
    console.log('  - Gender:', signupForm.gender?.value || 'MISSING');
    console.log('  - Password:', signupForm.password?.value ? `[${signupForm.password.value.length} chars]` : 'MISSING');
    console.log('  - Confirm Password:', signupForm.confirmPassword?.value ? `[${signupForm.confirmPassword.value.length} chars]` : 'MISSING');
    console.log('  - Terms Accepted:', signupForm.termsAccepted?.checked || false);

    // Get form data
    const formData = {
        firstName: signupForm.firstName.value.trim(),
        lastName: signupForm.lastName.value.trim(),
        email: signupForm.email.value.trim().toLowerCase(),
        dateOfBirth: signupForm.dateOfBirth.value,
        gender: signupForm.gender.value,
        password: signupForm.password.value,
        confirmPassword: signupForm.confirmPassword.value,
        termsAccepted: signupForm.termsAccepted.checked
    };

    console.log('📊 Processed form data:');
    console.log('  - First Name:', `"${formData.firstName}" (${formData.firstName?.length || 0} chars)`);
    console.log('  - Last Name:', `"${formData.lastName}" (${formData.lastName?.length || 0} chars)`);
    console.log('  - Email:', `"${formData.email}" (${formData.email?.length || 0} chars)`);
    console.log('  - Date of Birth:', `"${formData.dateOfBirth}"`);
    console.log('  - Gender:', `"${formData.gender}"`);
    console.log('  - Password:', formData.password ? `[${formData.password.length} chars]` : 'EMPTY');
    console.log('  - Confirm Password:', formData.confirmPassword ? `[${formData.confirmPassword.length} chars]` : 'EMPTY');
    console.log('  - Terms Accepted:', formData.termsAccepted);

    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
        console.log('❌ Client validation failed:', validation.message);
        showError(validation.message);
        return;
    }

    console.log('✅ Client validation passed');

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        // Call signup API
        const result = await signupUser(formData);
        
        showSuccess(result.message || 'Account created successfully!');
        
        // Store token if provided
        if (result.token) {
            localStorage.setItem('authToken', result.token);
            
            if (result.user) {
                localStorage.setItem('user', JSON.stringify(result.user));
                console.log('💾 User data stored:', result.user);
            }
        }
        
        // Reset form and redirect to login after success
        setTimeout(() => {
            signupForm.reset();
            hideMessages();
            console.log('🔄 Registration successful, redirecting to login...');
            window.location.href = '/frontend/public/login.html';
        }, 2000);

    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message || 'An error occurred. Please try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
});

// API call for signup with better debugging
async function signupUser(userData) {
    // Detect if we're running from Live Server or backend server
    const isLiveServer = window.location.hostname === '127.0.0.1' && window.location.port === '5500';
    const API_BASE_URL = isLiveServer ? 'http://localhost:5000' : '';
    
    console.log('🔄 Attempting signup with:', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password ? '[HIDDEN]' : 'MISSING'
    });
    console.log('🌐 Current location:', window.location.href);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/auth/signup`);
    console.log('📍 Is Live Server:', isLiveServer);
    
    try {
        const requestBody = {
            fullName: `${userData.firstName} ${userData.lastName}`.trim(),
            email: userData.email,
            dateOfBirth: userData.dateOfBirth,
            gender: userData.gender,
            password: userData.password,
            termsAccepted: userData.termsAccepted
        };
        
        console.log('📦 Request body:');
        console.log('  - First Name:', `"${requestBody.firstName}"`);
        console.log('  - Last Name:', `"${requestBody.lastName}"`);
        console.log('  - Email:', `"${requestBody.email}"`);
        console.log('  - Date of Birth:', `"${requestBody.dateOfBirth}"`);
        console.log('  - Gender:', `"${requestBody.gender}"`);
        console.log('  - Password:', requestBody.password ? `[${requestBody.password.length} chars]` : 'MISSING');
        console.log('  - Terms Accepted:', requestBody.termsAccepted);

        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 Response status:', response.status);

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            console.error('❌ Response not OK:', response.status, response.statusText);
            
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                console.log('❌ Raw error data:', JSON.stringify(errorData, null, 2));
                
                // Handle validation errors array
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    console.log('📝 Server validation errors:');
                    errorData.errors.forEach((error, index) => {
                        console.log(`  ${index + 1}. ${error.msg || error.message || error}`);
                    });
                    errorMessage = errorData.errors.map(error => error.msg || error.message || error).join('; ');
                }
                // Handle single error message - FIXED
                else if (errorData.message || errorData.error) {
                    errorMessage = errorData.message || errorData.error;
                }
                
                console.log('📝 Processed error message:', errorMessage);
                
            } catch (jsonError) {
                console.error('❌ Could not parse error JSON:', jsonError);
                // Try to get text instead
                try {
                    const errorText = await response.text();
                    console.log('❌ Error text:', errorText);
                    if (errorText.includes('Cannot POST')) {
                        errorMessage = 'Signup endpoint not found. Please check if the server is running on port 5000.';
                    }
                } catch (textError) {
                    console.error('❌ Could not get error text:', textError);
                }
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ Success data:', data);
        return data;
        
    } catch (error) {
        console.error('🚨 API Error:', error);
        
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend server is running on port 5000.');
        }
        
        throw error;
    }
}

// Real-time validation feedback
signupForm.addEventListener('input', function(e) {
    const input = e.target;
    
    if (input.name === 'email' && input.value) {
        if (validateEmail(input.value)) {
            input.style.borderColor = '#27ae60';
        } else {
            input.style.borderColor = '#e74c3c';
        }
    }

    if (input.name === 'password' && input.value) {
        if (validatePassword(input.value)) {
            input.style.borderColor = '#27ae60';
        } else {
            input.style.borderColor = '#e74c3c';
        }
    }

    if (input.name === 'confirmPassword' && input.value) {
        const password = signupForm.password.value;
        if (input.value === password && password) {
            input.style.borderColor = '#27ae60';
        } else {
            input.style.borderColor = '#e74c3c';
        }
    }
});

// Handle login redirect
function handleLoginRedirect() {
    console.log('🔄 Redirecting to login page...');
    window.location.href = '/frontend/public/login.html';
}

// Set date input limits when page loads
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('dateOfBirth');
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0]; // Today's date
    
    // Set maximum date to today
    dateInput.setAttribute('max', maxDate);
    
    // Set minimum date to 100 years ago
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100);
    dateInput.setAttribute('min', minDate.toISOString().split('T')[0]);
    
    console.log('📅 Date input limits set:', {
        min: minDate.toISOString().split('T')[0],
        max: maxDate
    });
});