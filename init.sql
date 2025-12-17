-- Drop existing tables with cascade to handle dependencies
DROP TABLE IF EXISTS propertyamenities CASCADE;
DROP TABLE IF EXISTS propertyrules CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;

-- Crear tipos ENUM personalizados para PostgreSQL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type_enum') THEN
        CREATE TYPE entity_type_enum AS ENUM ('property', 'experience');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'image_category_enum') THEN
        CREATE TYPE image_category_enum AS ENUM ('gallery', 'blueprint');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_enum') THEN
        CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('admin');
    END IF;
END$$;

-- Crear la tabla properties
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    latitude DECIMAL(11, 8),
    longitude DECIMAL(11, 8),
    category VARCHAR(100),
    guests SMALLINT,
    bedrooms SMALLINT,
    beds SMALLINT,
    bathrooms SMALLINT,
    rating DECIMAL(4, 2),
    price_high DECIMAL(10, 2),
    price_mid DECIMAL(10, 2),
    price_low DECIMAL(10, 2),
    featured BOOLEAN DEFAULT FALSE,
    video_url TEXT,
    optional_services TEXT,
    map_node_id VARCHAR(255) UNIQUE
);

-- Crear la tabla experiences
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    short_description TEXT,
    long_description TEXT,
    what_to_know JSON,
    featured BOOLEAN DEFAULT FALSE
);

-- Crear la tabla images
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL UNIQUE,
    alt_text VARCHAR(255),
    entity_type entity_type_enum,
    entity_id INT,
    "order" SMALLINT,
    image_category image_category_enum DEFAULT 'gallery'
);

-- Crear la tabla amenities
CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    icon VARCHAR(100)
);

-- Crear la tabla intermedia propertyamenities
CREATE TABLE propertyamenities (
    property_id INT,
    amenity_id INT,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Crear la tabla propertyrules
CREATE TABLE propertyrules (
    id SERIAL PRIMARY KEY,
    property_id INT,
    rule_text TEXT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Crear la tabla bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INT,
    client_name VARCHAR(255),
    client_phone VARCHAR(50),
    client_email VARCHAR(255),
    check_in_date DATE,
    check_out_date DATE,
    guests SMALLINT,
    status booking_status_enum DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- Crear la tabla testimonials
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    author_image_url VARCHAR(255),
    testimonial_text TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla users para administradores
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role_enum DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions for seeding
GRANT ALL ON TABLE properties TO service_role;
GRANT ALL ON TABLE experiences TO service_role;
GRANT ALL ON TABLE images TO service_role;
GRANT ALL ON TABLE amenities TO service_role;
GRANT ALL ON TABLE propertyamenities TO service_role;
GRANT ALL ON TABLE propertyrules TO service_role;
GRANT ALL ON TABLE bookings TO service_role;
GRANT ALL ON TABLE testimonials TO service_role;
GRANT ALL ON TABLE users TO service_role;

-- Grant permissions on sequences for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Crear la función para actualizar la disponibilidad desde el Excel
CREATE OR REPLACE FUNCTION update_availability_from_excel(availability_data JSON)
RETURNS VOID AS $$
DECLARE
    item JSON;
    prop_id INT;
BEGIN
    -- Primero, marcar todas las reservas existentes como 'cancelled' para limpiar la disponibilidad
    UPDATE bookings SET status = 'cancelled' WHERE source = 'excel';

    -- Iterar sobre cada objeto en el array JSON de entrada
    FOR item IN SELECT * FROM json_array_elements(availability_data)
    LOOP
        -- Encontrar el property_id basado en el map_node_id
        SELECT id INTO prop_id FROM properties WHERE map_node_id = item->>'map_node_id';

        -- Si se encuentra una propiedad, insertar la nueva reserva
        IF prop_id IS NOT NULL THEN
            INSERT INTO bookings (property_id, check_in_date, check_out_date, status, source, client_name)
            VALUES (prop_id, (item->>'start_date')::DATE, (item->>'end_date')::DATE, 'confirmed', 'excel', 'Sistema');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
