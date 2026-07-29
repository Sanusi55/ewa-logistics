import { Resend } from "resend";

// ✅ FIX: Use the environment variable name instead of the actual key
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;