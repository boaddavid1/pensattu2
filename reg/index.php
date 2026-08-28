<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="pns.svg" type="image/svg+xml">
    <title>PENSA TTU - Registration Portal</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Add this line after your other font links -->
    <link href="https://fonts.googleapis.com/css2?family=Camood&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">

</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo-container">
                <!-- SVG Logo -->
                <img src="pns.png" alt="PENSA Logo" class="logo-svg"
                    style="height: 90px; width: auto; margin-right: 20px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">

                <div class="logo-text">
                    <h1 style="font-family: 'Camood', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">PENSA TTU</h1>
                    <p style="font-family: 'Camood', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Pentecost
                        Students and Associates</p>
                </div>
            </div>
        </div>
        <!-- Progress Bar -->
        <div class="progress-container">
            <div class="progress-steps">
                <div class="progress-bar-fill" id="progressBarFill" style="width: 16.66%;"></div>
                <div class="step-wrapper">
                    <div class="step-indicator active" id="step1-indicator">1</div>
                    <div class="step-label">Personal</div>
                </div>
                <div class="step-wrapper">
                    <div class="step-indicator" id="step2-indicator">2</div>
                    <div class="step-label">Residence</div>
                </div>
                <div class="step-wrapper">
                    <div class="step-indicator" id="step3-indicator">3</div>
                    <div class="step-label">Depts</div>
                </div>
                <div class="step-wrapper">
                    <div class="step-indicator" id="step4-indicator">4</div>
                    <div class="step-label">Guardian</div>
                </div>
                <div class="step-wrapper">
                    <div class="step-indicator" id="step5-indicator">5</div>
                    <div class="step-label">Photo</div>
                </div>
                <div class="step-wrapper">
                    <div class="step-indicator" id="step6-indicator">6</div>
                    <div class="step-label">Review</div>
                </div>
            </div>
        </div>

        <!-- Toast Container for Notifications -->
        <div class="toast-container" id="toastContainer"></div>

        <div class="form-container">
            <form id="registrationForm" action="submit.php" method="POST" enctype="multipart/form-data">
                <!-- Step 1: Personal Information -->
                <div class="step active" id="step1">
                    <h3 class="section-title"><i class="fas fa-user me-2"></i>Personal Information</h3>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="surname" class="form-label required-field">SURNAME</label>
                            <input type="text" class="form-control" id="surname" name="surname" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="othernames" class="form-label required-field">OTHER NAMES</label>
                            <input type="text" class="form-control" id="othernames" name="othernames" required>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label required-field">GENDER</label>
                            <div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" id="male" name="gender" value="male"
                                        required>
                                    <label class="form-check-label" for="male">Male</label>
                                </div><br>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" id="female" name="gender"
                                        value="female">
                                    <label class="form-check-label" for="female">Female</label>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="dob" class="form-label required-field">DATE OF BIRTH</label>
                            <input type="date" class="form-control" id="dob" name="dob" required max="<?php echo date('Y-m-d'); ?>">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="contact" class="form-label required-field">CONTACT(S)</label>
                            <input type="tel" class="form-control" id="contact" name="contact" required
                                pattern="[0-9]{10}">
                        </div>
                    </div>

                    <div class="navigation-buttons">
                        <div></div>
                        <button type="button" class="btn btn-primary next-btn" data-next="step2">
                            Next <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 2: Residence and Academic Information -->
                <div class="step" id="step2">
                    <h3 class="section-title"><i class="fas fa-home me-2"></i>Residence Information</h3>
                    
                    <!-- Campus Residence Question - NEW -->
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <div class="card p-3 bg-light">
                                <label class="form-label required-field fw-bold">CAMPUS RESIDENCE</label>
                                <div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" id="campus_yes" name="campus_residence" value="yes" required>
                                        <label class="form-check-label" for="campus_yes">Yes (I live on campus)</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" id="campus_no" name="campus_residence" value="no" required>
                                        <label class="form-check-label" for="campus_no">No (I live off campus)</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Campus Hall Selection (shown if Yes selected) -->
                    <div id="campusHallSection" style="display: none;">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="campus_hall" class="form-label required-field">SELECT CAMPUS HALL</label>
                                <select class="form-select" id="campus_hall" name="campus_hall">
                                    <option value="">Select Hall</option>
                                    <option value="Nzema">Nzema Hall</option>
                                    <option value="Ahant">Ahant Hall</option>
                                    <option value="SRC Complex">SRC Complex</option>
                                    <option value="University Hall">University Hall</option>
                                    <option value="Pro. Dancan">Pro. Dancan Hall</option>
                                    <option value="Getfund">Getfund Hall</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="room_campus" class="form-label required-field">ROOM NUMBER</label>
                                <input type="text" class="form-control" id="room_campus" name="room_campus" placeholder="e.g., Block A, Room 101">
                            </div>
                        </div>
                    </div>

                    <!-- Off-Campus Location (shown if No selected) -->
                    <div id="offCampusSection" style="display: none;">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="offcampus_location" class="form-label required-field">HOSTEL/LOCATION NAME</label>
                                <input type="text" class="form-control" id="offcampus_location" name="offcampus_location" placeholder="e.g., Crystal Hostel, Top Hill">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="room_offcampus" class="form-label required-field">ROOM NUMBER</label>
                                <input type="text" class="form-control" id="room_offcampus" name="room_offcampus" placeholder="e.g., Room 12, Flat 3">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 mb-3">
                                <label for="landmark" class="form-label">LANDMARK/ADDRESS (Optional)</label>
                                <input type="text" class="form-control" id="landmark" name="landmark" placeholder="e.g., Behind the mall, near police station">
                            </div>
                        </div>
                    </div>

                    <!-- Hidden field to store the final residence value -->
                    <input type="hidden" id="residence" name="residence">
                    <input type="hidden" id="room" name="room">

                    <h3 class="section-title mt-4"><i class="fas fa-graduation-cap me-2"></i>Academic Information</h3>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="program" class="form-label required-field">PROGRAM OF STUDY</label>
                            <input type="text" class="form-control" id="program" name="program" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="education_level" class="form-label required-field">EDUCATION LEVEL</label>
                            <select class="form-select" id="education_level" name="education_level" required>
                                <option value="">Select Level</option>
                                <option value="100">Level 100</option>
                                <option value="200">Level 200</option>
                                <option value="300">Level 300</option>
                                <option value="400">Level 400</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Duration of Program -->
                    <div class="row mt-3">
                        <div class="col-md-6 mb-3">
                            <label for="program_duration" class="form-label required-field">DURATION OF PROGRAM</label>
                            <select class="form-select" id="program_duration" name="program_duration" required>
                                <option value="">Select Duration</option>
                                <option value="B-TECH">B-TECH</option>
                                <option value="HND">HND</option>
                                <option value="Diploma">Diploma</option>
                            </select>
                        </div>
                    </div>

                    <div class="navigation-buttons">
                        <button type="button" class="btn btn-secondary prev-btn" data-prev="step1">
                            <i class="fas fa-arrow-left me-2"></i> Previous
                        </button>
                        <button type="button" class="btn btn-primary next-btn" data-next="step3">
                            Next <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 3: Membership and Departments -->
                <div class="step" id="step3">
                    <h3 class="section-title"><i class="fas fa-users me-2"></i>Membership Type</h3>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" id="member" name="membership"
                                    value="member" required>
                                <label class="form-check-label" for="member">MEMBER</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" id="associate" name="membership"
                                    value="associate">
                                <label class="form-check-label" for="associate">ASSOCIATE</label>
                            </div>
                        </div>
                    </div>

                    <!-- Church Officer Section -->
                    <h3 class="section-title mt-4"><i class="fas fa-church me-2"></i>Church Leadership</h3>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <div class="card p-3 bg-light">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="is_officer" name="is_officer" value="yes">
                                    <label class="form-check-label fw-bold" for="is_officer">
                                        Are you an officer of the church?
                                    </label>
                                </div>
                                <div id="officerDetails" style="display: none;" class="mt-3 ms-4">
                                    <label class="form-label">Select your role:</label>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" id="elder" name="officer_role" value="Elder">
                                                <label class="form-check-label" for="elder">Elder</label>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" id="deacon" name="officer_role" value="Deacon">
                                                <label class="form-check-label" for="deacon">Deacon</label>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" id="deaconess" name="officer_role" value="Deaconess">
                                                <label class="form-check-label" for="deaconess">Deaconess</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 class="section-title mt-4">
                        <i class="fas fa-sitemap me-2"></i>Departments of Interest
                    </h3>

                    <div class="department-group">
                        <p class="department-title mb-3">
                            <i class="fas fa-hand-point-right me-2 text-primary"></i>
                            Select department(s) you're interested in:
                        </p>
                        
                        <div class="row g-3">
                            <!-- Media & Communications -->
                            <div class="col-md-4">
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="media" name="departments[]" value="media">
                                    <label class="form-check-label" for="media">MEDIA DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="publicity" name="departments[]" value="publicity">
                                    <label class="form-check-label" for="publicity">PUBLICITY DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="technical" name="departments[]" value="technical">
                                    <label class="form-check-label" for="technical">TECHNICAL DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="organizing" name="departments[]" value="organizing">
                                    <label class="form-check-label" for="organizing">ORGANIZING DEPT.</label>
                                </div>
                                <!-- Changed from INFO DESK to SECRETARIAL DESK -->
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="secretarial" name="departments[]" value="secretarial">
                                    <label class="form-check-label" for="secretarial">SECRETARIAL DESK</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="alumni" name="departments[]" value="alumni">
                                    <label class="form-check-label" for="alumni">ALUMNI DEPT.</label>
                                </div>
                                <!-- NEW: Editorial Board -->
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="editorial" name="departments[]" value="editorial">
                                    <label class="form-check-label" for="editorial">EDITORIAL BOARD</label>
                                </div>
                            </div>

                            <!-- Spiritual & Fellowship -->
                            <div class="col-md-4">
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="prayer" name="departments[]" value="prayer">
                                    <label class="form-check-label" for="prayer">PRAYER DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="evangelism" name="departments[]" value="evangelism">
                                    <label class="form-check-label" for="evangelism">EVANGELISM DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="child" name="departments[]" value="child">
                                    <label class="form-check-label" for="child">CHILD EVANG.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="music" name="departments[]" value="music">
                                    <label class="form-check-label" for="music">MUSIC & DRAMA DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="political" name="departments[]" value="political">
                                    <label class="form-check-label" for="political">POLITICAL CHAMBER</label>
                                </div>
                                 <!-- NEW: Special Needs -->
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="special_needs" name="departments[]" value="special_needs">
                                    <label class="form-check-label" for="special_needs">SPECIAL NEEDS DEPT.</label>
                                </div>
                                 <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="bible_studies" name="departments[]" value="bible_studies">
                                    <label class="form-check-label" for="bible_studies">BIBLE STUDIES.</label>
                                    
                                </div>
                            </div>

                            <!-- Service & Wings -->
                            <div class="col-md-4">
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="pemosca" name="departments[]" value="pemosca">
                                    <label class="form-check-label" for="pemosca">PEMOSCA</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="ushering" name="departments[]" value="ushering">
                                    <label class="form-check-label" for="ushering">USHERING DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="welfare" name="departments[]" value="welfare">
                                    <label class="form-check-label" for="welfare">WELFARE DEPT.</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="ladies" name="departments[]" value="ladies">
                                    <label class="form-check-label" for="ladies">LADIES WING</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="gents" name="departments[]" value="gents">
                                    <label class="form-check-label" for="gents">GENTS WING</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="schools" name="departments[]" value="schools">
                                    <label class="form-check-label" for="schools">SCHOOLS CORD.</label>
                                </div>
                                <!-- NEW: Professional Guild -->
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="professional" name="departments[]" value="professional">
                                    <label class="form-check-label" for="professional">PROFESSIONAL GUILD</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3 text-muted small">
                            <i class="fas fa-info-circle me-1"></i>
                            You can select multiple departments
                        </div>
                    </div>
                    
                    <div class="navigation-buttons">
                        <button type="button" class="btn btn-secondary prev-btn" data-prev="step2">
                            <i class="fas fa-arrow-left me-2"></i> Previous
                        </button>
                        <button type="button" class="btn btn-primary next-btn" data-next="step4">
                            Next <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 4: District and Guardian Information -->
                <div class="step" id="step4">
                    <h3 class="section-title"><i class="fas fa-church me-2"></i>District Information</h3>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="district" class="form-label required-field">DISTRICT</label>
                            <input type="text" class="form-control" id="district" name="district" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="pastor" class="form-label required-field">NAME OF DISTRICT PASTOR</label>
                            <input type="text" class="form-control" id="pastor" name="pastor" required>
                        </div>
                    </div>

                    <h3 class="section-title mt-4"><i class="fas fa-user-shield me-2"></i>Guardian Information</h3>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="guardian" class="form-label required-field">NAME OF GUARDIAN</label>
                            <input type="text" class="form-control" id="guardian" name="guardian" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="guardian_contact" class="form-label required-field">CONTACT OF GUARDIAN</label>
                            <input type="tel" class="form-control" id="guardian_contact" name="guardian_contact"
                                required pattern="[0-9]{10}">
                        </div>
                    </div>

                    <div class="navigation-buttons">
                        <button type="button" class="btn btn-secondary prev-btn" data-prev="step3">
                            <i class="fas fa-arrow-left me-2"></i> Previous
                        </button>
                        <button type="button" class="btn btn-primary next-btn" data-next="step5">
                            Next <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 5: Photo Upload/Capture -->
                <div class="step" id="step5">
                    <h3 class="section-title"><i class="fas fa-camera me-2"></i>Photo Upload/Capture</h3>

                    <div class="photo-container">
                        <div id="photoPreview">
                            <i class="fas fa-image fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Photo preview will appear here</p>
                        </div>

                        <div class="d-flex flex-column align-items-center">
                            <div class="mb-3 d-flex gap-3">
                                <label for="photoUpload" class="btn btn-outline-primary">
                                    <i class="fas fa-upload me-2"></i>Upload Photo
                                </label>
                                <input type="file" id="photoUpload" accept="image/*" style="display: none;">

                                <button type="button" id="cameraBtn" class="btn btn-outline-primary">
                                    <i class="fas fa-camera me-2"></i>Take Photo
                                </button>
                            </div>

                            <div id="cameraContainer" style="display: none;">
                                <div id="cameraPreview"></div>
                                <div class="camera-controls mt-3">
                                    <button type="button" id="captureBtn" class="btn btn-primary">
                                        <i class="fas fa-camera me-2"></i>Capture
                                    </button>
                                    <button type="button" id="cancelCameraBtn" class="btn btn-secondary">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <input type="hidden" id="photoData" name="photoData">

                    <div class="navigation-buttons">
                        <button type="button" class="btn btn-secondary prev-btn" data-prev="step4">
                            <i class="fas fa-arrow-left me-2"></i> Previous
                        </button>
                        <button type="button" class="btn btn-primary next-btn" data-next="step6">
                            Next <i class="fas fa-arrow-right ms-2"></i>
                        </button>
                    </div>
                </div>

                <!-- Step 6: Review Information -->
                <div class="step" id="step6">
                    <h3 class="section-title"><i class="fas fa-check-circle me-2"></i>Review Information</h3>

                    <div class="review-data">
                        <h4 class="mb-3">Personal Information</h4>
                        <p><span class="review-label">Name:</span> <span class="review-value" id="reviewName"></span>
                        </p>
                        <p><span class="review-label">Gender:</span> <span class="review-value"
                                id="reviewGender"></span></p>
                        <p><span class="review-label">Date of Birth:</span> <span class="review-value"
                                id="reviewDob"></span></p>
                        <p><span class="review-label">Contact:</span> <span class="review-value"
                                id="reviewContact"></span></p>
                    </div>

                    <div class="review-data">
                        <h4 class="mb-3">Residence & Academic Information</h4>
                        <p><span class="review-label">Residence Type:</span> <span class="review-value"
                                id="reviewResidenceType"></span></p>
                        <p><span class="review-label">Residence/Hall:</span> <span class="review-value"
                                id="reviewResidence"></span></p>
                        <p><span class="review-label">Room Number:</span> <span class="review-value"
                                id="reviewRoom"></span></p>
                        <p><span class="review-label">Program of Study:</span> <span class="review-value"
                                id="reviewProgram"></span></p>
                        <p><span class="review-label">Education Level:</span> <span class="review-value"
                                id="reviewEducationLevel"></span></p>
                        <p><span class="review-label">Program Duration:</span> <span class="review-value"
                                id="reviewProgramDuration"></span></p>
                    </div>

                    <div class="review-data">
                        <h4 class="mb-3">Membership & Departments</h4>
                        <p><span class="review-label">Membership Type:</span> <span class="review-value"
                                id="reviewMembership"></span></p>
                        <p><span class="review-label">Church Officer:</span> <span class="review-value"
                                id="reviewOfficer"></span></p>
                        <p><span class="review-label">Departments:</span> <span class="review-value"
                                id="reviewDepartments"></span></p>
                    </div>

                    <div class="review-data">
                        <h4 class="mb-3">District & Guardian Information</h4>
                        <p><span class="review-label">District:</span> <span class="review-value"
                                id="reviewDistrict"></span></p>
                        <p><span class="review-label">District Pastor:</span> <span class="review-value"
                                id="reviewPastor"></span></p>
                        <p><span class="review-label">Guardian Name:</span> <span class="review-value"
                                id="reviewGuardian"></span></p>
                        <p><span class="review-label">Guardian Contact:</span> <span class="review-value"
                                id="reviewGuardianContact"></span></p>
                    </div>

                    <div class="review-data">
                        <h4 class="mb-3">Photo</h4>
                        <div id="reviewPhoto" class="mt-2"
                            style="width: 150px; height: 150px; overflow: hidden; border-radius: 5px;"></div>
                    </div>

                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" id="confirmAccuracy" required>
                        <label class="form-check-label" for="confirmAccuracy">
                            I confirm that all information provided is accurate
                        </label>
                    </div>

                    <div class="navigation-buttons">
                        <button type="button" class="btn btn-secondary prev-btn" data-prev="step5">
                            <i class="fas fa-arrow-left me-2"></i> Previous
                        </button>
                        <div>
                            <button type="button" class="btn btn-info me-2" id="resetFormBtn">
                                <i class="fas fa-redo me-2"></i> Start Over
                            </button>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-paper-plane me-2"></i> Submit Registration
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <div class="signature">
                <p class="mb-0">PENSA TTU</p>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // ========== VARIABLES ==========
            let currentStep = 1;
            const totalSteps = 6;
            let stream = null;
            let capturedPhoto = null;

            // DOM Elements
            const steps = document.querySelectorAll('.step');
            const stepIndicators = document.querySelectorAll('.step-indicator');
            const progressBarFill = document.getElementById('progressBarFill');
            const form = document.getElementById('registrationForm');
            
            // ========== OFFICER DETAILS TOGGLE ==========
            const isOfficerCheckbox = document.getElementById('is_officer');
            const officerDetails = document.getElementById('officerDetails');
            
            if (isOfficerCheckbox) {
                isOfficerCheckbox.addEventListener('change', function() {
                    officerDetails.style.display = this.checked ? 'block' : 'none';
                    
                    // Uncheck officer role radios when hidden
                    if (!this.checked) {
                        document.querySelectorAll('input[name="officer_role"]').forEach(radio => {
                            radio.checked = false;
                        });
                    }
                });
            }

            // ========== CAMPUS RESIDENCE TOGGLE ==========
            const campusYes = document.getElementById('campus_yes');
            const campusNo = document.getElementById('campus_no');
            const campusHallSection = document.getElementById('campusHallSection');
            const offCampusSection = document.getElementById('offCampusSection');
            
            // Make fields required based on selection
            const campusHall = document.getElementById('campus_hall');
            const roomCampus = document.getElementById('room_campus');
            const offcampusLocation = document.getElementById('offcampus_location');
            const roomOffcampus = document.getElementById('room_offcampus');

            function toggleResidenceSections() {
                if (campusYes && campusYes.checked) {
                    campusHallSection.style.display = 'block';
                    offCampusSection.style.display = 'none';
                    
                    // Make campus fields required
                    if (campusHall) campusHall.required = true;
                    if (roomCampus) roomCampus.required = true;
                    
                    // Remove required from off-campus fields
                    if (offcampusLocation) offcampusLocation.required = false;
                    if (roomOffcampus) roomOffcampus.required = false;
                    
                } else if (campusNo && campusNo.checked) {
                    campusHallSection.style.display = 'none';
                    offCampusSection.style.display = 'block';
                    
                    // Make off-campus fields required
                    if (offcampusLocation) offcampusLocation.required = true;
                    if (roomOffcampus) roomOffcampus.required = true;
                    
                    // Remove required from campus fields
                    if (campusHall) campusHall.required = false;
                    if (roomCampus) roomCampus.required = false;
                }
            }

            if (campusYes && campusNo) {
                campusYes.addEventListener('change', toggleResidenceSections);
                campusNo.addEventListener('change', toggleResidenceSections);
            }

            // ========== STEP NAVIGATION ==========
            function showStep(stepNumber) {
                // Hide all steps
                steps.forEach(step => step.classList.remove('active'));
                
                // Show current step
                const currentStepElement = document.getElementById(`step${stepNumber}`);
                if (currentStepElement) {
                    currentStepElement.classList.add('active');
                }
                
                // Update indicators
                stepIndicators.forEach((indicator, index) => {
                    if (index < stepNumber) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
                
                // Update progress bar
                const progress = (stepNumber / totalSteps) * 100;
                if (progressBarFill) {
                    progressBarFill.style.width = `${progress}%`;
                }
                
                // Update review when reaching step 6
                if (stepNumber === 6) {
                    updateReview();
                }
                
                currentStep = stepNumber;
            }

            // Validate current step
            function validateStep(stepNumber) {
                const currentStepElement = document.getElementById(`step${stepNumber}`);
                if (!currentStepElement) return true;
                
                const requiredFields = currentStepElement.querySelectorAll('[required]');
                
                for (let field of requiredFields) {
                    // Skip hidden fields or fields in hidden sections
                    if (field.closest('[style*="display: none"]')) continue;
                    
                    if (field.type === 'radio') {
                        const name = field.name;
                        const radios = document.querySelectorAll(`input[name="${name}"]`);
                        const checked = Array.from(radios).some(radio => radio.checked);
                        if (!checked) {
                            showToast(`Please select ${name.replace('_', ' ')}`, 'error');
                            return false;
                        }
                    } else if (field.type === 'checkbox') {
                        // Skip checkbox validation for now
                    } else {
                        if (!field.value.trim()) {
                            showToast('Please fill in all required fields', 'error');
                            field.focus();
                            return false;
                        }
                    }
                }
                
                return true;
            }

            // Next button click handlers
            document.querySelectorAll('.next-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const nextStep = parseInt(this.dataset.next.replace('step', ''));
                    
                    if (validateStep(currentStep)) {
                        if (currentStep === 2) {
                            updateResidenceFields();
                        }
                        showStep(nextStep);
                    }
                });
            });

            // Previous button click handlers
            document.querySelectorAll('.prev-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const prevStep = parseInt(this.dataset.prev.replace('step', ''));
                    showStep(prevStep);
                });
            });

            // ========== PHOTO UPLOAD ==========
            const photoUpload = document.getElementById('photoUpload');
            const photoPreview = document.getElementById('photoPreview');
            const cameraBtn = document.getElementById('cameraBtn');
            const cameraContainer = document.getElementById('cameraContainer');
            const cameraPreview = document.getElementById('cameraPreview');
            const captureBtn = document.getElementById('captureBtn');
            const cancelCameraBtn = document.getElementById('cancelCameraBtn');
            const photoData = document.getElementById('photoData');
            const reviewPhoto = document.getElementById('reviewPhoto');

            if (photoUpload) {
                photoUpload.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
                            photoData.value = e.target.result;
                            capturedPhoto = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            if (cameraBtn) {
                cameraBtn.addEventListener('click', async function() {
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        cameraPreview.innerHTML = '<video id="video" autoplay style="width: 100%; max-width: 400px; border-radius: 10px;"></video>';
                        const video = document.getElementById('video');
                        video.srcObject = stream;
                        cameraContainer.style.display = 'block';
                    } catch (err) {
                        showToast('Unable to access camera. Please make sure you have granted camera permissions.', 'error');
                    }
                });
            }

            if (captureBtn) {
                captureBtn.addEventListener('click', function() {
                    const video = document.getElementById('video');
                    if (video) {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext('2d').drawImage(video, 0, 0);
                        const photo = canvas.toDataURL('image/jpeg');
                        
                        photoPreview.innerHTML = `<img src="${photo}" alt="Captured" style="width: 100%; height: 100%; object-fit: cover;">`;
                        photoData.value = photo;
                        capturedPhoto = photo;
                        
                        // Stop camera
                        if (stream) {
                            stream.getTracks().forEach(track => track.stop());
                        }
                        cameraContainer.style.display = 'none';
                    }
                });
            }

            if (cancelCameraBtn) {
                cancelCameraBtn.addEventListener('click', function() {
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }
                    cameraContainer.style.display = 'none';
                });
            }

            // ========== UPDATE REVIEW ==========
            function updateReview() {
                try {
                    // Personal Info
                    const surname = document.getElementById('surname')?.value || '';
                    const othernames = document.getElementById('othernames')?.value || '';
                    document.getElementById('reviewName').innerText = surname + ' ' + othernames;
                    
                    const gender = document.querySelector('input[name="gender"]:checked');
                    document.getElementById('reviewGender').innerText = gender ? gender.value : '';
                    
                    document.getElementById('reviewDob').innerText = document.getElementById('dob')?.value || '';
                    document.getElementById('reviewContact').innerText = document.getElementById('contact')?.value || '';
                    
                    // Residence & Academic
                    const campusYesChecked = document.getElementById('campus_yes')?.checked || false;
                    
                    let residenceType = '';
                    let residenceValue = '';
                    let roomValue = '';
                    
                    if (campusYesChecked) {
                        residenceType = 'On-Campus';
                        residenceValue = document.getElementById('campus_hall')?.value || 'Not selected';
                        roomValue = document.getElementById('room_campus')?.value || 'Not provided';
                    } else {
                        residenceType = 'Off-Campus';
                        residenceValue = document.getElementById('offcampus_location')?.value || 'Not provided';
                        roomValue = document.getElementById('room_offcampus')?.value || 'Not provided';
                    }
                    
                    document.getElementById('reviewResidenceType').innerText = residenceType;
                    document.getElementById('reviewResidence').innerText = residenceValue;
                    document.getElementById('reviewRoom').innerText = roomValue;
                    
                    document.getElementById('reviewProgram').innerText = document.getElementById('program')?.value || '';
                    
                    const educationLevel = document.getElementById('education_level');
                    document.getElementById('reviewEducationLevel').innerText = educationLevel?.value ? 'Level ' + educationLevel.value : '';
                    
                    const programDuration = document.getElementById('program_duration');
                    document.getElementById('reviewProgramDuration').innerText = programDuration?.value || '';
                    
                    // Membership
                    const membership = document.querySelector('input[name="membership"]:checked');
                    document.getElementById('reviewMembership').innerText = membership ? membership.value : '';
                    
                    // Church Officer
                    const isOfficer = document.getElementById('is_officer')?.checked ? 'Yes' : 'No';
                    let officerRole = '';
                    if (isOfficer === 'Yes') {
                        const role = document.querySelector('input[name="officer_role"]:checked');
                        officerRole = role ? ' - ' + role.value : '';
                    }
                    document.getElementById('reviewOfficer').innerText = isOfficer + officerRole;
                    
                    // Departments
                    const departments = [];
                    document.querySelectorAll('input[name="departments[]"]:checked').forEach(cb => {
                        const label = document.querySelector(`label[for="${cb.id}"]`);
                        departments.push(label ? label.innerText : cb.value);
                    });
                    document.getElementById('reviewDepartments').innerText = departments.join(', ') || 'None selected';
                    
                    // District & Guardian
                    document.getElementById('reviewDistrict').innerText = document.getElementById('district')?.value || '';
                    document.getElementById('reviewPastor').innerText = document.getElementById('pastor')?.value || '';
                    document.getElementById('reviewGuardian').innerText = document.getElementById('guardian')?.value || '';
                    document.getElementById('reviewGuardianContact').innerText = document.getElementById('guardian_contact')?.value || '';
                    
                    // Photo
                    if (reviewPhoto) {
                        if (capturedPhoto) {
                            reviewPhoto.innerHTML = `<img src="${capturedPhoto}" alt="Review Photo" style="width: 100%; height: 100%; object-fit: cover;">`;
                        } else {
                            reviewPhoto.innerHTML = '<i class="fas fa-image fa-3x text-muted"></i>';
                        }
                    }
                } catch (error) {
                    console.log('Error updating review:', error);
                }
            }

            // ========== RESET FORM ==========
            const resetFormBtn = document.getElementById('resetFormBtn');
            if (resetFormBtn) {
                resetFormBtn.addEventListener('click', function() {
                    if (confirm('Are you sure you want to start over? All entered data will be lost.')) {
                        form.reset();
                        showStep(1);
                        
                        // Reset photo preview
                        if (photoPreview) {
                            photoPreview.innerHTML = '<i class="fas fa-image fa-3x text-muted mb-3"></i><p class="text-muted">Photo preview will appear here</p>';
                        }
                        capturedPhoto = null;
                        if (photoData) photoData.value = '';
                        
                        // Reset residence sections
                        if (campusHallSection) campusHallSection.style.display = 'none';
                        if (offCampusSection) offCampusSection.style.display = 'none';
                        
                        showToast('Form has been reset', 'info');
                    }
                });
            }

            // ========== UPDATE RESIDENCE FIELDS ==========
            window.updateResidenceFields = function() {
                const campusYesChecked = document.getElementById('campus_yes')?.checked || false;
                const residence = document.getElementById('residence');
                const room = document.getElementById('room');
                
                if (campusYesChecked) {
                    if (residence) residence.value = document.getElementById('campus_hall')?.value || '';
                    if (room) room.value = document.getElementById('room_campus')?.value || '';
                } else {
                    if (residence) residence.value = document.getElementById('offcampus_location')?.value || '';
                    if (room) room.value = document.getElementById('room_offcampus')?.value || '';
                }
            };

            // ========== TOAST NOTIFICATION ==========
            function showToast(message, type = 'info') {
                const toastContainer = document.getElementById('toastContainer');
                if (!toastContainer) return;
                
                const toast = document.createElement('div');
                toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
                toast.setAttribute('role', 'alert');
                toast.setAttribute('aria-live', 'assertive');
                toast.setAttribute('aria-atomic', 'true');
                
                toast.innerHTML = `
                    <div class="d-flex">
                        <div class="toast-body">
                            ${message}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                `;
                
                toastContainer.appendChild(toast);
                
                // Use Bootstrap toast if available
                if (typeof bootstrap !== 'undefined') {
                    const bsToast = new bootstrap.Toast(toast);
                    bsToast.show();
                } else {
                    toast.style.display = 'block';
                }
                
                setTimeout(() => {
                    toast.remove();
                }, 5000);
            }

            // ========== FORM SUBMISSION ==========
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const confirmAccuracy = document.getElementById('confirmAccuracy');
                    if (confirmAccuracy && !confirmAccuracy.checked) {
                        showToast('Please confirm that the information is accurate', 'warning');
                        return;
                    }
                    
                    updateResidenceFields();
                    
                    // Disable submit button to prevent multiple submissions
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
                    }
                    
                    // Create FormData from form
                    const formData = new FormData(form);
                    
                    // Submit via AJAX
                    fetch('submit.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showToast('Registration submitted successfully!', 'success');
                            
                            // Reset form after successful submission
                            setTimeout(() => {
                                form.reset();
                                showStep(1);
                                if (photoPreview) {
                                    photoPreview.innerHTML = '<i class="fas fa-image fa-3x text-muted mb-3"></i><p class="text-muted">Photo preview will appear here</p>';
                                }
                                capturedPhoto = null;
                                showToast('Thank you for registering!', 'success');
                            }, 2000);
                        } else {
                            showToast(data.message || 'Registration failed', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showToast('An error occurred. Please try again.', 'error');
                    })
                    .finally(() => {
                        // Re-enable submit button
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Submit Registration';
                        }
                    });
                });
            }

            // Initialize
            showStep(1);
            
            // Make showToast available globally
            window.showToast = showToast;
        });

        // Function to update hidden fields before form submission (called from onclick)
        function updateResidenceFields() {
            const campusYesChecked = document.getElementById('campus_yes')?.checked || false;
            const residence = document.getElementById('residence');
            const room = document.getElementById('room');
            
            if (campusYesChecked) {
                if (residence) residence.value = document.getElementById('campus_hall')?.value || '';
                if (room) room.value = document.getElementById('room_campus')?.value || '';
            } else {
                if (residence) residence.value = document.getElementById('offcampus_location')?.value || '';
                if (room) room.value = document.getElementById('room_offcampus')?.value || '';
            }
        }

        // Make updateReview available globally
        window.updateReview = function() {
            try {
                // Personal Info
                const surname = document.getElementById('surname')?.value || '';
                const othernames = document.getElementById('othernames')?.value || '';
                document.getElementById('reviewName').innerText = surname + ' ' + othernames;
                
                const gender = document.querySelector('input[name="gender"]:checked');
                document.getElementById('reviewGender').innerText = gender ? gender.value : '';
                
                document.getElementById('reviewDob').innerText = document.getElementById('dob')?.value || '';
                document.getElementById('reviewContact').innerText = document.getElementById('contact')?.value || '';
                
                // Residence & Academic
                const campusYesChecked = document.getElementById('campus_yes')?.checked || false;
                
                let residenceType = '';
                let residenceValue = '';
                let roomValue = '';
                
                if (campusYesChecked) {
                    residenceType = 'On-Campus';
                    residenceValue = document.getElementById('campus_hall')?.value || 'Not selected';
                    roomValue = document.getElementById('room_campus')?.value || 'Not provided';
                } else {
                    residenceType = 'Off-Campus';
                    residenceValue = document.getElementById('offcampus_location')?.value || 'Not provided';
                    roomValue = document.getElementById('room_offcampus')?.value || 'Not provided';
                }
                
                document.getElementById('reviewResidenceType').innerText = residenceType;
                document.getElementById('reviewResidence').innerText = residenceValue;
                document.getElementById('reviewRoom').innerText = roomValue;
                
                document.getElementById('reviewProgram').innerText = document.getElementById('program')?.value || '';
                
                const educationLevel = document.getElementById('education_level');
                document.getElementById('reviewEducationLevel').innerText = educationLevel?.value ? 'Level ' + educationLevel.value : '';
                
                const programDuration = document.getElementById('program_duration');
                document.getElementById('reviewProgramDuration').innerText = programDuration?.value || '';
                
                // Membership
                const membership = document.querySelector('input[name="membership"]:checked');
                document.getElementById('reviewMembership').innerText = membership ? membership.value : '';
                
                // Church Officer
                const isOfficer = document.getElementById('is_officer')?.checked ? 'Yes' : 'No';
                let officerRole = '';
                if (isOfficer === 'Yes') {
                    const role = document.querySelector('input[name="officer_role"]:checked');
                    officerRole = role ? ' - ' + role.value : '';
                }
                document.getElementById('reviewOfficer').innerText = isOfficer + officerRole;
                
                // Departments
                const departments = [];
                document.querySelectorAll('input[name="departments[]"]:checked').forEach(cb => {
                    const label = document.querySelector(`label[for="${cb.id}"]`);
                    departments.push(label ? label.innerText : cb.value);
                });
                document.getElementById('reviewDepartments').innerText = departments.join(', ') || 'None selected';
                
                // District & Guardian
                document.getElementById('reviewDistrict').innerText = document.getElementById('district')?.value || '';
                document.getElementById('reviewPastor').innerText = document.getElementById('pastor')?.value || '';
                document.getElementById('reviewGuardian').innerText = document.getElementById('guardian')?.value || '';
                document.getElementById('reviewGuardianContact').innerText = document.getElementById('guardian_contact')?.value || '';
            } catch (error) {
                console.log('Error updating review:', error);
            }
        };
    </script>
    
    <script src="script.js"></script>
</body>

</html>