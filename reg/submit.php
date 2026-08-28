<?php
// submit.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set header for JSON response
header('Content-Type: application/json');

// Initialize response
$response = [
    'success' => false,
    'message' => 'An unknown error occurred'
];

try {
    // Log received data for debugging (optional - remove in production)
    error_log('Submit.php accessed - Method: ' . $_SERVER['REQUEST_METHOD']);
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Log POST data for debugging
    error_log('POST data: ' . print_r($_POST, true));
    
    // Check if files array exists
    error_log('FILES data: ' . print_r($_FILES, true));

    // Include database and registration class
    require_once 'config/database.php';
    require_once 'classes/Registration.php';

    // Check if files exist
    if (!file_exists('config/database.php')) {
        throw new Exception('Database config file not found');
    }
    if (!file_exists('classes/Registration.php')) {
        throw new Exception('Registration class file not found');
    }

    // Get database connection using your Database class
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Create registration object
    $registration = new Registration($db);

    // Check for duplicate registration based on contact number
    $check_query = "SELECT id FROM registrations WHERE contact = :contact LIMIT 1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':contact', $_POST['contact']);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        throw new Exception('A registration with this contact number already exists. Please use a different contact number or contact support.');
    }

    // Set registration properties from POST data - using new columns
    $registration->surname = $_POST['surname'] ?? '';
    $registration->othernames = $_POST['othernames'] ?? '';
    $registration->gender = $_POST['gender'] ?? '';
    $registration->dob = $_POST['dob'] ?? '';
    $registration->contact = $_POST['contact'] ?? '';
    
    // Handle residence based on campus selection - using new columns
    $campus_residence = $_POST['campus_residence'] ?? '';
    $registration->campus_residence = $campus_residence;
    $registration->campus_hall = $_POST['campus_hall'] ?? null;
    $registration->offcampus_location = $_POST['offcampus_location'] ?? null;
    $registration->room_campus = $_POST['room_campus'] ?? null;
    $registration->room_offcampus = $_POST['room_offcampus'] ?? null;
    
    if ($campus_residence === 'yes') {
        $registration->residence = $_POST['campus_hall'] ?? '';
        $registration->room = $_POST['room_campus'] ?? '';
    } else if ($campus_residence === 'no') {
        $registration->residence = $_POST['offcampus_location'] ?? '';
        $registration->room = $_POST['room_offcampus'] ?? '';
    } else {
        throw new Exception('Please select campus residence option');
    }
    
    $registration->program = $_POST['program'] ?? '';
    $registration->education_level = $_POST['education_level'] ?? '';
    $registration->membership_type = $_POST['membership'] ?? '';
    $registration->district = $_POST['district'] ?? '';
    $registration->pastor = $_POST['pastor'] ?? '';
    $registration->guardian = $_POST['guardian'] ?? '';
    $registration->guardian_contact = $_POST['guardian_contact'] ?? '';
    
    // Handle new direct columns
    $registration->program_duration = $_POST['program_duration'] ?? null;
    $registration->is_officer = (isset($_POST['is_officer']) && $_POST['is_officer'] === 'yes') ? 1 : 0;
    $registration->officer_role = $_POST['officer_role'] ?? null;
    $registration->landmark = $_POST['landmark'] ?? null;
    
    // Handle additional info as JSON if needed - keep for compatibility
    $other_info = [];
    if (isset($_POST['is_officer']) && $_POST['is_officer'] === 'yes') {
        $other_info['is_officer'] = true;
        $other_info['officer_role'] = $_POST['officer_role'] ?? '';
    }
    if (isset($_POST['landmark'])) {
        $other_info['landmark'] = $_POST['landmark'];
    }
    // Store other_info as JSON if not empty
    $registration->other_info = !empty($other_info) ? json_encode($other_info) : null;
    
    // Handle photo data
    if (isset($_POST['photoData']) && !empty($_POST['photoData'])) {
        $registration->photo_data = $_POST['photoData'];
    }

    // Handle departments
    if (isset($_POST['departments']) && is_array($_POST['departments'])) {
        $registration->departments = $_POST['departments'];
        error_log('Departments selected: ' . implode(', ', $_POST['departments']));
    } else {
        // Check if departments were sent as a JSON string
        if (isset($_POST['departments']) && is_string($_POST['departments'])) {
            $deptArray = json_decode($_POST['departments'], true);
            if (is_array($deptArray)) {
                $registration->departments = $deptArray;
                error_log('Departments from JSON: ' . implode(', ', $deptArray));
            } else {
                $registration->departments = [];
            }
        } else {
            // No departments selected - set as empty array
            $registration->departments = [];
            error_log('No departments selected');
        }
    }

    // Validate required fields (based on your database structure)
    $required_fields = ['surname', 'othernames', 'gender', 'dob', 'contact', 
                       'program', 'education_level', 'membership', 
                       'district', 'pastor', 'guardian', 'guardian_contact'];

    // Add residence validation based on campus selection
    if ($campus_residence === 'yes') {
        if (empty($_POST['campus_hall'])) {
            throw new Exception('Please select your campus hall');
        }
        if (empty($_POST['room_campus'])) {
            throw new Exception('Please enter your room number');
        }
    } else if ($campus_residence === 'no') {
        if (empty($_POST['offcampus_location'])) {
            throw new Exception('Please enter your hostel/location name');
        }
        if (empty($_POST['room_offcampus'])) {
            throw new Exception('Please enter your room number');
        }
    }

    // Check each required field
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            $missing_fields[] = $field;
        }
    }

    if (!empty($missing_fields)) {
        throw new Exception('Missing required fields: ' . implode(', ', $missing_fields));
    }

    // Validate contact numbers (10 digits)
    if (!preg_match('/^[0-9]{10}$/', $_POST['contact'])) {
        throw new Exception('Contact number must be exactly 10 digits');
    }

    if (!preg_match('/^[0-9]{10}$/', $_POST['guardian_contact'])) {
        throw new Exception('Guardian contact number must be exactly 10 digits');
    }

    // Validate date of birth (not in future)
    $dob = new DateTime($_POST['dob']);
    $today = new DateTime();
    if ($dob > $today) {
        throw new Exception('Date of birth cannot be in the future');
    }

    // Validate age (minimum age 15)
    $age = $today->diff($dob)->y;
    if ($age < 15) {
        throw new Exception('You must be at least 15 years old to register');
    }

    // Create registration
    if ($registration->create()) {
        $response['success'] = true;
        $response['message'] = 'Registration successful!';
        $response['data'] = [
            'id' => $registration->id,
            'name' => $registration->surname . ' ' . $registration->othernames,
            'membership_type' => $registration->membership_type,
            'departments_count' => count($registration->departments)
        ];
        
        // Log successful registration
        error_log("Registration successful for: " . $registration->surname . " " . $registration->othernames . " (ID: " . $registration->id . ")");
        
    } else {
        throw new Exception('Registration failed. Please try again.');
    }

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    // Log error for debugging
    error_log('Registration error: ' . $e->getMessage());
}

// Return JSON response
echo json_encode($response);
exit;
?>