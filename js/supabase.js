const SUPABASE_URL = "https://jswsblfaxxlvmzhzzjhw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PO4jGiFM_jNPZcx10TT1IQ_Jk3mlgEg";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client berhasil dibuat.");