import { createClient } from "@supabase/supabase-js";
import {Database} from "../types/supabase";

const supabaseUrl: any = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: any = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);