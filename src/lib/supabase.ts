import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Rock {
  id: string;
  rock_number: string;
  name: string;
  ec_rock: number;
  ph_rock: number;
  corg_rock: number;
  ca_rock: number;
  k_rock: number;
  mg_rock: number;
  na_rock: number;
  sar_rock: number;
  sio2_rock: number;
  al2o3_rock: number;
  fe2o3_rock: number;
  tio2_rock: number;
  mno_rock: number;
  cao_rock: number;
  mgo_rock: number;
  na2o_rock: number;
  k2o_rock: number;
  so3_rock: number;
  p2o5_rock: number;
  created_at?: string;
}

export interface Event {
  type_event: string;
  event_quantity: number;
  acid: number;
  temp: number;
  timestep: number;
}

export interface LeachatePrediction {
  timestep: number;
  volume_leachate: number;
  ec_leachate: number;
  ph_leachate: number;
  chloride_leachate: number;
  carbonate_leachate: number;
  sulfate_leachate: number;
  nitrate_leachate: number;
  phosphate_leachate: number;
  ca_leachate: number;
  fe_leachate: number;
  k_leachate: number;
  mg_leachate: number;
  mn_leachate: number;
  na_leachate: number;
  explanation: string[];
}
