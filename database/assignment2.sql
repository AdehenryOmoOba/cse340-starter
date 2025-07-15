-- 1. Insert a new record into the account table        
INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- 2. Update the existing record in the account table
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';
-- 3. Delete the existing record from the account table
DELETE FROM account
WHERE account_email = 'tony@starkent.com';
-- 4. Update the inventory description
UPDATE inventory
SET inventory_description = REPLACE(
        inventory_description,
        'small interiors',
        'a huge interior'
    )
WHERE inventory_make = 'GM'
    AND inventory_model = 'Hummer';
-- 5. Select the inventory make, model, and classification name
SELECT i.inventory_make,
    i.inventory_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- 6. Update the inventory image and thumbnail
UPDATE inventory
SET inventory_image = REPLACE(inventory_image, '/images/', '/images/vehicles/'),
    inventory_thumbnail = REPLACE(
        inventory_thumbnail,
        '/images/',
        '/images/vehicles/'
    );