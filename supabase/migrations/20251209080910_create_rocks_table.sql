/*
  # Rock Leachate Prediction System

  1. New Tables
    - `rocks`
      - `id` (uuid, primary key) - Unique identifier for each rock
      - `rock_number` (text) - Rock identification number
      - `name` (text) - Custom name for the rock
      - `ec_rock` (decimal) - Electrical conductivity of rock
      - `ph_rock` (decimal) - pH of rock
      - `corg_rock` (decimal) - Organic carbon percentage
      - `ca_rock` (decimal) - Calcium content
      - `k_rock` (decimal) - Potassium content
      - `mg_rock` (decimal) - Magnesium content
      - `na_rock` (decimal) - Sodium content
      - `sar_rock` (decimal) - Sodium Adsorption Ratio
      - `sio2_rock` (decimal) - Silicon dioxide content
      - `al2o3_rock` (decimal) - Aluminum oxide content
      - `fe2o3_rock` (decimal) - Iron oxide content
      - `tio2_rock` (decimal) - Titanium dioxide content
      - `mno_rock` (decimal) - Manganese oxide content
      - `cao_rock` (decimal) - Calcium oxide content
      - `mgo_rock` (decimal) - Magnesium oxide content
      - `na2o_rock` (decimal) - Sodium oxide content
      - `k2o_rock` (decimal) - Potassium oxide content
      - `so3_rock` (decimal) - Sulfur trioxide content
      - `p2o5_rock` (decimal) - Phosphorus pentoxide content
      - `created_at` (timestamptz) - Creation timestamp
      
    - `predictions`
      - `id` (uuid, primary key) - Unique identifier
      - `rock_id` (uuid) - Reference to rock
      - `events_sequence` (jsonb) - Array of events applied
      - `predictions` (jsonb) - Array of leachate predictions
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Public read access for rocks (educational/demo purpose)
    - Public write access for predictions (educational/demo purpose)
*/

CREATE TABLE IF NOT EXISTS rocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rock_number text NOT NULL,
  name text NOT NULL,
  ec_rock decimal,
  ph_rock decimal,
  corg_rock decimal,
  ca_rock decimal,
  k_rock decimal,
  mg_rock decimal,
  na_rock decimal,
  sar_rock decimal,
  sio2_rock decimal,
  al2o3_rock decimal,
  fe2o3_rock decimal,
  tio2_rock decimal,
  mno_rock decimal,
  cao_rock decimal,
  mgo_rock decimal,
  na2o_rock decimal,
  k2o_rock decimal,
  so3_rock decimal,
  p2o5_rock decimal,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rock_id uuid REFERENCES rocks(id),
  events_sequence jsonb NOT NULL,
  predictions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to rocks"
  ON rocks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to rocks"
  ON rocks FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read access to predictions"
  ON predictions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to predictions"
  ON predictions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert some sample rocks
INSERT INTO rocks (rock_number, name, ec_rock, ph_rock, corg_rock, ca_rock, k_rock, mg_rock, na_rock, sar_rock, sio2_rock, al2o3_rock, fe2o3_rock, tio2_rock, mno_rock, cao_rock, mgo_rock, na2o_rock, k2o_rock, so3_rock, p2o5_rock) VALUES
('R001', 'Limestone Sample', 2.5, 8.2, 0.5, 35.2, 1.2, 2.8, 0.8, 0.3, 15.2, 3.5, 2.1, 0.3, 0.1, 48.5, 4.2, 1.1, 1.5, 0.8, 0.2),
('R002', 'Sandstone Sample', 1.8, 7.5, 0.3, 12.5, 2.5, 1.5, 1.2, 0.5, 65.3, 12.5, 4.2, 0.8, 0.05, 2.5, 2.1, 1.8, 3.2, 0.3, 0.1),
('R003', 'Granite Sample', 1.2, 6.8, 0.2, 8.5, 4.2, 1.8, 3.5, 1.2, 68.5, 15.2, 3.5, 0.5, 0.08, 1.8, 2.8, 4.2, 5.5, 0.2, 0.15);
