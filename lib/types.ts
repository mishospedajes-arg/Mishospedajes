
export type Image = {
  id: number;
  url: string;
  alt_text: string;
  image_category: 'gallery' | 'blueprint';
};

export type Amenity = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string; // Added description field
  icon?: string; // Making icon optional as it's not in the DB
};

export type Property = {
  id: number;
  slug: string;
  name: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  guests: number | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  rating: number | null;
  price_high: number | null;
  price_mid: number | null;
  price_low: number | null;
  featured: boolean;
  map_node_id: string;
  video_url?: string;
  optional_services?: string;
  main_image_url?: string;
  gallery_images: Image[];
  blueprint_images: Image[];
  amenities: Amenity[];
  rules: PropertyRule[];
};

export type PropertyRule = {
  id?: number;
  rule_text: string;
};

export type Experience = {
  id: number;
  slug: string;
  title: string;
  category: string;
  short_description: string;
  long_description: string;
  what_to_know: string[]; // Assuming this is stored as JSON and parsed
  featured: boolean;
  main_image_url?: string;
  gallery_images: Image[]; // Populated from the Images table
};

export type DashboardMetrics = {
  pendingBookings: number;
  activeProperties: number;
  newBookingsToday: number;
};

export type LatestBooking = {
  id: number;
  client_name: string;
  property_name: string;
  check_in_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type Booking = {
  id: number;
  property_id: number;
  client_name: string;
  client_phone: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  property_name: string; // Joined from Properties table
  source?: string;
};

export type Testimonial = {
  id: number;
  author_name: string;
  author_image_url?: string;
  testimonial_text: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
};

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin';
  created_at: Date;
}
