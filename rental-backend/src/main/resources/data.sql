START TRANSACTION;

-- -------------------------------------------
-- ROLES
-- -------------------------------------------
INSERT INTO roles (id, name, created_at, updated_at)
VALUES
    (1, 'ADMIN',  NOW(), NOW()),
    (2, 'OWNER',  NOW(), NOW()),
    (3, 'TENANT', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- -------------------------------------------
-- USERS
-- -------------------------------------------
INSERT INTO users
    (id, email, username, password, firstname, lastname, phone, is_active, is_verified, created_at, updated_at)
VALUES
    (1, 'admin@system.gr', 'admin', '12345', 'Admin', 'System', '2100000000', true, true, NOW(), NOW()),
    (2, 'owner@system.gr',  'owner1', '12345', 'Olga',    'Owner',  '2101111111', true, true, NOW(), NOW()),
    (3, 'tenant@system.gr', 'tenant1','12345','Tasos',   'Tenant', '2102222222', true, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- -------------------------------------------
-- USER_ROLES (Many-to-Many)
-- -------------------------------------------
INSERT INTO user_roles (user_id, role_id)
VALUES
    (1, 1), -- admin -> ADMIN
    (2, 2), -- owner1 -> OWNER
    (3, 3)  -- tenant1 -> TENANT
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- -------------------------------------------
-- PROPERTIES (owned by user_id = 2 OWNER)
-- -------------------------------------------
INSERT INTO properties
    (id, title, description, address, city, price, bedrooms, bathrooms, size, type, status, owner_id, created_at, updated_at)
VALUES
    (1, 'Sunny 2BR Apartment', 'Bright apt close to metro.', '12 Solonos St','Egaleo', 700.00, 2, 1, 68, 'APARTMENT', 'PENDING', 2, NOW(), NOW()),
    (2, 'Cozy Studio', 'Ground-floor studio.', '5 Green Ave','Pagrati', 450.00, 0, 1, 32, 'STUDIO', 'APPROVED', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- -------------------------------------------
-- RENTAL APPLICATIONS (from user_id = 3 TENANT)
-- -------------------------------------------
INSERT INTO rental_applications
    (id, message, status, tenant_id, property_id, created_at, updated_at)
VALUES
    (1, 'I can move in next month.','PENDING', 3, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- -------------------------------------------
-- VIEWING REQUESTS (from user_id = 3 TENANT)
-- -------------------------------------------
INSERT INTO viewing_requests
    (id, requested_at, status, notes, tenant_id, property_id, created_at, updated_at)
VALUES
    (1, NOW(), 'REQUESTED', 'Prefer afternoon slots.', 3, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE status = VALUES(status);

COMMIT;