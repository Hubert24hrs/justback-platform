-- JustBack Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('guest', 'host', 'admin')),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  kyc_status VARCHAR(20) DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  wallet_balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties Table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('hotel', 'apartment', 'house', 'shortlet', 'serviced_apartment')),
  
  -- Location
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'Nigeria',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Capacity
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  max_guests INT NOT NULL,
  
  -- Pricing
  price_per_night DECIMAL(10,2) NOT NULL,
  weekly_price DECIMAL(10,2),
  monthly_price DECIMAL(10,2),
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Amenities (JSONB array)
  amenities JSONB DEFAULT '[]',
  
  -- Images (JSONB array of URLs)
  images JSONB DEFAULT '[]',
  
  -- Rules & Policies
  house_rules TEXT,
  check_in_time TIME DEFAULT '14:00',
  check_out_time TIME DEFAULT '11:00',
  cancellation_policy VARCHAR(50) DEFAULT '24_hours',
  
  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
  
  -- AI Voice - Custom FAQs for this property
  custom_faqs JSONB DEFAULT '[]',
  
  -- Ratings
  average_rating DECIMAL(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Availability Calendar
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'BLOCKED')),
  price_override DECIMAL(10,2),
  UNIQUE(property_id, date)
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  
  -- Parties
  guest_id UUID REFERENCES users(id),
  host_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  
  -- Dates
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INT NOT NULL,
  
  -- Guests
  num_guests INT NOT NULL,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'REFUNDED')),
  payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'ESCROWED', 'RELEASED', 'REFUNDED')),
  
  -- Check-in/out
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP,
  
  -- Notes
  guest_notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),
  
  payment_type VARCHAR(20) CHECK (payment_type IN ('BOOKING', 'WALLET_FUNDING', 'REFUND')),
  gateway VARCHAR(20) CHECK (gateway IN ('PAYSTACK', 'FLUTTERWAVE', 'STRIPE', 'WALLET')),
  
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  
  -- Gateway response
  reference VARCHAR(255) UNIQUE NOT NULL,
  gateway_reference VARCHAR(255),
  gateway_response JSONB,
  
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Escrow Table
CREATE TABLE escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  payment_id UUID REFERENCES payments(id),
  
  total_amount DECIMAL(10,2) NOT NULL,
  guest_fee DECIMAL(10,2) NOT NULL,
  host_commission DECIMAL(10,2) NOT NULL,
  host_payout DECIMAL(10,2) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'HELD' CHECK (status IN ('HELD', 'RELEASED', 'REFUNDED')),
  
  scheduled_release_date DATE NOT NULL,
  released_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  property_id UUID REFERENCES properties(id),
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  cleanliness_rating INT CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  accuracy_rating INT CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INT CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  type VARCHAR(20) CHECK (type IN ('CREDIT', 'DEBIT')),
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  
  description TEXT NOT NULL,
  reference VARCHAR(255),
  
  booking_id UUID REFERENCES bookings(id),
  payment_id UUID REFERENCES payments(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages/Chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_host ON properties(host_id);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);

CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_host ON bookings(host_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_availability_property_date ON availability(property_id, date);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_reference ON payments(reference);

CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_reviews_property ON reviews(property_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
