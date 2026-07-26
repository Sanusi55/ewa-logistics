"use server";

import resend from "@/lib/resend";
import {
  newOrderEmail,
  orderAcceptedEmail,
  driverAssignedEmail,
  bidAcceptedEmail,
  deliveryConfirmedEmail,
  noDriverEmail,
} from "@/lib/email-templates";

async function getUserInfo(userId: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();
  
  return { email: data?.email, name: data?.full_name || "there" };
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not set");
      return { success: false };
    }

    const { data, error } = await resend.emails.send({
      from: "EWA Logistics <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Email error:", error);
      return { success: false };
    }

    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Email exception:", error);
    return { success: false };
  }
}

export async function emailSupplierNewOrder(supplierId: string, materialName: string, quantity: number, unit: string, amount: number) {
  const { email, name } = await getUserInfo(supplierId);
  if (!email) return { success: false };
  return sendEmail(email, `🆕 New Order: ${materialName}`, newOrderEmail(name, materialName, quantity, unit, amount));
}

export async function emailCustomerOrderAccepted(customerId: string, materialName: string) {
  const { email, name } = await getUserInfo(customerId);
  if (!email) return { success: false };
  return sendEmail(email, `✅ Order Accepted: ${materialName}`, orderAcceptedEmail(name, materialName));
}

export async function emailCustomerDriverAssigned(customerId: string, driverName: string, materialName: string) {
  const { email, name } = await getUserInfo(customerId);
  if (!email) return { success: false };
  return sendEmail(email, `🚛 Driver Assigned: ${driverName}`, driverAssignedEmail(name, driverName, materialName));
}

export async function emailDriverBidAccepted(driverId: string, materialName: string, amount: number) {
  const { email, name } = await getUserInfo(driverId);
  if (!email) return { success: false };
  return sendEmail(email, `🎉 Your Bid Was Accepted!`, bidAcceptedEmail(name, materialName, amount));
}

export async function emailDeliveryConfirmed(supplierId: string, driverId: string | null, materialName: string) {
  const promises = [];
  
  const supplierInfo = await getUserInfo(supplierId);
  if (supplierInfo.email) {
    promises.push(sendEmail(supplierInfo.email, `✅ Delivery Confirmed: ${materialName}`, deliveryConfirmedEmail(supplierInfo.name, materialName, "supplier")));
  }

  if (driverId) {
    const driverInfo = await getUserInfo(driverId);
    if (driverInfo.email) {
      promises.push(sendEmail(driverInfo.email, `✅ Delivery Completed: ${materialName}`, deliveryConfirmedEmail(driverInfo.name, materialName, "driver")));
    }
  }

  return Promise.all(promises);
}

export async function emailSupplierNoDriver(supplierId: string, materialName: string) {
  const { email, name } = await getUserInfo(supplierId);
  if (!email) return { success: false };
  return sendEmail(email, `⚠️ No Driver: ${materialName}`, noDriverEmail(name, materialName));
}