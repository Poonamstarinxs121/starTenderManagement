DROP TABLE IF EXISTS oems;

CREATE TABLE oems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendorId VARCHAR(50) NOT NULL UNIQUE,
  companyName VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pinCode VARCHAR(20) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vendor_id (vendorId),
  INDEX idx_company_name (companyName),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 