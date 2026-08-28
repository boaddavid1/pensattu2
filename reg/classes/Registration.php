<?php
// classes/Registration.php
class Registration {
    private $conn;
    private $table_name = "registrations";

    // Object properties
    public $id;
    public $surname;
    public $othernames;
    public $gender;
    public $dob;
    public $contact;
    public $residence;
    public $room;
    public $program;
    public $education_level;
    public $membership_type;
    public $district;
    public $pastor;
    public $guardian;
    public $guardian_contact;
    public $photo_data;
    public $other_info;
    public $created_at;
    public $departments = [];
    // New columns
    public $campus_residence;
    public $campus_hall;
    public $offcampus_location;
    public $room_campus;
    public $room_offcampus;
    public $program_duration;
    public $is_officer;
    public $officer_role;
    public $landmark;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create registration
    public function create() {
        // Sanitize inputs
        $this->sanitizeInputs();

        // Start transaction
        $this->conn->beginTransaction();

        try {
            // Insert into registrations table
            $query = "INSERT INTO " . $this->table_name . "
                    SET
                        surname = :surname,
                        othernames = :othernames,
                        gender = :gender,
                        dob = :dob,
                        contact = :contact,
                        residence = :residence,
                        room = :room,
                        program = :program,
                        education_level = :education_level,
                        membership_type = :membership_type,
                        district = :district,
                        pastor = :pastor,
                        guardian = :guardian,
                        guardian_contact = :guardian_contact,
                        photo_data = :photo_data,
                        other_info = :other_info,
                        campus_residence = :campus_residence,
                        campus_hall = :campus_hall,
                        offcampus_location = :offcampus_location,
                        room_campus = :room_campus,
                        room_offcampus = :room_offcampus,
                        program_duration = :program_duration,
                        is_officer = :is_officer,
                        officer_role = :officer_role,
                        landmark = :landmark";

            $stmt = $this->conn->prepare($query);

            // Bind values
            $stmt->bindParam(":surname", $this->surname);
            $stmt->bindParam(":othernames", $this->othernames);
            $stmt->bindParam(":gender", $this->gender);
            $stmt->bindParam(":dob", $this->dob);
            $stmt->bindParam(":contact", $this->contact);
            $stmt->bindParam(":residence", $this->residence);
            $stmt->bindParam(":room", $this->room);
            $stmt->bindParam(":program", $this->program);
            $stmt->bindParam(":education_level", $this->education_level);
            $stmt->bindParam(":membership_type", $this->membership_type);
            $stmt->bindParam(":district", $this->district);
            $stmt->bindParam(":pastor", $this->pastor);
            $stmt->bindParam(":guardian", $this->guardian);
            $stmt->bindParam(":guardian_contact", $this->guardian_contact);
            $stmt->bindParam(":photo_data", $this->photo_data);
            $stmt->bindParam(":other_info", $this->other_info);
            $stmt->bindParam(":campus_residence", $this->campus_residence);
            $stmt->bindParam(":campus_hall", $this->campus_hall);
            $stmt->bindParam(":offcampus_location", $this->offcampus_location);
            $stmt->bindParam(":room_campus", $this->room_campus);
            $stmt->bindParam(":room_offcampus", $this->room_offcampus);
            $stmt->bindParam(":program_duration", $this->program_duration);
            $stmt->bindParam(":is_officer", $this->is_officer);
            $stmt->bindParam(":officer_role", $this->officer_role);
            $stmt->bindParam(":landmark", $this->landmark);

            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();

                // Insert departments
                if (!empty($this->departments)) {
                    $this->insertDepartments();
                }

                $this->conn->commit();
                return true;
            }

            return false;

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    // Update registration
    public function update() {
        try {
            // Sanitize inputs
            $this->sanitizeInputs();

            // Start transaction
            $this->conn->beginTransaction();

            // Update registrations table
            $query = "UPDATE " . $this->table_name . "
                    SET
                        surname = :surname,
                        othernames = :othernames,
                        gender = :gender,
                        dob = :dob,
                        contact = :contact,
                        residence = :residence,
                        room = :room,
                        program = :program,
                        education_level = :education_level,
                        membership_type = :membership_type,
                        district = :district,
                        pastor = :pastor,
                        guardian = :guardian,
                        guardian_contact = :guardian_contact,
                        photo_data = :photo_data,
                        other_info = :other_info,
                        campus_residence = :campus_residence,
                        campus_hall = :campus_hall,
                        offcampus_location = :offcampus_location,
                        room_campus = :room_campus,
                        room_offcampus = :room_offcampus,
                        program_duration = :program_duration,
                        is_officer = :is_officer,
                        officer_role = :officer_role,
                        landmark = :landmark
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Bind values
            $stmt->bindParam(":surname", $this->surname);
            $stmt->bindParam(":othernames", $this->othernames);
            $stmt->bindParam(":gender", $this->gender);
            $stmt->bindParam(":dob", $this->dob);
            $stmt->bindParam(":contact", $this->contact);
            $stmt->bindParam(":residence", $this->residence);
            $stmt->bindParam(":room", $this->room);
            $stmt->bindParam(":program", $this->program);
            $stmt->bindParam(":education_level", $this->education_level);
            $stmt->bindParam(":membership_type", $this->membership_type);
            $stmt->bindParam(":district", $this->district);
            $stmt->bindParam(":pastor", $this->pastor);
            $stmt->bindParam(":guardian", $this->guardian);
            $stmt->bindParam(":guardian_contact", $this->guardian_contact);
            $stmt->bindParam(":photo_data", $this->photo_data);
            $stmt->bindParam(":other_info", $this->other_info);
            $stmt->bindParam(":campus_residence", $this->campus_residence);
            $stmt->bindParam(":campus_hall", $this->campus_hall);
            $stmt->bindParam(":offcampus_location", $this->offcampus_location);
            $stmt->bindParam(":room_campus", $this->room_campus);
            $stmt->bindParam(":room_offcampus", $this->room_offcampus);
            $stmt->bindParam(":program_duration", $this->program_duration);
            $stmt->bindParam(":is_officer", $this->is_officer);
            $stmt->bindParam(":officer_role", $this->officer_role);
            $stmt->bindParam(":landmark", $this->landmark);
            $stmt->bindParam(":id", $this->id);

            if (!$stmt->execute()) {
                throw new Exception("Failed to update registration");
            }

            // Delete existing departments
            $delete_query = "DELETE FROM departments WHERE registration_id = :registration_id";
            $delete_stmt = $this->conn->prepare($delete_query);
            $delete_stmt->bindParam(":registration_id", $this->id);
            $delete_stmt->execute();

            // Insert new departments
            if (!empty($this->departments)) {
                $this->insertDepartments();
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log("Registration update error: " . $e->getMessage());
            throw $e;
        }
    }

    // Insert departments
    private function insertDepartments() {
        $query = "INSERT INTO departments (registration_id, department) VALUES (:registration_id, :department)";
        $stmt = $this->conn->prepare($query);

        foreach ($this->departments as $dept) {
            $stmt->bindParam(":registration_id", $this->id);
            $stmt->bindParam(":department", $dept);
            $stmt->execute();
        }
    }

    // Sanitize inputs
    private function sanitizeInputs() {
        $this->surname = htmlspecialchars(strip_tags(trim($this->surname ?? '')));
        $this->othernames = htmlspecialchars(strip_tags(trim($this->othernames ?? '')));
        $this->gender = htmlspecialchars(strip_tags(trim($this->gender ?? '')));
        $this->contact = htmlspecialchars(strip_tags(trim($this->contact ?? '')));
        $this->residence = htmlspecialchars(strip_tags(trim($this->residence ?? '')));
        $this->room = htmlspecialchars(strip_tags(trim($this->room ?? '')));
        $this->program = htmlspecialchars(strip_tags(trim($this->program ?? '')));
        $this->education_level = htmlspecialchars(strip_tags(trim($this->education_level ?? '')));
        $this->membership_type = htmlspecialchars(strip_tags(trim($this->membership_type ?? '')));
        $this->district = htmlspecialchars(strip_tags(trim($this->district ?? '')));
        $this->pastor = htmlspecialchars(strip_tags(trim($this->pastor ?? '')));
        $this->guardian = htmlspecialchars(strip_tags(trim($this->guardian ?? '')));
        $this->guardian_contact = htmlspecialchars(strip_tags(trim($this->guardian_contact ?? '')));
        $this->other_info = $this->other_info; // JSON data, don't sanitize
        
        // Add new fields
        $this->campus_residence = htmlspecialchars(strip_tags(trim($this->campus_residence ?? '')));
        $this->campus_hall = htmlspecialchars(strip_tags(trim($this->campus_hall ?? '')));
        $this->offcampus_location = htmlspecialchars(strip_tags(trim($this->offcampus_location ?? '')));
        $this->room_campus = htmlspecialchars(strip_tags(trim($this->room_campus ?? '')));
        $this->room_offcampus = htmlspecialchars(strip_tags(trim($this->room_offcampus ?? '')));
        $this->program_duration = htmlspecialchars(strip_tags(trim($this->program_duration ?? '')));
        $this->is_officer = $this->is_officer;
        $this->officer_role = htmlspecialchars(strip_tags(trim($this->officer_role ?? '')));
        $this->landmark = htmlspecialchars(strip_tags(trim($this->landmark ?? '')));
    }

    // Get all registrations
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Get single registration with departments
    public function getById($id) {
        $query = "SELECT r.*, GROUP_CONCAT(d.department) as departments 
                  FROM " . $this->table_name . " r 
                  LEFT JOIN departments d ON r.id = d.registration_id 
                  WHERE r.id = :id 
                  GROUP BY r.id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->id = $row['id'];
            $this->surname = $row['surname'];
            $this->othernames = $row['othernames'];
            $this->gender = $row['gender'];
            $this->dob = $row['dob'];
            $this->contact = $row['contact'];
            $this->residence = $row['residence'];
            $this->room = $row['room'];
            $this->program = $row['program'];
            $this->education_level = $row['education_level'];
            $this->membership_type = $row['membership_type'];
            $this->district = $row['district'];
            $this->pastor = $row['pastor'];
            $this->guardian = $row['guardian'];
            $this->guardian_contact = $row['guardian_contact'];
            $this->photo_data = $row['photo_data'];
            $this->created_at = $row['created_at'];
            
            // Handle departments - check if not null
            $this->departments = !empty($row['departments']) ? explode(',', $row['departments']) : [];

            return true;
        }

        return false;
    }

    // Delete registration
    public function delete() {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (Exception $e) {
            error_log("Registration delete error: " . $e->getMessage());
            throw $e;
        }
    }

    // Get statistics
    public function getStats() {
        $stats = [];
        
        // Total count
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Members by type
        $query = "SELECT membership_type, COUNT(*) as count FROM " . $this->table_name . " GROUP BY membership_type";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $stats[$row['membership_type']] = $row['count'];
        }
        
        // Gender distribution
        $query = "SELECT gender, COUNT(*) as count FROM " . $this->table_name . " GROUP BY gender";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $stats[$row['gender']] = $row['count'];
        }
        
        return $stats;
    }
}
?>
