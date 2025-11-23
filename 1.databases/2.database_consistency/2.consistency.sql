-- consistency ensures that no matter what data will never go incorrect. It makes sure your data always follows the rules
-- you have set mainly through constraints like primary key, foreign key, unique, not null etc.,

-- cascades (via foreign key):
-- cascades are the special options you add to the foreign key constraint to tell database how to react in the child table
-- when the related parent table is updated or deleted. This maintains the consistency automatically.

-- eg: on-delete cascade
-- If you delete 'customer' (parent table), automatically delete all its related 'orders' (child table)
CREATE TABLE customers(
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL
);
CREATE TABLE orders(
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE,
    product_id INT NOT NULL, -- not creating the products table for now
    price VARCHAR(20) NOT NULL,
    FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id)
        ON DELETE CASCADE   -- this is the cascade rule
); 
INSERT INTO customers(customer_name, phone) VALUES('Mic Clarke', '+2-987643210');
INSERT INTO orders(customer_id, order_date, product_id, price) VALUES(1, '2025-12-1', 21, '2134.00');
INSERT INTO orders(customer_id, order_date, product_id, price) VALUES(1, '2025-12-09', 23, '435.50');

-- result: deleting Customer ID 1 automatically deletes all orders linked to 1
DELETE FROM customers WHERE customer_id = 1;

-- similarly we can "ON UPDATE" cascade as well. When primary key is updated, update all records with the updated foreign key
-- in the children referencing the parent
---------------------------***********-------------------------------------------------

-- triggers are stored procedures that automatically execute whenever sepcified data 
-- modification event (INSERT, UPDATE, or DELETE) occurs on a particular table.
-- Note: They are used for more complex consistency checks or logging that constraints/cascades can't handle

-- A simple trigger to set a creation date automatically
CREATE TRIGGER before_insert_products
    BEFORE INSERT ON Products
    FOR EACH ROW
    SET NEW.created_at = NOW(); -- The NEW keyword refers to the row being inserted