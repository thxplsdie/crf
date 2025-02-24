document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bookingForm');
    const steps = form.querySelectorAll('.form-step');
    const dots = document.querySelectorAll('.step-dot');
    let currentStep = 1;

    // Set initial progress text
    document.getElementById('progress-percentage').textContent = '25% Complete';

    // Generate time options for pickup and return time selects
    function generateTimeOptions() {
        const timeSelects = [document.getElementById('pickupTime'), document.getElementById('returnTime')];
        
        // Generate times for 24 hours with 30-minute intervals
        for (let hour = 0; hour < 24; hour++) {
            for (let minutes of ['00', '30']) {
                let displayHour = hour % 12;
                displayHour = displayHour === 0 ? 12 : displayHour;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const timeDisplay = `${displayHour}:${minutes} ${ampm}`;
                const timeValue = `${hour.toString().padStart(2, '0')}:${minutes}`;
                
                const option = new Option(timeDisplay, timeValue);
                
                timeSelects.forEach(select => {
                    select.add(option.cloneNode(true));
                });
            }
        }
    }

    // Initialize time options
    generateTimeOptions();

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    pickupDate.min = today;
    returnDate.min = today;

    function showStep(stepNumber) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const nextStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        
        // Hide all steps first
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            step.style.transform = 'translateX(-20px)';
            step.style.opacity = '0';
            step.style.display = 'none';
        });
        
        // Show and animate the target step
        nextStepElement.classList.add('active');
        nextStepElement.style.display = 'block';
        setTimeout(() => {
            nextStepElement.style.transform = 'translateX(0)';
            nextStepElement.style.opacity = '1';
        }, 50);

        // Update dots
        dots.forEach(dot => {
            const dotStep = parseInt(dot.dataset.step);
            dot.classList.remove('active', 'completed');
            if (dotStep === stepNumber) {
                dot.classList.add('active');
            } else if (dotStep < stepNumber) {
                dot.classList.add('completed');
            }
        });

        // Update progress percentage
        const percentage = Math.round((stepNumber / 4) * 100);
        document.getElementById('progress-percentage').textContent = `${percentage}% Complete`;

        // Update navigation buttons visibility
        const currentNav = nextStepElement.querySelector('.form-navigation');
        if (currentNav) {
            const prevButton = currentNav.querySelector('.btn-prev');
            const nextButton = currentNav.querySelector('.btn-next');
            const submitButton = currentNav.querySelector('button[type="submit"]');

            if (prevButton) {
                prevButton.style.display = stepNumber === 1 ? 'none' : 'flex';
            }
            if (nextButton) {
                nextButton.style.display = stepNumber === 4 ? 'none' : 'flex';
            }
            if (submitButton) {
                submitButton.style.display = stepNumber === 4 ? 'flex' : 'none';
            }
        }

        // Update summary if moving to step 4
        if (stepNumber === 4) {
            updateSummary();
        }

        currentStep = stepNumber;
    }

    function updateSummary() {
        // Vehicle details
        const selectedCar = document.querySelector('input[name="carType"]:checked');
        document.getElementById('summary-car-type').textContent = selectedCar ? selectedCar.value : '-';
        document.getElementById('summary-transmission').textContent = document.getElementById('transmission').value;

        // Rental details
        document.getElementById('summary-pickup-location').textContent = document.getElementById('pickupLocation').value;
        document.getElementById('summary-return-location').textContent = document.getElementById('returnLocation').value;
        
        // Format pickup datetime
        const formatTimeForSummary = (time) => {
            if (!time) return '';
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        };

        const pickupTime = document.getElementById('pickupTime').value;
        const pickupTimeFormatted = formatTimeForSummary(pickupTime);
        document.getElementById('summary-pickup-datetime').textContent = 
            `${document.getElementById('pickupDate').value} ${pickupTimeFormatted}`;

        const returnTime = document.getElementById('returnTime').value;
        const returnTimeFormatted = formatTimeForSummary(returnTime);
        document.getElementById('summary-return-datetime').textContent = 
            `${document.getElementById('returnDate').value} ${returnTimeFormatted}`;

        // New rental details
        document.getElementById('summary-passengers').textContent = document.getElementById('passengers').value;
        document.getElementById('summary-age').textContent = document.getElementById('age').value;
        document.getElementById('summary-international').textContent = document.getElementById('international').value;

        // Personal details
        document.getElementById('summary-name').textContent = document.getElementById('fullName').value;
        document.getElementById('summary-email').textContent = document.getElementById('email').value;
        document.getElementById('summary-phone').textContent = iti.getNumber(); // Use intl-tel-input's formatted number

        // New personal details
        document.getElementById('summary-first-visit').textContent = document.getElementById('firstVisit').value;
        document.getElementById('summary-occasion').textContent = document.getElementById('occasion').value || 'N/A';
        document.getElementById('summary-referral').textContent = document.getElementById('referral').value;
        document.getElementById('summary-questions').textContent = document.getElementById('questions').value || 'None';
    }

    // Validation functions
    const validators = {
        fullName: (value) => {
            return value.trim().length >= 2 ? '' : 'Please enter your full name';
        },
        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? '' : 'Please enter a valid email address';
        },
        phone: (value) => {
            return iti.isValidNumber() ? '' : 'Please enter a valid phone number';
        },
        zipCode: (value) => {
            return value.trim().length >= 3 ? '' : 'Please enter a valid zip/postal code';
        },
        carType: () => {
            const selected = document.querySelector('input[name="carType"]:checked');
            return selected ? '' : 'Please select a vehicle type';
        },
        transmission: (value) => {
            return value ? '' : 'Please select a transmission type';
        },
        // Add new validators for step 2
        pickupLocation: (value) => {
            return value ? '' : 'Please select a pickup location';
        },
        pickupDate: (value) => {
            if (!value) return 'Please select a pickup date';
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate >= today ? '' : 'Pickup date cannot be in the past';
        },
        pickupTime: (value) => {
            return value ? '' : 'Please select a pickup time';
        },
        returnLocation: (value) => {
            return value ? '' : 'Please select a return location';
        },
        returnDate: (value) => {
            if (!value) return 'Please select a return date';
            const pickupDate = new Date(document.getElementById('pickupDate').value);
            const returnDate = new Date(value);
            return returnDate >= pickupDate ? '' : 'Return date must be after pickup date';
        },
        returnTime: (value) => {
            return value ? '' : 'Please select a return time';
        },
        passengers: (value) => {
            const num = parseInt(value);
            return (num >= 0 && num <= 20) ? '' : 'Please enter a valid number of passengers (0-20)';
        },
        age: (value) => {
            return value ? '' : 'Please confirm your age';
        },
        international: (value) => {
            return value ? '' : 'Please select yes or no';
        },
        // Add validators for Step 3 fields
        firstVisit: (value) => {
            return value ? '' : 'Please select yes or no';
        },
        referral: (value) => {
            return value ? '' : 'Please tell us how you heard about us';
        }
    };

    // Show error for a field
    function showError(field, message) {
        const formGroup = field.closest('.form-group') || field.closest('.transmission-select');
        if (!formGroup) return;

        formGroup.classList.add('has-error');
        formGroup.classList.remove('is-valid');
        
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        field.setAttribute('aria-invalid', 'true');
    }

    // Clear error for a field
    function clearError(field) {
        const formGroup = field.closest('.form-group') || field.closest('.transmission-select');
        if (!formGroup) return;

        formGroup.classList.remove('has-error');
        formGroup.classList.add('is-valid');
        
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        field.setAttribute('aria-invalid', 'false');
    }

    // Validate a single field
    function validateField(field) {
        const validator = validators[field.id];
        if (!validator) return true;

        const error = validator(field.value);
        if (error) {
            showError(field, error);
            return false;
        } else {
            clearError(field);
            return true;
        }
    }

    // Validate current step
    function validateStep(step) {
        const fields = step.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        // Special handling for car type radio buttons in step 1
        if (step.dataset.step === '1') {
            const carTypeError = validators.carType();
            if (carTypeError) {
                isValid = false;
                document.querySelector('.car-options').classList.add('has-error');
            } else {
                document.querySelector('.car-options').classList.remove('has-error');
            }
        }

        return isValid;
    }

    // Add event listeners for real-time validation
    document.querySelectorAll('input, select').forEach(field => {
        if (field.id && validators[field.id]) {  // Only add listeners for fields with validators
            field.addEventListener('blur', () => {
                if (field.required) {
                    validateField(field);
                }
            });

            field.addEventListener('input', () => {
                if (field.required && field.closest('.form-group')?.classList.contains('has-error')) {
                    validateField(field);
                }
            });

            field.addEventListener('change', () => {
                if (field.required) {
                    validateField(field);
                }
            });
        }
    });

    // Add special validation for date fields
    document.getElementById('pickupDate').addEventListener('change', function() {
        validateField(this);
        const returnDate = document.getElementById('returnDate');
        returnDate.min = this.value;
        if (returnDate.value) {
            validateField(returnDate);
        }
    });

    document.getElementById('returnDate').addEventListener('change', function() {
        validateField(this);
    });

    // Update form submission handling
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentStep = document.querySelector('.form-step.active');
        if (!validateStep(currentStep)) {
            return;
        }

        // Rest of your form submission code...
    });

    // Update next button click handler
    document.querySelectorAll('.btn-next').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const currentStepNumber = parseInt(currentStep.dataset.step);
            
            if (validateStep(currentStep)) {
                showStep(currentStepNumber + 1);
            }
        });
    });

    // Update previous button click handler
    document.querySelectorAll('.btn-prev').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const currentStepNumber = parseInt(currentStep.dataset.step);
            showStep(currentStepNumber - 1);
        });
    });

    // Edit button handlers
    document.querySelectorAll('.edit-step').forEach(button => {
        button.addEventListener('click', () => {
            const stepToGo = parseInt(button.dataset.goto);
            showStep(stepToGo);
        });
    });

    // Date validation
    pickupDate.addEventListener('change', function() {
        returnDate.min = this.value;
        if (returnDate.value && returnDate.value < this.value) {
            returnDate.value = this.value;
        }
    });

    // Initialize international phone input
    const phoneInput = document.querySelector("#phone");
    const iti = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        geoIpLookup: callback => {
            fetch("https://ipapi.co/json")
                .then(res => res.json())
                .then(data => callback(data.country_code))
                .catch(() => callback("us")); // Default to Ireland if geolocation fails
        },
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        customPlaceholder: () => "" // Remove placeholder text completely
    });

    // Add validation on form submit
    const formSubmit = document.querySelector("form");
    formSubmit.addEventListener("submit", function(e) {
        if (!iti.isValidNumber()) {
            e.preventDefault();
            phoneInput.classList.add("error");
            // You can add more error handling here if needed
        } else {
            phoneInput.classList.remove("error");
        }
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate age one final time
        if (document.getElementById('age').value === 'no') {
            alert('You must be over 25 years old to rent a vehicle');
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Prepare data for Zapier
        const formData = {
            carType: document.querySelector('input[name="carType"]:checked').value,
            transmission: document.getElementById('transmission').value,
            pickupLocation: document.getElementById('pickupLocation').value,
            pickupDate: document.getElementById('pickupDate').value,
            pickupTime: formatTime(document.getElementById('pickupTime').value),
            returnLocation: document.getElementById('returnLocation').value,
            returnDate: document.getElementById('returnDate').value,
            returnTime: formatTime(document.getElementById('returnTime').value),
            passengers: document.getElementById('passengers').value,
            age: document.getElementById('age').value,
            international: document.getElementById('international').value,
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: iti.getNumber(), // Use intl-tel-input's formatted number
            zipCode: document.getElementById('zipCode').value,
            firstVisit: document.getElementById('firstVisit').value,
            occasion: document.getElementById('occasion').value || 'N/A',
            referral: document.getElementById('referral').value,
            questions: document.getElementById('questions').value || 'None'
        };

        // Send to Zapier webhook
        fetch('https://hooks.zapier.com/hooks/catch/9405168/2ftxhhl/', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'no-cors'
        })
        .then(() => {
            // Redirect to Google
            window.location.href = document.getElementById('redirect-url').value;
        })
        .catch(error => {
            alert('There was an error submitting the form. Please try again.');
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Send Inquiry';
        });
    });
}); 
