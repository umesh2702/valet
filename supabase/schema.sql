-- ULink Valet Database Schema for Supabase PostgreSQL
-- Itihaas Restaurant & Banquets

-- Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile_number);

-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_number ON vehicles(vehicle_number);

-- 3. VALET REQUESTS TABLE
CREATE TABLE IF NOT EXISTS valet_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (
        status IN (
            'AVAILABLE',
            'REQUESTED',
            'CAR_FOUND',
            'BRINGING',
            'READY',
            'COMPLETED',
            'NOT_FOUND'
        )
    ),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_valet_requests_status ON valet_requests(status);
CREATE INDEX IF NOT EXISTS idx_valet_requests_customer ON valet_requests(customer_id);

-- 4. REVIEW SESSIONS TABLE
CREATE TABLE IF NOT EXISTS review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    valet_request_id UUID REFERENCES valet_requests(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    selected_feedback JSONB DEFAULT '[]'::jsonb,
    generated_review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_valet_requests_timestamp ON valet_requests;
CREATE TRIGGER update_valet_requests_timestamp
BEFORE UPDATE ON valet_requests
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_review_sessions_timestamp ON review_sessions;
CREATE TRIGGER update_review_sessions_timestamp
BEFORE UPDATE ON review_sessions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE valet_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure clean idempotent execution
DROP POLICY IF EXISTS "Allow anon select on customers" ON customers;
DROP POLICY IF EXISTS "Allow anon insert on customers" ON customers;
DROP POLICY IF EXISTS "Allow anon update on customers" ON customers;

DROP POLICY IF EXISTS "Allow anon select on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow anon insert on vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow anon update on vehicles" ON vehicles;

DROP POLICY IF EXISTS "Allow anon select on valet_requests" ON valet_requests;
DROP POLICY IF EXISTS "Allow anon insert on valet_requests" ON valet_requests;
DROP POLICY IF EXISTS "Allow anon update on valet_requests" ON valet_requests;

DROP POLICY IF EXISTS "Allow anon select on review_sessions" ON review_sessions;
DROP POLICY IF EXISTS "Allow anon insert on review_sessions" ON review_sessions;
DROP POLICY IF EXISTS "Allow anon update on review_sessions" ON review_sessions;

-- Create RLS policies for public/anon access in prototype
CREATE POLICY "Allow anon select on customers" ON customers FOR SELECT TO public USING (true);
CREATE POLICY "Allow anon insert on customers" ON customers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow anon update on customers" ON customers FOR UPDATE TO public USING (true);

CREATE POLICY "Allow anon select on vehicles" ON vehicles FOR SELECT TO public USING (true);
CREATE POLICY "Allow anon insert on vehicles" ON vehicles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow anon update on vehicles" ON vehicles FOR UPDATE TO public USING (true);

CREATE POLICY "Allow anon select on valet_requests" ON valet_requests FOR SELECT TO public USING (true);
CREATE POLICY "Allow anon insert on valet_requests" ON valet_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow anon update on valet_requests" ON valet_requests FOR UPDATE TO public USING (true);

CREATE POLICY "Allow anon select on review_sessions" ON review_sessions FOR SELECT TO public USING (true);
CREATE POLICY "Allow anon insert on review_sessions" ON review_sessions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow anon update on review_sessions" ON review_sessions FOR UPDATE TO public USING (true);

-- Enable Realtime publication for valet_requests table safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'valet_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE valet_requests;
    END IF;
END $$;

-- SEED DEMO DATA USING POSTGRESQL-GENERATED UUIDs (gen_random_uuid())
DO $$
DECLARE
    c1_id UUID;
    v1_id UUID;
    c2_id UUID;
    v2_id UUID;
    c3_id UUID;
    v3_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM customers) THEN
        -- Seed 1: Umesh (Toyota Fortuner - AVAILABLE)
        INSERT INTO customers (name, mobile_number)
        VALUES ('Umesh', '+91 9876543210')
        RETURNING id INTO c1_id;

        INSERT INTO vehicles (customer_id, vehicle_number, vehicle_model)
        VALUES (c1_id, 'TS09 AB 1234', 'Toyota Fortuner')
        RETURNING id INTO v1_id;

        INSERT INTO valet_requests (customer_id, vehicle_id, status)
        VALUES (c1_id, v1_id, 'AVAILABLE');

        -- Seed 2: Priya Sharma (Mercedes Benz C-Class - REQUESTED)
        INSERT INTO customers (name, mobile_number)
        VALUES ('Priya Sharma', '+91 9812345678')
        RETURNING id INTO c2_id;

        INSERT INTO vehicles (customer_id, vehicle_number, vehicle_model)
        VALUES (c2_id, 'TS07 EX 5678', 'Mercedes Benz C-Class')
        RETURNING id INTO v2_id;

        INSERT INTO valet_requests (customer_id, vehicle_id, status)
        VALUES (c2_id, v2_id, 'REQUESTED');

        -- Seed 3: Vikram Reddy (BMW X5 - READY)
        INSERT INTO customers (name, mobile_number)
        VALUES ('Vikram Reddy', '+91 9765432109')
        RETURNING id INTO c3_id;

        INSERT INTO vehicles (customer_id, vehicle_number, vehicle_model)
        VALUES (c3_id, 'TS08 GH 9012', 'BMW X5')
        RETURNING id INTO v3_id;

        INSERT INTO valet_requests (customer_id, vehicle_id, status)
        VALUES (c3_id, v3_id, 'READY');
    END IF;
END $$;
