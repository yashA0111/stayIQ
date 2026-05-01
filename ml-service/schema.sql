-- StayIQ Database Initialization Script

CREATE DATABASE IF NOT EXISTS stayiq_db;
USE stayiq_db;

-- 1. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_name VARCHAR(255) NOT NULL,
    hotel VARCHAR(100) DEFAULT 'City Hotel',
    adr DECIMAL(10,2) DEFAULT 100.00,
    check_in_date DATE,
    status ENUM('Confirmed', 'Canceled', 'Checked-in', 'Checked-out') DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create Audit Table
CREATE TABLE IF NOT EXISTS booking_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    action VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 3. Create Trigger for Audit Logging
DELIMITER //
DROP TRIGGER IF EXISTS after_booking_update //

CREATE TRIGGER after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO booking_audit (booking_id, old_status, new_status, action)
        VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END //
DELIMITER ;

-- 4. Create Stored Procedure for Canceling a Booking
DELIMITER //
DROP PROCEDURE IF EXISTS cancel_booking_sp //

CREATE PROCEDURE cancel_booking_sp(IN p_booking_id INT)
BEGIN
    -- Check if booking exists
    IF EXISTS (SELECT 1 FROM bookings WHERE id = p_booking_id) THEN
        UPDATE bookings 
        SET status = 'Canceled' 
        WHERE id = p_booking_id AND status != 'Canceled';
    END IF;
END //
DELIMITER ;

-- Insert some dummy data for the demo
INSERT INTO bookings (guest_name, hotel, adr, check_in_date, status) VALUES 
('Alice Smith', 'City Hotel', 120.50, '2026-06-15', 'Confirmed'),
('Bob Johnson', 'Resort Hotel', 210.00, '2026-07-20', 'Confirmed'),
('Charlie Davis', 'City Hotel', 85.00, '2026-08-05', 'Confirmed');
