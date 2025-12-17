-- 1. Limpiar categorías de todos los amenities existentes para identificar cuáles quedan obsoletos
UPDATE amenities SET category = NULL;

-- 2. Insertar o Actualizar (Upsert) los Amenities Nuevos
-- Premium
INSERT INTO amenities (slug, name, category, icon) VALUES
('casa_sobre_barranco', 'Casa sobre Barranco', 'Premium', 'Mountain'),
('aire_acondicionado_full', 'A/A Total', 'Premium', 'Wind'),
('piscina_interior_climatizada', 'Piscina interior climatizada', 'Premium', 'Waves'),
('sommiers_king_size', 'Sommiers King Size', 'Premium', 'BedDouble'),
('hidromasaje_4x', 'Hidromasaje 4x', 'Premium', 'Bath'),
('sauna', 'Sauna', 'Premium', 'Heater'),
('gimnasio_cubierto', 'Gimnasio cubierto', 'Premium', 'Dumbbell'),
('instalacion_deportiva', 'Instalación deportiva', 'Premium', 'Goal'),
('sala_de_juegos', 'Sala de juegos', 'Premium', 'Gamepad2'),
('minicine_4k', 'Minicine 4K', 'Premium', 'Clapperboard'),
('climatizador_piscina_externa', 'Climatizador piscina exterior', 'Premium', 'ThermometerSun'),
('calefaccion_central', 'Calefacción central', 'Premium', 'Thermometer'),
('toalleros_calefaccionados', 'Toalleros calefaccionados', 'Premium', 'Heater'),
('calidad_constructiva', 'Calidad constructiva', 'Premium', 'Award'),
('starlink_250', 'Starlink 250', 'Premium', 'Wifi'),
('starlink_100', 'Starlink 100', 'Premium', 'Wifi'),
('servicio_de_mucama', 'Servicio de Mucama', 'Premium', 'Sparkles'),
('servicio_de_blanco_premium', 'Servicio de blanco premium', 'Premium', 'Shirt')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon;

-- Generales
INSERT INTO amenities (slug, name, category, icon) VALUES
('pequenos_electrodomesticos', 'Pequeños electrodomesticos', 'Generales', 'Plug'),
('cafetera_de_capsulas', 'Cafetera de cápsulas', 'Generales', 'Coffee'),
('licuadora', 'Licuadora', 'Generales', 'Utensils'),
('mixer', 'Mixer', 'Generales', 'Utensils'),
('hornito_grill_electrico', 'Hornito Grill eléctrico', 'Generales', 'Microwave'),
('juguera_electrica', 'Juguera eléctrica', 'Generales', 'GlassWater'),
('lavarropas', 'Lavarropas', 'Generales', 'WashingMachine'),
('secador_de_pelo', 'Secador de pelo', 'Generales', 'Wind'),
('mosquiteros', 'Mosquiteros', 'Generales', 'Grid3x3'),
('caja_de_seguridad', 'Caja de seguridad', 'Generales', 'Lock'),
('lavavajillas', 'Lavavajillas', 'Generales', 'Droplets'),
('equipo_de_planchar', 'Equipo de planchar', 'Generales', 'Shirt'),
('hogar', 'Hogar', 'Generales', 'Flame'),
('wifi', 'Wifi', 'Generales', 'Wifi')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon;

-- Exteriores
INSERT INTO amenities (slug, name, category, icon) VALUES
('piscina_privada', 'Piscina privada', 'Exteriores', 'Waves'),
('juego_de_comedor_externo', 'Juego de comedor externo', 'Exteriores', 'UtensilsCrossed'),
('juego_de_living_externo', 'Juego de living externo', 'Exteriores', 'Armchair'),
('parrilla_cubierta', 'Parrilla cubierta', 'Exteriores', 'Flame'),
('galeria', 'Galeria', 'Exteriores', 'Sun'),
('horno_no_convencional', 'Horno no convencional', 'Exteriores', 'ChefHat'),
('solarium_con_reposeras', 'Solarium con reposeras', 'Exteriores', 'Sun'),
('playa_humeda', 'Playa húmeda', 'Exteriores', 'Droplets'),
('trampolin', 'Trampolín', 'Exteriores', 'ArrowUp'),
('tobogan_acuatico', 'Tobogan acuatico', 'Exteriores', 'Waves'),
('juegos_para_ninos', 'Juegos para niños', 'Exteriores', 'Baby'),
('cerco_perimetral_en_piscina', 'Cerco perimetral en piscina', 'Exteriores', 'Shield'),
('mesas_de_juegos_externas', 'Mesas de juegos externas', 'Exteriores', 'Dices'),
('plaza_saludable', 'Plaza Saludable', 'Exteriores', 'Heart'),
('quincho', 'Quincho', 'Exteriores', 'Home'),
('asador_descubierto', 'Asador descubierto', 'Exteriores', 'Flame'),
('parque_1500_m2', 'Parque +1500 m2', 'Exteriores', 'Trees')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon;

-- 3. Eliminar los amenities que quedaron sin categoría (los "antiguos" que ya no existen en la nueva lista)
-- Esto removerá también la relación con los chalets gracias al ON DELETE CASCADE
DELETE FROM amenities WHERE category IS NULL;
