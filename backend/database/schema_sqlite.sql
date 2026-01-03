-- JustBack Database Schema (SQLite Version)
-- Optimized for local deployment

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('guest', 'host', 'admin')),
  avatar_url TEXT,
  email_verified INTEGER DEFAULT 0,
  phone_verified INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  wallet_balance REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  host_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('hotel', 'apartment', 'house', 'shortlet', 'serviced_apartment')),
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'Nigeria',
  latitude REAL,
  longitude REAL,
  
  -- Capacity
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  
  -- Pricing
  price_per_night REAL NOT NULL,
  weekly_price REAL,
  monthly_price REAL,
  cleaning_fee REAL DEFAULT 0,
  
  -- Amenities (JSON string)
  amenities TEXT DEFAULT '[]',
  
  -- Images (JSON string)
  images TEXT DEFAULT '[]',
  
  -- Rules & Policies
  house_rules TEXT,
  check_in_time TEXT DEFAULT '14:00',
  check_out_time TEXT DEFAULT '11:00',
  cancellation_policy TEXT DEFAULT '24_hours',
  
  -- Status
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
  
  -- AI Voice
  custom_faqs TEXT DEFAULT '[]',
  
  -- Ratings
  average_rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Property Availability Calendar
CREATE TABLE IF NOT EXISTS availability (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'BLOCKED')),
  price_override REAL,
  UNIQUE(property_id, date)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  
  guest_id TEXT REFERENCES users(id),
  host_id TEXT REFERENCES users(id),
  property_id TEXT REFERENCES properties(id),
  
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  nights INTEGER NOT NULL,
  
  num_guests INTEGER NOT NULL,
  
  subtotal REAL NOT NULL,
  cleaning_fee REAL DEFAULT 0,
  service_fee REAL NOT NULL,
  total_amount REAL NOT NULL,
  
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'REFUNDED')),
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'ESCROWED', 'RELEASED', 'REFUNDED')),
  
  checked_in_at TEXT,
  checked_out_at TEXT,
  
  guest_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id),
  user_id TEXT REFERENCES users(id),
  
  payment_type TEXT CHECK (payment_type IN ('BOOKING', 'WALLET_FUNDING', 'REFUND')),
  gateway TEXT CHECK (gateway IN ('PAYSTACK', 'FLUTTERWAVE', 'STRIPE', 'WALLET')),
  
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'NGN',
  
  reference TEXT UNIQUE NOT NULL,
  gateway_reference TEXT,
  gateway_response TEXT,
  
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  
  type TEXT CHECK (type IN ('CREDIT', 'DEBIT')),
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  
  description TEXT NOT NULL,
  reference TEXT,
  
  booking_id TEXT REFERENCES bookings(id),
  payment_id TEXT REFERENCES payments(id),
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Messages/Chat
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id),
  sender_id TEXT REFERENCES users(id),
  receiver_id TEXT REFERENCES users(id),
  
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings(host_id);

-- Escrow Table
CREATE TABLE IF NOT EXISTS escrow (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT REFERENCES bookings(id),
  payment_id TEXT REFERENCES payments(id),
  
  total_amount REAL NOT NULL,
  guest_fee REAL NOT NULL,
  host_commission REAL NOT NULL,
  host_payout REAL NOT NULL,
  
  scheduled_release_date TEXT,
  released_at TEXT,
  
  status TEXT DEFAULT 'HELD' CHECK (status IN ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED')),
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- KYC Submissions Table
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  
  document_type TEXT NOT NULL CHECK (document_type IN ('NIN', 'BVN', 'PASSPORT', 'DRIVERS_LICENSE')),
  document_number TEXT NOT NULL,
  document_url TEXT,
  selfie_url TEXT,
  
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason TEXT,
  
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_submissions(status);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT REFERENCES bookings(id),
  property_id TEXT REFERENCES properties(id),
  user_id TEXT REFERENCES users(id),
  
  rating REAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  
  cleanliness_rating REAL CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating REAL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating REAL CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating REAL CHECK (value_rating >= 1 AND value_rating <= 5),
  
  host_response TEXT,
  host_response_at TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value REAL NOT NULL,
  max_discount REAL,
  
  min_booking_amount REAL,
  valid_from TEXT,
  valid_until TEXT,
  
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  multiple_use_allowed INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code);

-- Promo Usage Table
CREATE TABLE IF NOT EXISTS promo_usage (
  id TEXT PRIMARY KEY,
  promo_code_id TEXT REFERENCES promo_codes(id),
  user_id TEXT REFERENCES users(id),
  booking_id TEXT REFERENCES bookings(id),
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promo_usage_user ON promo_usage(user_id);
