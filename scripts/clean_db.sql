-- Desactivar temporalmente la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar las tablas si existen
DROP TABLE IF EXISTS PropertyAmenities;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS Amenities;
DROP TABLE IF EXISTS Experiences;
DROP TABLE IF EXISTS Properties;

-- Reactivar la verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;
