// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }
    
    // Clear container if too many toasts
    if (toastContainer.children.length > 3) {
        toastContainer.removeChild(toastContainer.firstChild);
    }
    
    const toast = document.createElement('div');
    
    // Use Bootstrap toast classes
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Add icon based on type
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${icon} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Initialize and show Bootstrap toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    // Remove from DOM after hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Update progress bar and indicators
function updateProgress(currentStep) {
    const steps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex === -1) {
        console.error('Invalid step:', currentStep);
        return;
    }
    
    const progress = ((currentIndex + 1) / steps.length) * 100;
    
    const progressBarFill = document.getElementById('progressBarFill');
    if (progressBarFill) {
        progressBarFill.style.width = progress + '%';
    }
    
    steps.forEach((step, index) => {
        const indicator = document.getElementById(step + '-indicator');
        if (indicator) {
            if (index < currentIndex) {
                indicator.className = 'step-indicator completed';
            } else if (index === currentIndex) {
                indicator.className = 'step-indicator active';
            } else {
                indicator.className = 'step-indicator';
            }
        }
    });
}

// Form navigation
document.querySelectorAll('.next-btn').forEach(button => {
    button.addEventListener('click', function() {
        const currentStep = this.closest('.step');
        if (!currentStep) return;
        
        const nextStepId = this.getAttribute('data-next');

        if (validateStep(currentStep.id)) {
            currentStep.classList.remove('active');
            const nextStep = document.getElementById(nextStepId);
            if (nextStep) {
                nextStep.classList.add('active');
                updateProgress(nextStepId);
                
                if (nextStepId === 'step6') {
                    populateReviewData();
                }
                
                document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

document.querySelectorAll('.prev-btn').forEach(button => {
    button.addEventListener('click', function() {
        const currentStep = this.closest('.step');
        if (!currentStep) return;
        
        const prevStepId = this.getAttribute('data-prev');

        currentStep.classList.remove('active');
        const prevStep = document.getElementById(prevStepId);
        if (prevStep) {
            prevStep.classList.add('active');
            updateProgress(prevStepId);
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Step validation
function validateStep(stepId) {
    console.log('Validating step:', stepId);
    const step = document.getElementById(stepId);
    if (!step) {
        console.error('Step not found:', stepId);
        return false;
    }
    
    const inputs = step.querySelectorAll('input[required], select[required]');
    console.log('Found required inputs:', inputs.length);
    let isValid = true;
    let firstInvalid = null;

    // Remove existing invalid highlights
    step.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });

    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = document.getElementsByName(input.name);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);

            if (!isChecked) {
                isValid = false;
                if (!firstInvalid) firstInvalid = radioGroup[0];
                showToast(`Please select your ${input.name}`, 'error');
            }
        } else if (input.type === 'checkbox' && input.name === 'departments[]') {
            if (stepId === 'step3') {
                const departments = document.querySelectorAll('input[name="departments[]"]:checked');
                if (departments.length === 0) {
                    isValid = false;
                    showToast('Please select at least one department', 'warning');
                }
            }
        } else if (input.tagName === 'SELECT') {
            if (!input.value) {
                isValid = false;
                input.classList.add('is-invalid');
                if (!firstInvalid) firstInvalid = input;
                showToast('Please select an option', 'error');
            }
        } else {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
                if (!firstInvalid) firstInvalid = input;
                showToast('Please fill in all required fields', 'error');
            } else if (input.type === 'tel' && !/^\d{10}$/.test(input.value.trim())) {
                isValid = false;
                input.classList.add('is-invalid');
                if (!firstInvalid) firstInvalid = input;
                showToast('Please enter a valid 10-digit phone number', 'error');
            }
        }
    });

    // Scroll to first invalid field
    if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

// Photo upload functionality
const photoUpload = document.getElementById('photoUpload');
const photoPreview = document.getElementById('photoPreview');
const photoData = document.getElementById('photoData');
const cameraBtn = document.getElementById('cameraBtn');
const cameraContainer = document.getElementById('cameraContainer');
const cameraPreview = document.getElementById('cameraPreview');
const captureBtn = document.getElementById('captureBtn');
const cancelCameraBtn = document.getElementById('cancelCameraBtn');

let stream = null;

if (photoUpload) {
    photoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                showToast('Please select an image file', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                if (photoPreview) {
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Photo" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
                if (photoData) {
                    photoData.value = e.target.result;
                }
                showToast('Photo uploaded successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

if (cameraBtn) {
    cameraBtn.addEventListener('click', async function() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (cameraContainer) {
                cameraContainer.style.display = 'block';
            }
            if (cameraPreview) {
                cameraPreview.innerHTML = `<video autoplay playsinline style="width: 100%; max-width: 400px; height: auto; object-fit: cover;"></video>`;
                const video = cameraPreview.querySelector('video');
                video.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            showToast('Unable to access camera. Please check permissions.', 'error');
        }
    });
}

if (captureBtn) {
    captureBtn.addEventListener('click', function() {
        const video = cameraPreview?.querySelector('video');
        if (!video) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        if (photoPreview) {
            photoPreview.innerHTML = `<img src="${imageData}" alt="Captured Photo" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        if (photoData) {
            photoData.value = imageData;
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        if (cameraContainer) {
            cameraContainer.style.display = 'none';
        }
        showToast('Photo captured successfully!', 'success');
    });
}

if (cancelCameraBtn) {
    cancelCameraBtn.addEventListener('click', function() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (cameraContainer) {
            cameraContainer.style.display = 'none';
        }
        if (cameraPreview) {
            cameraPreview.innerHTML = '';
        }
    });
}

// Populate review data
function populateReviewData() {
    // Personal Information
    const surname = document.getElementById('surname')?.value || '';
    const othernames = document.getElementById('othernames')?.value || '';
    document.getElementById('reviewName').textContent = `${surname} ${othernames}`.trim() || 'Not specified';
    
    const gender = document.querySelector('input[name="gender"]:checked');
    document.getElementById('reviewGender').textContent = gender ? gender.value : 'Not specified';
    
    document.getElementById('reviewDob').textContent = document.getElementById('dob')?.value || 'Not specified';
    document.getElementById('reviewContact').textContent = document.getElementById('contact')?.value || 'Not specified';
    
    // Residence & Academic
    document.getElementById('reviewResidence').textContent = document.getElementById('residence')?.value || 'Not specified';
    document.getElementById('reviewRoom').textContent = document.getElementById('room')?.value || 'Not specified';
    document.getElementById('reviewProgram').textContent = document.getElementById('program')?.value || 'Not specified';
    
    const educationLevel = document.getElementById('education_level');
    document.getElementById('reviewEducationLevel').textContent = educationLevel?.value ? 
        educationLevel.options[educationLevel.selectedIndex].text : 'Not specified';
    
    // Membership & Departments
    const membership = document.querySelector('input[name="membership"]:checked');
    document.getElementById('reviewMembership').textContent = membership ? membership.value.toUpperCase() : 'Not specified';

    const departments = Array.from(document.querySelectorAll('input[name="departments[]"]:checked'))
        .map(dept => dept.nextElementSibling?.textContent || dept.value).join(', ');
    document.getElementById('reviewDepartments').textContent = departments || 'None selected';

    // District & Guardian
    document.getElementById('reviewDistrict').textContent = document.getElementById('district')?.value || 'Not specified';
    document.getElementById('reviewPastor').textContent = document.getElementById('pastor')?.value || 'Not specified';
    document.getElementById('reviewGuardian').textContent = document.getElementById('guardian')?.value || 'Not specified';
    document.getElementById('reviewGuardianContact').textContent = document.getElementById('guardian_contact')?.value || 'Not specified';

    // Photo
    const reviewPhoto = document.getElementById('reviewPhoto');
    if (photoData?.value) {
        reviewPhoto.innerHTML = `<img src="${photoData.value}" alt="Review Photo" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        reviewPhoto.innerHTML = '<p class="text-muted">No photo uploaded</p>';
    }
}

// Reset form to beginning
function resetFormToBeginning() {
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show first step
    const firstStep = document.getElementById('step1');
    if (firstStep) {
        firstStep.classList.add('active');
    }
    
    // Reset progress bar to step 1
    updateProgress('step1');
    
    // Reset all form fields
    const form = document.getElementById('registrationForm');
    if (form) {
        form.reset();
        
        // Additional manual reset for radio buttons and checkboxes
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
    }
    
    // Clear photo preview
    if (photoPreview) {
        photoPreview.innerHTML = '<i class="fas fa-image fa-3x text-muted mb-3"></i><p class="text-muted">Photo preview will appear here</p>';
    }
    
    // Clear photo data
    if (photoData) {
        photoData.value = '';
    }
    
    // Clear any camera streams if active
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Hide camera container if visible
    if (cameraContainer) {
        cameraContainer.style.display = 'none';
    }
    
    // Clear camera preview
    if (cameraPreview) {
        cameraPreview.innerHTML = '';
    }
    
    // Remove any validation error classes
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    // Uncheck confirm checkbox
    const confirmCheckbox = document.getElementById('confirmAccuracy');
    if (confirmCheckbox) {
        confirmCheckbox.checked = false;
    }
    
    // Scroll to top of form
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// MAIN FORM SUBMISSION HANDLER
let isSubmitting = false; // Flag to prevent duplicate submissions

document.getElementById('registrationForm')?.addEventListener('submit', function(e) {
    e.preventDefault(); // Always prevent default for AJAX
    
    // Prevent duplicate submissions
    if (isSubmitting) {
        console.log('Submission already in progress, ignoring...');
        return;
    }
    
    isSubmitting = true; // Set flag to prevent duplicates

    // Check confirmation
    const confirmCheckbox = document.getElementById('confirmAccuracy');
    if (confirmCheckbox && !confirmCheckbox.checked) {
        showToast('Please confirm that the information is accurate', 'warning');
        isSubmitting = false; // Reset flag
        return;
    }

    // Validate final step
    if (!validateStep('step6')) {
        isSubmitting = false; // Reset flag
        return;
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(this);
    
    // Debug: Log form data
    console.log('Form submission data:');
    for (let [key, value] of formData.entries()) {
        console.log(key + ':', value);
    }

    // Send AJAX request
    fetch('submit.php', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Check for success (your PHP returns 'success' boolean)
        if (data.success === true) {
            showToast(data.message || 'Registration successful!', 'success');
            
            // Reset form and start over after 2 seconds
            setTimeout(() => {
                resetFormToBeginning();
                isSubmitting = false; // Reset submission flag
                // Show additional toast after reset
                setTimeout(() => {
                    showToast('Form ready for new registration', 'info');
                }, 500);
            }, 2000);
        } else {
            // Handle error case
            showToast(data.message || 'Registration failed. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            isSubmitting = false; // Reset submission flag
        }
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        showToast('Connection error. Please check your network and try again.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        isSubmitting = false; // Reset submission flag
    });
});

// Real-time validation
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required')) {
            if (!this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        }
        
        if (this.type === 'tel' && this.value && !/^\d{10}$/.test(this.value.trim())) {
            this.classList.add('is-invalid');
        }
    });
    
    input.addEventListener('input', function() {
        if (this.type === 'tel' && this.value && /^\d{10}$/.test(this.value.trim())) {
            this.classList.remove('is-invalid');
        } else if (this.value.trim()) {
            this.classList.remove('is-invalid');
        }
    });
});

// Reset button functionality (optional)
const resetFormBtn = document.getElementById('resetFormBtn');
if (resetFormBtn) {
    resetFormBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to start over? All entered data will be lost.')) {
            resetFormToBeginning();
            showToast('Form has been reset', 'info');
        }
    });
}

// Initialize progress on page load
document.addEventListener('DOMContentLoaded', function() {
    updateProgress('step1');
});