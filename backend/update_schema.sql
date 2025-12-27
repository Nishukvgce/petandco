-- Update add_ons column to LONGTEXT to accommodate larger JSON data
ALTER TABLE service_bookings MODIFY COLUMN add_ons LONGTEXT;