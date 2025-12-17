import { Property, DashboardMetrics, LatestBooking, Booking, Experience, Testimonial } from '@/lib/types';
import supabase from './db';

// Tipos intermedios para manejar la respuesta de Supabase con relaciones anidadas
type BookingWithProperties = Omit<Booking, 'property_name'> & {
  properties: { name: string } | { name: string }[] | null;
};

type LatestBookingWithProperties = Omit<LatestBooking, 'property_name'> & {
  properties: { name: string } | { name: string }[] | null;
};

/**
 * Fetches properties from the database, optionally filtering them.
 * @param searchParams The search parameters from the URL.
 */
export const fetchProperties = async (searchParams?: {
  startDate?: string;
  endDate?: string;
  guests?: string;
  amenities?: string;
}): Promise<Property[]> => {
  // If there are search params, delegate to the search function
  if (searchParams && (searchParams.startDate || searchParams.endDate || searchParams.guests || searchParams.amenities)) {
    const amenitiesArray = searchParams.amenities ? searchParams.amenities.split(',') : null;
    return searchProperties({
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      guests: searchParams.guests,
      amenities: amenitiesArray,
    });
  }

  // Otherwise, fetch all properties with full details
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*');

  if (propertiesError) {
    console.error('Failed to fetch all properties:', propertiesError);
    return [];
  }

  if (!properties || properties.length === 0) {
    return [];
  }

  const propertyIds = properties.map(p => p.id);

  const [
    { data: images, error: imagesError },
    { data: propertyAmenities, error: paError },
    { data: propertyRules, error: rulesError }
  ] = await Promise.all([
    supabase.from('images').select('*').in('entity_id', propertyIds).eq('entity_type', 'property').order('order', { ascending: true }),
    supabase.from('propertyamenities').select('*, amenities(*)').in('property_id', propertyIds),
    supabase.from('propertyrules').select('*').in('property_id', propertyIds)
  ]);

  if (imagesError) console.error('Failed to fetch images:', imagesError);
  if (paError) console.error('Failed to fetch property amenities:', paError);
  if (rulesError) console.error('Failed to fetch property rules:', rulesError);

  return properties.map(property => {
    const relatedImages = images?.filter(img => img.entity_id === property.id) || [];
    const galleryImages = relatedImages.filter(img => img.image_category === 'gallery');
    const relatedAmenities = propertyAmenities?.filter(pa => pa.property_id === property.id).map(pa => pa.amenities) || [];
    const relatedRules = propertyRules?.filter(rule => rule.property_id === property.id) || [];

    return {
      ...property,
      main_image_url: galleryImages[0]?.url ?? undefined,
      gallery_images: galleryImages,
      blueprint_images: relatedImages.filter(img => img.image_category === 'blueprint'),
      amenities: relatedAmenities.filter(Boolean),
      rules: relatedRules,
    };
  }) as Property[];
};

/**
 * Searches for properties based on a dynamic set of filters.
 * @param filters The search filters (guests, amenities, dates).
 */
export const searchProperties = async (filters: {
  guests?: string | null;
  amenities?: string[] | null;
  startDate?: string | null;
  endDate?: string | null;
  name?: string | null;
}): Promise<Property[]> => {
  const { guests, amenities, startDate, endDate, name } = filters;

  let propertyIdsToFilter: number[] | null = null;

  // 1. Filter by amenities if provided
  if (amenities && amenities.length > 0) {
    // The frontend sends amenity slugs. We need to find their corresponding IDs.
    const { data: foundAmenities, error: amenitiesError } = await supabase
      .from('amenities')
      .select('id, slug')
      .in('slug', amenities);

    if (amenitiesError) {
      console.error('Could not find amenities by slug:', amenitiesError);
      return [];
    }

    const foundSlugs = foundAmenities.map(a => a.slug);
    const notFoundSlugs = amenities.filter(slug => !foundSlugs.includes(slug));

    if (notFoundSlugs.length > 0) {
      console.warn('Some amenities were not found:', notFoundSlugs);
    }

    const requestedAmenityIds = foundAmenities.map(a => a.id);

    if (requestedAmenityIds.length === 0) {
      return [];
    }

    const ids = requestedAmenityIds;

    const { data: propertyAmenities, error: paError } = await supabase
      .from('propertyamenities')
      .select('property_id')
      .in('amenity_id', ids);

    if (paError) {
      console.error('Failed to filter by amenities:', paError);
      return [];
    }

    // Count occurrences of each property_id
    const propertyCounts = propertyAmenities.reduce((acc, { property_id }) => {
      acc[property_id] = (acc[property_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Filter properties that have all the requested amenities
    propertyIdsToFilter = Object.keys(propertyCounts)
      .filter(id => propertyCounts[parseInt(id, 10)] === amenities.length)
      .map(id => parseInt(id, 10));

    if (propertyIdsToFilter.length === 0) {
      return []; // No properties match all amenities
    }
  }

  // 2. Build the main query
  let query = supabase.from('properties').select('*');

  if (guests && !isNaN(parseInt(guests, 10)) && parseInt(guests, 10) > 0) {
    query = query.gte('guests', parseInt(guests, 10));
  }

  if (propertyIdsToFilter) {
    query = query.in('id', propertyIdsToFilter);
  }

  // Date-based availability search
  if (startDate && endDate) {
    // Find properties that have a confirmed booking overlapping with the selected date range
    const { data: unavailableBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('property_id')
      .eq('status', 'confirmed')
      // A booking overlaps if its start date is before or on the search's end date,
      // AND its end date is after the search's start date.
      // This ensures the first day of a booking is counted, and the check-out day is available.
      .lte('check_in_date', endDate)
      .gt('check_out_date', startDate);

    if (bookingsError) {
      console.error('Failed to fetch bookings for availability check:', bookingsError);
      return []; // Return empty if the check fails
    }

    if (unavailableBookings && unavailableBookings.length > 0) {
      const unavailablePropertyIds = unavailableBookings.map((b: { property_id: number }) => b.property_id);
      // Exclude the unavailable properties from the query
      query = query.filter('id', 'not.in', `(${unavailablePropertyIds.join(',')})`);
    }
  }

  // 3. Execute the main query
  const { data: properties, error } = await query;

  if (error) {
    console.error('Failed to search properties:', error);
    return [];
  }

  if (!properties || properties.length === 0) {
    return [];
  }

  // 4. Fetch related data for the filtered properties
  let filteredProperties = properties;

  // Filter by name in memory to support accent-insensitive search
  if (name) {
    const normalizeText = (text: string) =>
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const normalizedQuery = normalizeText(name);

    filteredProperties = properties.filter(p =>
      normalizeText(p.name).includes(normalizedQuery)
    );
  }

  if (filteredProperties.length === 0) {
    return [];
  }

  const propertyIds = filteredProperties.map(p => p.id);

  const [
    { data: images, error: imagesError },
    { data: propertyAmenities, error: paError },
    { data: propertyRules, error: rulesError }
  ] = await Promise.all([
    supabase.from('images').select('*').in('entity_id', propertyIds).eq('entity_type', 'property').order('order', { ascending: true }),
    supabase.from('propertyamenities').select('*, amenities(*)').in('property_id', propertyIds),
    supabase.from('propertyrules').select('*').in('property_id', propertyIds)
  ]);

  if (imagesError) console.error('Failed to fetch images:', imagesError);
  if (paError) console.error('Failed to fetch property amenities:', paError);
  if (rulesError) console.error('Failed to fetch property rules:', rulesError);

  // 5. Combine all data and return
  return filteredProperties.map(property => {
    const relatedImages = images?.filter(img => img.entity_id === property.id) || [];
    const galleryImages = relatedImages.filter(img => img.image_category === 'gallery');
    const relatedAmenities = propertyAmenities?.filter(pa => pa.property_id === property.id).map(pa => pa.amenities) || [];
    const relatedRules = propertyRules?.filter(rule => rule.property_id === property.id) || [];

    return {
      ...property,
      main_image_url: galleryImages[0]?.url ?? undefined,
      gallery_images: galleryImages,
      blueprint_images: relatedImages.filter(img => img.image_category === 'blueprint'),
      amenities: relatedAmenities.filter(Boolean),
      rules: relatedRules,
    };
  }) as Property[];
};

/**
 * Fetches all bookings from the database.
 */
export const fetchAllBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      properties(name)
    `)
    .order('created_at', { ascending: false })
    .neq('source', 'excel');

  if (error) {
    console.error('Failed to fetch all bookings:', error);
    return [];
  }
  // Supabase returns the related record as an object for a to-one relationship.
  return data.map((b: BookingWithProperties) => ({
    ...b,
    property_name: Array.isArray(b.properties) ? b.properties[0]?.name ?? 'Chalet no encontrado' : b.properties?.name ?? 'Chalet no encontrado',
  }));
};

/**
 * Fetches filtered and paginated bookings from the database.
 */
export const fetchFilteredBookings = async (
  query: string,
  status: string,
  currentPage: number,
  itemsPerPage: number,
  sortBy: string,
  order: string
) => {
  const offset = (currentPage - 1) * itemsPerPage;

  let supabaseQuery = supabase
    .from('bookings')
    .select(`
      *,
      properties(name)
    `, { count: 'exact' });

  if (status) {
    supabaseQuery = supabaseQuery.eq('status', status);
  }

  if (query) {
    supabaseQuery = supabaseQuery.or(`client_name.ilike.%${query}%,client_phone.ilike.%${query}%,properties.name.ilike.%${query}%`);
  }

  // Filter out bookings from excel (availability blocks)
  supabaseQuery = supabaseQuery.neq('source', 'excel');

  const validSortBy = ['created_at', 'client_name', 'status'].includes(sortBy) ? sortBy : 'created_at';

  supabaseQuery = supabaseQuery
    .order(validSortBy, { ascending: order === 'asc' })
    .range(offset, offset + itemsPerPage - 1);

  const { data, error, count } = await supabaseQuery;

  if (error) {
    console.error('Failed to fetch filtered bookings:', error);
    return { bookings: [], totalPages: 0 };
  }

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;
  const bookings = data.map((b: BookingWithProperties) => ({
    ...b,
    property_name: Array.isArray(b.properties) ? b.properties[0]?.name ?? 'Chalet no encontrado' : b.properties?.name ?? 'Chalet no encontrado',
  }));

  return { bookings, totalPages };
};

/**
 * Fetches dashboard metrics from the database.
 */
export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { count: pendingBookings, error: pendingError } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending').neq('source', 'excel');
  const { count: activeProperties, error: propertiesError } = await supabase.from('properties').select('*', { count: 'exact', head: true });

  const today = new Date().toISOString().slice(0, 10);
  const { count: newBookingsToday, error: newTodayError } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00Z`).lt('created_at', `${today}T23:59:59Z`).neq('source', 'excel');

  if (pendingError || propertiesError || newTodayError) {
    console.error('Failed to fetch dashboard metrics:', pendingError || propertiesError || newTodayError);
    return { pendingBookings: 0, activeProperties: 0, newBookingsToday: 0 };
  }

  return {
    pendingBookings: pendingBookings ?? 0,
    activeProperties: activeProperties ?? 0,
    newBookingsToday: newBookingsToday ?? 0,
  };
};

/**
 * Fetches the latest bookings from the database.
 */
export const fetchLatestBookings = async (): Promise<LatestBooking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      client_name,
      properties(name),
      check_in_date,
      status
    `)
    .order('created_at', { ascending: false })
    .neq('source', 'excel')
    .limit(5);

  if (error) {
    console.error('Failed to fetch latest bookings:', error);
    return [];
  }
  return data.map((b: LatestBookingWithProperties) => ({
    ...b,
    property_name: Array.isArray(b.properties) ? b.properties[0]?.name ?? 'Chalet no encontrado' : b.properties?.name ?? 'Chalet no encontrado',
  }));
};

/**
 * Fetches a single property by its ID from the database.
 * @param id The ID of the property to fetch.
 */
export const fetchPropertyById = async (id: string): Promise<Property | undefined> => {
  // 1. Fetch the property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (propertyError) {
    console.error(`Failed to fetch property with id ${id}:`, propertyError);
    return undefined;
  }
  if (!property) {
    return undefined;
  }

  // 2. Fetch related data in parallel
  const [
    { data: images, error: imagesError },
    { data: propertyAmenities, error: paError },
    { data: propertyRules, error: rulesError }
  ] = await Promise.all([
    supabase.from('images').select('*').eq('entity_id', property.id).eq('entity_type', 'property').order('order', { ascending: true }),
    supabase.from('propertyamenities').select('*, amenities(id, name, slug, category, description, icon)').eq('property_id', property.id),
    supabase.from('propertyrules').select('*').eq('property_id', property.id)
  ]);

  if (imagesError) console.error('Failed to fetch images for property:', imagesError);
  if (paError) console.error('Failed to fetch amenities for property:', paError);
  if (rulesError) console.error('Failed to fetch rules for property:', rulesError);

  // 3. Combine the data
  return {
    ...property,
    gallery_images: images?.filter(img => img.image_category === 'gallery') || [],
    blueprint_images: images?.filter(img => img.image_category === 'blueprint') || [],
    amenities: propertyAmenities?.map(pa => pa.amenities).filter(Boolean) || [],
    rules: propertyRules || [],
  } as Property;
};

/**
 * Updates the availability in the Bookings table from parsed Excel data.
 * This function performs a transaction to ensure data integrity.
 * @param availabilityData An array of objects with map_node_id, start_date, and end_date.
 */
export const updateAvailabilityFromExcel = async (
  availabilityData: { map_node_id: string; start_date: Date; end_date: Date }[]
) => {
  // This will be implemented with an RPC function for transactional integrity.
  const { error } = await supabase.rpc('update_availability_from_excel', { availability_data: availabilityData });

  if (error) {
    console.error('Failed to update availability from Excel:', error);
    throw new Error('Error al actualizar la base de datos.');
  }
  console.log('Availability updated successfully.');
};

/**
 * Fetches a single property by its slug from the database.
 * @param slug The slug of the property to fetch.
 */
export const fetchPropertyBySlug = async (slug: string): Promise<Property | undefined> => {
  // 1. Fetch the property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (propertyError) {
    console.error(`Failed to fetch property with slug ${slug}:`, propertyError);
    return undefined;
  }
  if (!property) {
    return undefined;
  }

  // 2. Fetch related data in parallel
  const [
    { data: images, error: imagesError },
    { data: propertyAmenities, error: paError },
    { data: propertyRules, error: rulesError }
  ] = await Promise.all([
    supabase.from('images').select('*').eq('entity_id', property.id).eq('entity_type', 'property').order('order', { ascending: true }),
    supabase.from('propertyamenities').select('*, amenities(id, name, slug, category, description, icon)').eq('property_id', property.id),
    supabase.from('propertyrules').select('*').eq('property_id', property.id)
  ]);

  if (imagesError) console.error('Failed to fetch images for property:', imagesError);
  if (paError) console.error('Failed to fetch amenities for property:', paError);
  if (rulesError) console.error('Failed to fetch rules for property:', rulesError);

  // 3. Combine the data
  return {
    ...property,
    gallery_images: images?.filter(img => img.image_category === 'gallery') || [],
    blueprint_images: images?.filter(img => img.image_category === 'blueprint') || [],
    amenities: propertyAmenities?.map(pa => pa.amenities).filter(Boolean) || [],
    rules: propertyRules || [],
  } as Property;
};

/**
 * Fetches all data needed for the chalet detail page.
 * @param id The ID of the main property to fetch.
 */
export const fetchChaletPageData = async (id: string): Promise<Property | undefined> => {
  return fetchPropertyById(id);
};

/**
 * Fetches featured properties by category from the database.
 * @param category The category of the properties to return.
 * @param limit The maximum number of properties to return.
 */
export const fetchFeaturedPropertiesByCategory = async (category: string, limit: number = 6): Promise<Property[]> => {
  // Step 1: Fetch the properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('category', category)
    .eq('featured', true)
    .limit(limit);

  if (propertiesError) {
    console.error(`Failed to fetch featured properties for category ${category}:`, propertiesError);
    return [];
  }
  if (!properties || properties.length === 0) {
    return [];
  }

  // Step 2: Fetch the images for these properties
  const propertyIds = properties.map(p => p.id);
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('url, entity_id, image_category')
    .in('entity_id', propertyIds)
    .eq('entity_type', 'property')
    .order('order', { ascending: true });

  if (imagesError) {
    console.error('Failed to fetch images for featured properties:', imagesError);
    // If images fail, we can still return properties without them
  }

  // Step 3: Map images to their properties
  return properties.map(p => {
    const relatedImages = images?.filter(img => img.entity_id === p.id) || [];
    const galleryImage = relatedImages.find(img => img.image_category === 'gallery');
    const mainImage = galleryImage || relatedImages[0];

    return {
      ...p,
      main_image_url: mainImage?.url ?? undefined,
    };
  }) as Property[];
};

/**
 * Fetches featured properties from the database.
 * @param limit The maximum number of properties to return.
 */
export const fetchFeaturedProperties = async (limit: number = 6): Promise<Property[]> => {
  // Step 1: Fetch featured properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('featured', true)
    .limit(limit);

  if (propertiesError) {
    console.error(`Failed to fetch featured properties:`, propertiesError);
    return [];
  }
  if (!properties || properties.length === 0) {
    return [];
  }

  // Step 2: Fetch images for these properties
  const propertyIds = properties.map(p => p.id);
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('url, entity_id, image_category')
    .in('entity_id', propertyIds)
    .eq('entity_type', 'property')
    .order('order', { ascending: true });

  if (imagesError) {
    console.error('Failed to fetch images for featured properties:', imagesError);
  }

  // Step 3: Map images to their properties
  return properties.map(p => {
    const relatedImages = images?.filter(img => img.entity_id === p.id) || [];
    const galleryImage = relatedImages.find(img => img.image_category === 'gallery');
    const mainImage = galleryImage || relatedImages[0];

    return {
      ...p,
      main_image_url: mainImage?.url ?? undefined,
    };
  }) as Property[];
};

/**
 * Fetches all chalets from the database for the admin panel.
 */
export const fetchAllChalets = async (): Promise<Property[]> => {
  // 1. Fetch all properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .order('id', { ascending: false });

  if (propertiesError) {
    console.error('Failed to fetch all chalets:', propertiesError);
    return [];
  }

  if (!properties || properties.length === 0) {
    return [];
  }

  // 2. Get all property IDs
  const propertyIds = properties.map(p => p.id);

  // 3. Fetch all related data in parallel
  const [
    { data: images, error: imagesError },
    { data: propertyAmenities, error: paError },
    { data: propertyRules, error: rulesError }
  ] = await Promise.all([
    supabase.from('images').select('*').in('entity_id', propertyIds).eq('entity_type', 'property').order('order', { ascending: true }),
    supabase.from('propertyamenities').select('*, amenities(*)').in('property_id', propertyIds),
    supabase.from('propertyrules').select('*').in('property_id', propertyIds)
  ]);

  // Handle errors for related data fetches
  if (imagesError) console.error('Failed to fetch images:', imagesError);
  if (paError) console.error('Failed to fetch property amenities:', paError);
  if (rulesError) console.error('Failed to fetch property rules:', rulesError);

  // 4. Map related data to properties
  const propertiesWithDetails = properties.map(property => {
    const relatedImages = images?.filter(img => img.entity_id === property.id) || [];
    const galleryImages = relatedImages.filter(img => img.image_category === 'gallery');
    const relatedAmenities = propertyAmenities?.filter(pa => pa.property_id === property.id).map(pa => pa.amenities) || [];
    const relatedRules = propertyRules?.filter(rule => rule.property_id === property.id) || [];

    return {
      ...property,
      main_image_url: galleryImages[0]?.url ?? undefined,
      gallery_images: galleryImages,
      blueprint_images: relatedImages.filter(img => img.image_category === 'blueprint'),
      amenities: relatedAmenities.filter(Boolean),
      rules: relatedRules,
    };
  });

  return propertiesWithDetails as Property[];
};

/**
 * Fetches all amenities from the database.
 */
export const fetchAllAmenities = async (): Promise<import('@/lib/types').Amenity[]> => {
  const { data: amenities, error } = await supabase
    .from('amenities')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch amenities:', error);
    return [];
  }

  return amenities || [];
};

/**
 * Fetches all experiences by calling the internal API route.
 * This is used by server components to fetch data in Vercel deployments,
 * bypassing the Vercel Authentication layer.
 */
export const fetchAllExperiences = async (): Promise<Experience[] | null> => {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const url = `${baseUrl}/api/experiencias`;

    console.log(`Fetching experiences from URL: ${url}`);

    const headers: HeadersInit = {
      'Cache-Control': 'no-store',
    };

    const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (bypassToken) {
      console.log('Vercel bypass token found. Adding Authorization header.');
      headers['Authorization'] = `Bearer ${bypassToken}`;
    } else {
      console.warn('Vercel bypass token is not set. Fetching without Authorization.');
    }

    const res = await fetch(url, {
      headers,
      cache: 'no-store', // Previene el caching agresivo de Next.js en el servidor
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Failed to fetch experiences. Status: ${res.status}, Body: ${errorBody}`);
      return null;
    }

    console.log('Successfully fetched experiences.');
    return res.json();
  } catch (error) {
    console.error('An unexpected error occurred while fetching experiences:', error);
    return null;
  }
};

/**
 * Fetches all experiences from the database.
 */
export const fetchExperiences = async (): Promise<Experience[]> => {
  // 1. Fetch all experiences
  const { data: experiences, error: experiencesError } = await supabase
    .from('experiences')
    .select('*')
    .order('id', { ascending: false });

  if (experiencesError) {
    console.error('Failed to fetch all experiences:', experiencesError);
    throw new Error('Could not fetch experiences from the database.');
  }
  if (!experiences || experiences.length === 0) {
    return [];
  }

  // 2. Fetch related images
  const experienceIds = experiences.map(e => e.id);
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('*')
    .in('entity_id', experienceIds)
    .eq('entity_type', 'experience');

  if (imagesError) {
    console.error('Failed to fetch images for experiences:', imagesError);
  }

  // 3. Map images to their respective experiences
  return experiences.map(experience => {
    const relatedImages = images?.filter(img => img.entity_id === experience.id) || [];
    return {
      ...experience,
      main_image_url: relatedImages[0]?.url ?? undefined,
      images: relatedImages,
    };
  }) as Experience[];
};

/**
 * Fetches a single experience by its ID from the database.
 * @param id The ID of the experience to fetch.
 */
export const fetchExperienceById = async (id: string): Promise<Experience | undefined> => {
  // 1. Fetch the experience
  const { data: experience, error: experienceError } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .single();

  if (experienceError) {
    console.error(`Failed to fetch experience with id ${id}:`, experienceError);
    throw new Error(`Could not fetch experience with id ${id}.`);
  }
  if (!experience) {
    return undefined;
  }

  // 2. Fetch related images
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('*')
    .eq('entity_id', experience.id)
    .eq('entity_type', 'experience');

  if (imagesError) {
    console.error('Failed to fetch images for experience:', imagesError);
  }

  // 3. Combine and return
  return {
    ...experience,
    gallery_images: images || [],
  } as Experience;
};

/**
 * Fetches a single experience by its slug from the database.
 * @param slug The slug of the experience to fetch.
 */
export const fetchExperienceBySlug = async (slug: string): Promise<Experience | undefined> => {
  // 1. Fetch the experience
  const { data: experience, error: experienceError } = await supabase
    .from('experiences')
    .select('*')
    .eq('slug', slug)
    .single();

  if (experienceError) {
    console.error(`Failed to fetch experience with slug ${slug}:`, experienceError);
    throw new Error(`Could not fetch experience with slug ${slug}.`);
  }
  if (!experience) {
    return undefined;
  }

  // 2. Fetch related images
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('*')
    .eq('entity_id', experience.id)
    .eq('entity_type', 'experience');

  if (imagesError) {
    console.error('Failed to fetch images for experience:', imagesError);
  }

  // 3. Combine and return
  return {
    ...experience,
    gallery_images: images || [],
  } as Experience;
};

/**
 * Fetches featured experiences from the database.
 * @param limit The maximum number of experiences to return.
 */
export const fetchFeaturedExperiences = async (limit: number = 4): Promise<Experience[]> => {
  // Step 1: Fetch featured experiences
  const { data: experiences, error: experiencesError } = await supabase
    .from('experiences')
    .select('*')
    .eq('featured', true)
    .limit(limit);

  if (experiencesError) {
    console.error('Failed to fetch featured experiences:', experiencesError);
    return [];
  }
  if (!experiences || experiences.length === 0) {
    return [];
  }

  // Step 2: Fetch images for these experiences
  const experienceIds = experiences.map(e => e.id);
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('*')
    .in('entity_id', experienceIds)
    .eq('entity_type', 'experience');

  if (imagesError) {
    console.error('Failed to fetch images for featured experiences:', imagesError);
  }

  // Step 3: Map images to their experiences
  return experiences.map(experience => {
    const relatedImages = images?.filter(img => img.entity_id === experience.id) || [];
    return {
      ...experience,
      main_image_url: relatedImages[0]?.url ?? undefined,
      images: relatedImages,
    };
  }) as Experience[];
};

/**
 * Fetches properties based on a set of filters.
 * @param filters The filters to apply to the query.
 */
export const fetchFilteredChalets = async (filters: {
  guests: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  amenities: string[];
}): Promise<Property[]> => {
  // This is a complex query that will require an RPC function for filtering by amenities.
  console.warn("Filtered chalet search is not fully implemented with Supabase yet.");

  let query = supabase.from('properties').select('*');

  if (parseInt(filters.guests, 10) > 0) {
    query = query.gte('guests', parseInt(filters.guests, 10));
  }
  if (parseInt(filters.bedrooms, 10) > 0) {
    query = query.gte('bedrooms', parseInt(filters.bedrooms, 10));
  }
  if (parseInt(filters.beds, 10) > 0) {
    query = query.gte('beds', parseInt(filters.beds, 10));
  }
  if (parseInt(filters.bathrooms, 10) > 0) {
    query = query.gte('bathrooms', parseInt(filters.bathrooms, 10));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch filtered chalets:', error);
    return [];
  }
  return data as Property[];
};

/**
 * Fetches all map_node_id values that are currently in use by properties.
 */
export const fetchUsedMapNodeIds = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select('map_node_id')
    .not('map_node_id', 'is', null);

  if (error) {
    console.error('Failed to fetch used map node IDs:', error);
    return [];
  }
  return data.map((row: { map_node_id: string }) => row.map_node_id);
};

/**
 * Fetches all testimonials from the database.
 */
export const fetchAllTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch testimonials:', error);
    return [];
  }
  return data as Testimonial[];
};

/**
 * Fetches featured testimonials from the database.
 */
export const fetchFeaturedTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch featured testimonials:', error);
    return [];
  }
  return data as Testimonial[];
};

/**
 * Fetches a single testimonial by its ID from the database.
 * @param id The ID of the testimonial to fetch.
 */
export const fetchTestimonialById = async (id: string): Promise<Testimonial | undefined> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Failed to fetch testimonial with id ${id}:`, error);
    return undefined;
  }
  return data as Testimonial;
};

/**
 * Fetches all bookings for a specific chalet.
 * @param chaletId The ID of the chalet.
 */
export const getChaletBookings = async (chaletId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', chaletId)
    .eq('status', 'confirmed');

  if (error) {
    console.error(`Failed to fetch bookings for chalet ${chaletId}:`, error);
    return [];
  }
  return data as Booking[];
};

/**
 * Fetches all amenities from the database.
 */

