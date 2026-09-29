"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// 🛡️ DEFENSIVE: Only initialize Resend if API key exists to prevent crashes
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ============================================
// 🔔 UNIFIED NOTIFICATION HELPER (In-App + Email)
// ============================================
async function sendNotification({
  userId,
  title,
  message,
  type = "info",
  emailSubject,
  emailHtml,
  userEmail,
}: {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error" | "order";
  emailSubject?: string;
  emailHtml?: string;
  userEmail?: string;
}) {
  const supabase = await createClient();

  // 1. Save In-App Notification
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    is_read: false,
  });

  // 2. Send Email Notification (if details provided)
  if (resend && userEmail && emailSubject && emailHtml) {
    try {
      // 💡 PRO TIP: Change "onboarding@resend.dev" to your verified domain (e.g., "notifications@ewalogistics.com")
      await resend.emails.send({
        from: "EWA Logistics <onboarding@resend.dev>",
        to: [userEmail],
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (error) {
      console.error(`⚠️ Failed to send email to ${userEmail}:`, error);
    }
  }
}

// ============================================
// 📦 CREATE ORDER (SECURED: Waits for Payment)
// ============================================
export async function createOrder(orderData: {
  material_type: string;
  tonnage: number;
  pickup_location: string;
  delivery_location: string;
  delivery_address: string;
  customer_notes?: string;
  total_amount: number;
  delivery_fee_offer?: number | null;
}) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "You must be logged in to create an order" };
    }

    if (!orderData.material_type || !orderData.tonnage || !orderData.pickup_location || !orderData.delivery_location || !orderData.delivery_address) {
      return { error: "All fields are required" };
    }

    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
    const service_charge = 0; // ✅ CHANGED: Service charge temporarily set to 0 to gain traction

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        material_type: orderData.material_type,
        tonnage: orderData.tonnage,
        pickup_location: orderData.pickup_location,
        delivery_location: orderData.delivery_location,
        delivery_address: orderData.delivery_address,
        customer_notes: orderData.customer_notes,
        delivery_code: deliveryCode,
        total_amount: orderData.total_amount,
        service_charge: service_charge,
        delivery_fee_offer: orderData.delivery_fee_offer || null,
        status: "pending_payment", // ✅ SECURED: Must wait for payment first!
        is_paid: false,            // ✅ SECURED: Explicitly mark as unpaid
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Order creation error:", error);
      return { error: "Failed to create order" };
    }

    await supabase.from("order_status_history").insert({
      order_id: data.id,
      new_status: "pending_payment", // ✅ SECURED
      changed_by: user.id,
      notes: "Order created, awaiting payment", // ✅ SECURED
    });

    // 📢 NOTIFY ADMIN & SUPPLIERS (Customer places order)
    const { data: admins } = await supabase.from("profiles").select("id, email, full_name").eq("role", "admin");
    if (admins) {
      for (const admin of admins) {
        await sendNotification({
          userId: admin.id,
          title: "New Order Placed",
          message: `A new order for ${orderData.material_type} has been placed and is awaiting payment.`,
          type: "info",
          emailSubject: "🔔 New Order Placed on EWA Logistics",
          emailHtml: `<p>A new order for <strong>${orderData.material_type}</strong> (${orderData.tonnage} tons) has been placed and is awaiting payment.</p>`,
          userEmail: admin.email,
        });
      }
    }

    const { data: suppliers } = await supabase.from("profiles").select("id, email, full_name").eq("role", "supplier");
    if (suppliers) {
      for (const supplier of suppliers) {
        await sendNotification({
          userId: supplier.id,
          title: "New Order Available",
          message: `A new order for ${orderData.material_type} is available.`,
          type: "info",
          emailSubject: "📦 New Order Available for Your Review",
          emailHtml: `<p>A new order for <strong>${orderData.material_type}</strong> (${orderData.tonnage} tons) is available in the system.</p>`,
          userEmail: supplier.email,
        });
      }
    }

    return { 
      success: true, 
      order: data,
      message: "Order created! Please proceed to payment." 
    };
  } catch (error: any) {
    console.error("❌ Create order exception:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// ============================================
// 🔍 GET AVAILABLE JOBS FOR DRIVERS
// ============================================
export async function getAvailableJobs() {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized", jobs: [] };
    }

    const { data: jobs, error } = await supabase
      .from("orders")
      .select(`
        *,
        driver_bids (
          id,
          driver_id,
          status
        )
      `)
      .eq("status", "driver_searching")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Get available jobs error:", error);
      return { error: error.message, jobs: [] };
    }

    const jobsWithBidStatus = jobs.map((job: any) => {
      const hasBid = job.driver_bids?.some((bid: any) => bid.driver_id === user.id);
      return { ...job, hasBid };
    });

    return { jobs: jobsWithBidStatus };
  } catch (error: any) {
    console.error("❌ Get available jobs exception:", error);
    return { error: error.message, jobs: [] };
  }
}

// ============================================
// 📋 GET USER ORDERS (SECURED FOR ALL ROLES)
// ============================================
export async function getUserOrders(role: "customer" | "supplier" | "driver") {
  console.log("🚀 [SERVER ACTION] getUserOrders started for role:", role);
  const supabase = await createClient();
  console.log("✅ [SERVER ACTION] Supabase client initialized");
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("✅ [SERVER ACTION] User authenticated, ID:", user?.id);
    
    if (authError || !user) {
      console.error("❌ Auth error in getUserOrders:", authError);
      return { error: "Unauthorized", orders: [] };
    }

    let query = supabase
      .from("orders")
      .select(`
        *,
        driver_bids (
          id,
          bid_amount,
          estimated_arrival_minutes,
          driver_message,
          status,
          driver_id
        )
      `)
      .order("created_at", { ascending: false });

    if (role === "customer") {
      query = query.eq("customer_id", user.id);
    } else if (role === "supplier") {
      // ✅ SECURED: Fetch ONLY paid orders pending acceptance, OR orders already assigned to this supplier
      query = query.or(
        `supplier_id.eq.${user.id},and(status.eq.pending_supplier_acceptance,is_paid.eq.true)`
      );
    } else if (role === "driver") {
      query = query.eq("driver_id", user.id);
    }

    console.log("⏳ [SERVER ACTION] Executing Supabase query...");
    const { data, error } = await query;
    console.log("✅ [SERVER ACTION] Query complete. Rows returned:", data?.length);

    if (error) {
      console.error("❌ Get orders database error:", error);
      return { error: error.message, orders: [] };
    }

    return { orders: data || [] };
  } catch (error: any) {
    console.error("❌ Get orders exception:", error);
    return { error: error.message, orders: [] };
  }
}

// ============================================
// 📦 GET ORDER BY ID
// ============================================
export async function getOrderById(orderId: string) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        driver_bids (
          id,
          bid_amount,
          estimated_arrival_minutes,
          driver_message,
          status,
          driver_id
        ),
        delivery_evidence (
          id,
          evidence_type,
          file_url,
          file_type,
          file_name,
          notes,
          created_at
        ),
        order_status_history (
          id,
          old_status,
          new_status,
          notes,
          created_at
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("❌ Get order error:", error);
      return { error: error.message };
    }

    if (data.customer_id !== user.id && data.supplier_id !== user.id && data.driver_id !== user.id) {
      return { error: "You don't have permission to view this order" };
    }

    return { order: data };
  } catch (error: any) {
    console.error("❌ Get order exception:", error);
    return { error: error.message };
  }
}

// ============================================
// ✅ SUPPLIER ACCEPTS ORDER (Calculates Supplier Commission)
// ============================================
export async function supplierAcceptOrder(orderId: string, materialPrice: number) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    const { data: order, error: orderFetchError } = await supabase
      .from("orders")
      .select("material_type, tonnage, customer_id")
      .eq("id", orderId)
      .single();

    let supplier_commission = 0;
    if (order) {
      const isGranite = order.material_type.toLowerCase().includes("granite");
      if (isGranite) {
        supplier_commission = order.tonnage * 500;
      } else {
        supplier_commission = 5000;
      }
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        supplier_id: user.id,
        material_price: materialPrice,
        supplier_commission: supplier_commission,
        status: "driver_searching",
        supplier_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("❌ Supplier accept error:", error);
      return { error: "Failed to accept order" };
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: "pending_supplier_acceptance",
      new_status: "driver_searching",
      changed_by: user.id,
      notes: "Supplier accepted order, driver search started",
    });

    // 📢 NOTIFY CUSTOMER (Existing logic, upgraded to use helper)
    if (order) {
      const { data: customer } = await supabase.from("profiles").select("email, full_name").eq("id", order.customer_id).single();
      if (customer) {
        await sendNotification({
          userId: order.customer_id,
          title: "Order Accepted! 🎉",
          message: "A supplier has accepted your order. We are now searching for the best driver for you.",
          type: "success",
          emailSubject: "✅ Order Accepted - Driver Search Started",
          emailHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #ea580c;">Order Accepted!</h2>
              <p>Great news! A supplier has accepted your order and we're now searching for the best driver for you.</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Material:</strong> ${order.material_type}</p>
                <p><strong>Tonnage:</strong> ${order.tonnage} tons</p>
                <p><strong>Status:</strong> Driver Search in Progress (30 minutes)</p>
              </div>
              <p>You'll receive another notification once a driver is assigned.</p>
            </div>
          `,
          userEmail: customer.email,
        });
      }
    }

    // 📢 NOTIFY DRIVERS IN SUPPLIER'S STATE
    const { data: supplierProfile } = await supabase.from("profiles").select("state").eq("id", user.id).single();
    if (supplierProfile?.state && order) {
      const { data: drivers } = await supabase.from("profiles").select("id, email, full_name").eq("role", "driver").eq("state", supplierProfile.state);
      if (drivers) {
        for (const driver of drivers) {
          await sendNotification({
            userId: driver.id,
            title: "New Delivery Job Available! 🚛",
            message: `A new order for ${order.material_type} needs a driver in ${supplierProfile.state}.`,
            type: "info",
            emailSubject: "🚛 New Delivery Job Available in Your Area!",
            emailHtml: `<p>Hi ${driver.full_name},</p><p>A new order for <strong>${order.material_type}</strong> (${order.tonnage} tons) needs a driver in <strong>${supplierProfile.state}</strong>.</p><p>Log in to your dashboard to place your bid!</p>`,
            userEmail: driver.email,
          });
        }
      }
    }

    return { 
      success: true, 
      order: data,
      message: "Order accepted! Driver search started." 
    };
  } catch (error: any) {
    console.error("❌ Supplier accept exception:", error);
    return { error: error.message };
  }
}

// ============================================
// 🚛 DRIVER SUBMITS BID
// ============================================
export async function submitDriverBid(orderId: string, bidData: {
  bid_amount: number;
  estimated_arrival_minutes?: number;
  driver_message?: string;
}) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    if (!bidData.bid_amount || bidData.bid_amount <= 0) {
      return { error: "Invalid bid amount" };
    }

    const { data: existingBid } = await supabase
      .from("driver_bids")
      .select("id")
      .eq("order_id", orderId)
      .eq("driver_id", user.id)
      .single();

    if (existingBid) {
      return { error: "You have already submitted a bid for this order" };
    }

    const { data, error } = await supabase
      .from("driver_bids")
      .insert({
        order_id: orderId,
        driver_id: user.id,
        bid_amount: bidData.bid_amount,
        estimated_arrival_minutes: bidData.estimated_arrival_minutes,
        driver_message: bidData.driver_message,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Submit bid error:", error);
      return { error: "Failed to submit bid" };
    }

    return { 
      success: true, 
      bid: data,
      message: "Bid submitted successfully!" 
    };
  } catch (error: any) {
    console.error("❌ Submit bid exception:", error);
    return { error: error.message };
  }
}

// ============================================
// ✅ CUSTOMER ACCEPTS DRIVER BID (Calculates Driver Commission)
// ============================================
export async function customerAcceptBid(orderId: string, bidId: string) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    const { data: bid, error: bidError } = await supabase
      .from("driver_bids")
      .select("*")
      .eq("id", bidId)
      .eq("order_id", orderId)
      .single();

    if (bidError || !bid) {
      return { error: "Bid not found" };
    }

    const { data: driver } = await supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", bid.driver_id)
      .single();

    const { data: order } = await supabase
      .from("orders")
      .select("supplier_id, material_type")
      .eq("id", orderId)
      .single();

    const driver_commission = bid.bid_amount * 0.05;

    await supabase
      .from("driver_bids")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", bidId);

    await supabase
      .from("driver_bids")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .neq("id", bidId);

    // ✅ CHANGED: Status is now pending_delivery_payment instead of driver_assigned
    const { data: updatedOrder, error: orderError } = await supabase
      .from("orders")
      .update({
        driver_id: bid.driver_id,
        driver_name: driver?.full_name || "Unknown",
        driver_phone: driver?.phone || "Not provided",
        delivery_fee: bid.bid_amount,
        driver_commission: driver_commission,
        status: "pending_delivery_payment", // ✅ Wait for delivery payment first
        driver_assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (orderError) {
      console.error("❌ Accept bid error:", orderError);
      return { error: "Failed to assign driver" };
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: "driver_searching",
      new_status: "pending_delivery_payment", // ✅ Updated history
      changed_by: user.id,
      notes: `Customer accepted bid from driver, awaiting delivery payment`,
    });

    // 📢 NOTIFY SELECTED DRIVER
    if (driver) {
      await sendNotification({
        userId: bid.driver_id,
        title: "Bid Accepted! 🎉",
        message: "Your bid has been accepted. Please await delivery fee payment from the customer.",
        type: "success",
        emailSubject: "✅ Your Bid Has Been Accepted!",
        emailHtml: `<p>Great news, ${driver.full_name}!</p><p>Your bid for the delivery of <strong>${order?.material_type}</strong> has been accepted by the customer.</p><p>Please await the delivery fee payment to be officially assigned to this trip.</p>`,
        userEmail: driver.email,
      });
    }

    // 📢 NOTIFY ADMIN
    const { data: admins } = await supabase.from("profiles").select("id, email").eq("role", "admin");
    if (admins) {
      for (const admin of admins) {
        await sendNotification({
          userId: admin.id,
          title: "Driver Bid Accepted",
          message: `Customer accepted a bid for Order ${orderId}. Awaiting delivery payment.`,
          type: "info",
          emailSubject: "🔔 Driver Bid Accepted - Awaiting Payment",
          emailHtml: `<p>Admin Alert:</p><p>A customer has accepted a driver's bid for Order <strong>${orderId}</strong>. The system is now awaiting delivery fee payment.</p>`,
          userEmail: admin.email,
        });
      }
    }

    // 📢 NOTIFY SUPPLIER (Existing logic, upgraded to use helper)
    if (order?.supplier_id) {
      const { data: supplier } = await supabase.from("profiles").select("email").eq("id", order.supplier_id).single();
      if (supplier) {
        await sendNotification({
          userId: order.supplier_id,
          title: "Driver Bid Accepted",
          message: "The customer has accepted a driver's bid. Awaiting delivery payment.",
          type: "info",
          emailSubject: "🚛 Driver Bid Accepted - Awaiting Delivery Payment",
          emailHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #ea580c;">Driver Bid Accepted!</h2>
              <p>The customer has accepted a driver's bid. Once the delivery fee is paid, the driver will be officially assigned.</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Driver Name:</strong> ${updatedOrder.driver_name}</p>
                <p><strong>Driver Phone:</strong> ${updatedOrder.driver_phone}</p>
                <p><strong>Delivery Fee:</strong> ₦${updatedOrder.delivery_fee?.toLocaleString()}</p>
              </div>
            </div>
          `,
          userEmail: supplier.email,
        });
      }
    }

    return { 
      success: true, 
      order: updatedOrder,
      message: "Driver bid accepted! Awaiting delivery payment." 
    };
  } catch (error: any) {
    console.error("❌ Accept bid exception:", error);
    return { error: error.message };
  }
}

// ============================================
// 💰 CUSTOMER CONFIRMS DELIVERY PAYMENT (UPDATED)
// ============================================
export async function confirmDeliveryPayment(orderId: string, proofFile?: File) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 1. Verify order belongs to this customer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_id, status, delivery_fee, driver_id, material_type, supplier_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "Order not found" };
    if (order.customer_id !== user.id) return { error: "You are not the customer for this order" };
    if (order.status !== "pending_delivery_payment") return { error: "Order is not pending delivery payment" };

    let proofUrl = null;

    // 2. Upload proof of payment if provided
    if (proofFile) {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `delivery-payment-${orderId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('delivery-evidence') // Reusing existing bucket
        .upload(`public/${fileName}`, proofFile);
        
      if (uploadError) {
        console.error("❌ Payment proof upload error:", uploadError);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('delivery-evidence')
          .getPublicUrl(`public/${fileName}`);
        proofUrl = publicUrl;
      }
    }

    // 3. Update order status to driver_assigned
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "driver_assigned", // ✅ NOW the driver is officially assigned
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) return { error: "Failed to confirm delivery payment" };

    // 4. Record status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: "pending_delivery_payment",
      new_status: "driver_assigned",
      changed_by: user.id,
      notes: "Customer confirmed delivery fee payment. Driver officially assigned.",
    });

    // 📢 NOTIFY SUPPLIER
    if (order.supplier_id) {
      const { data: supplier } = await supabase.from("profiles").select("id, email, full_name").eq("id", order.supplier_id).single();
      if (supplier) {
        await sendNotification({
          userId: supplier.id,
          title: "Delivery Fee Paid! 💰",
          message: "The customer has paid the delivery fee. The driver is now officially assigned and will proceed to your location.",
          type: "success",
          emailSubject: "✅ Delivery Fee Paid - Driver Assigned",
          emailHtml: `<p>Good news!</p><p>The customer has paid the delivery fee for Order <strong>${orderId}</strong> (${order.material_type}).</p><p>The driver is now officially assigned and will proceed to your location shortly.</p>`,
          userEmail: supplier.email,
        });
      }
    }

    // 📢 NOTIFY DRIVER (Existing logic, upgraded to use helper)
    if (order.driver_id) {
      const { data: driverProfile } = await supabase.from("profiles").select("email, full_name").eq("id", order.driver_id).single();
      if (driverProfile) {
        await sendNotification({
          userId: order.driver_id,
          title: "Delivery Fee Secured! 🎉",
          message: "The customer has paid the delivery fee. You are now officially assigned to this trip.",
          type: "success",
          emailSubject: "🚛 Delivery Fee Paid! You are officially assigned.",
          emailHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #ea580c;">Delivery Fee Secured! 🎉</h2>
              <p>Great news, ${driverProfile.full_name}! The customer has paid the delivery fee, and you are now officially assigned to this trip.</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Delivery Fee Secured:</strong> ₦${order.delivery_fee?.toLocaleString()}</p>
                <p><strong>Material:</strong> ${order.material_type || 'Construction Material'}</p>
                <p><strong>Action Required:</strong> Please proceed to the pickup location and contact the customer upon arrival to get your 4-digit delivery code.</p>
              </div>
              <p>Drive safely and have a great trip!</p>
            </div>
          `,
          userEmail: driverProfile.email,
        });
      }
    }

    return { success: true, message: "Delivery payment confirmed! Driver has been officially assigned." };
  } catch (error: any) {
    console.error("❌ Confirm delivery payment exception:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// ============================================
// 🚛 SUPPLIER USES OWN DRIVER (UPDATED WITH FEE)
// ============================================
export async function supplierUseOwnDriver(orderId: string, driverData: {
  driver_name: string;
  driver_phone: string;
  truck_plate_number: string;
  delivery_fee: number; // ✅ Added fee
}) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    if (!driverData.driver_name || !driverData.driver_phone || !driverData.truck_plate_number || !driverData.delivery_fee) {
      return { error: "All driver details and delivery fee are required" };
    }

    // ✅ UPDATED: Set status to pending_delivery_payment so customer gets the payment prompt
    const { data, error } = await supabase
      .from("orders")
      .update({
        driver_name: driverData.driver_name,
        driver_phone: driverData.driver_phone,
        truck_plate_number: driverData.truck_plate_number,
        delivery_fee: driverData.delivery_fee, // ✅ Save the fee
        status: "pending_delivery_payment", // ✅ Trigger customer payment flow
        driver_assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("supplier_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("❌ Use own driver error:", error);
      return { error: "Failed to assign driver" };
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: "no_driver_available",
      new_status: "pending_delivery_payment",
      changed_by: user.id,
      notes: `Supplier assigned own driver: ${driverData.driver_name}. Customer must pay delivery fee.`,
    });

    return { 
      success: true, 
      order: data,
      message: "Driver assigned! Customer has been notified to pay the delivery fee." 
    };
  } catch (error: any) {
    console.error("❌ Use own driver exception:", error);
    return { error: error.message };
  }
}

// ============================================
// ✅ CONFIRM DELIVERY BY DRIVER (WITH CODE & EVIDENCE + PENDING EARNINGS)
// ============================================
export async function confirmDriverDelivery(orderId: string, deliveryCode: string, evidenceFile?: File) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // ✅ Fetch ALL necessary fields including delivery_fee and driver_commission
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("delivery_code, driver_id, status, customer_id, supplier_id, delivery_fee, driver_commission, material_type, tonnage")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("❌ Order fetch error:", orderError);
      return { error: "Order not found" };
    }
    
    console.log("📊 Order Data:", { 
      delivery_fee: order.delivery_fee, 
      driver_commission: order.driver_commission,
      driver_id: order.driver_id,
      user_id: user.id
    });

    // ✅ Check if driver matches
    if (order.driver_id !== user.id) {
      return { error: "You are not the assigned driver for this order." };
    }

    // ✅ Type-safe code comparison
    if (String(order.delivery_code).trim() !== String(deliveryCode).trim()) {
      return { error: "Invalid delivery code. Please ask the customer for the correct 4-digit code." };
    }

    let evidenceUrl = null;

    if (evidenceFile) {
      const fileExt = evidenceFile.name.split('.').pop();
      const fileName = `${orderId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('delivery-evidence')
        .upload(`public/${fileName}`, evidenceFile);
        
      if (uploadError) {
        console.error("❌ Evidence upload error:", uploadError);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('delivery-evidence')
          .getPublicUrl(`public/${fileName}`);
        evidenceUrl = publicUrl;
      }
    }

    // ✅ Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivery_code_confirmed: true,
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("❌ RLS/Update error:", updateError);
      return { error: "Failed to update delivery status. Please ensure you are the assigned driver." };
    }

    // ✅ CALCULATE AND INSERT EARNINGS
    const gross_driver_amount = Number(order.delivery_fee) || 0;
    const driver_commission = Number(order.driver_commission) || 0;
    const net_driver_payout = Math.max(0, gross_driver_amount - driver_commission);

    console.log("💰 Calculating earnings:", {
      gross: gross_driver_amount,
      commission: driver_commission,
      net: net_driver_payout
    });

    if (net_driver_payout > 0 && order.driver_id) {
      const { error: earningsError } = await supabase.from("driver_earnings").insert({
        user_id: order.driver_id,
        order_id: orderId,
        amount: net_driver_payout,
        status: "pending", // Shows in "Pending Balance" until customer confirms
      });

      if (earningsError) {
        console.error("❌ Failed to insert driver earnings:", earningsError);
      } else {
        console.log("✅ Driver earnings inserted successfully:", net_driver_payout);
      }
    } else {
      console.warn("⚠️ No earnings to insert:", { net_driver_payout, driver_id: order.driver_id });
    }

    // ✅ Insert evidence if exists
    if (evidenceUrl) {
      await supabase.from("delivery_evidence").insert({
        order_id: orderId,
        driver_id: user.id,
        file_url: evidenceUrl,
        file_type: evidenceFile?.type || "application/octet-stream",
        file_name: evidenceFile?.name || "delivery_proof",
        notes: "Delivery proof uploaded by driver",
      });
    }

    // ✅ Record status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: order.status,
      new_status: "delivered",
      changed_by: user.id,
      notes: "Delivery confirmed by driver with code. Earnings marked as pending.",
    });

    // 📢 NOTIFY SUPPLIER
    if (order.supplier_id) {
      const { data: supplier } = await supabase.from("profiles").select("id, email, full_name").eq("id", order.supplier_id).single();
      if (supplier) {
        await sendNotification({
          userId: supplier.id,
          title: "Delivery Completed by Driver",
          message: `The driver has completed the delivery for ${order.material_type}. Awaiting customer confirmation.`,
          type: "success",
          emailSubject: "✅ Delivery Completed by Driver",
          emailHtml: `<p>The driver has successfully completed the delivery for Order <strong>${orderId}</strong> (${order.material_type}).</p><p>The order is now awaiting final confirmation from the customer to release the escrow payment.</p>`,
          userEmail: supplier.email,
        });
      }
    }

    // 📢 NOTIFY ADMIN
    const { data: admins } = await supabase.from("profiles").select("id, email").eq("role", "admin");
    if (admins) {
      for (const admin of admins) {
        await sendNotification({
          userId: admin.id,
          title: "Delivery Completed",
          message: `Driver completed delivery for Order ${orderId}. Awaiting customer confirmation.`,
          type: "info",
          emailSubject: "🔔 Delivery Completed - Awaiting Customer Confirmation",
          emailHtml: `<p>Admin Alert:</p><p>The driver has marked Order <strong>${orderId}</strong> as delivered. Awaiting final customer confirmation to release escrow.</p>`,
          userEmail: admin.email,
        });
      }
    }

    // 📢 NOTIFY CUSTOMER
    const { data: customer } = await supabase.from("profiles").select("id, email, full_name").eq("id", order.customer_id).single();
    if (customer) {
      await sendNotification({
        userId: customer.id,
        title: "Driver Arrived / Delivery Attempted",
        message: "Your driver has marked the order as delivered. Please confirm the delivery to release the escrow payment.",
        type: "warning",
        emailSubject: "📦 Your Delivery is Ready for Confirmation!",
        emailHtml: `<p>Hi ${customer.full_name},</p><p>Your driver has marked the delivery for Order <strong>${orderId}</strong> (${order.material_type}) as completed.</p><p>Please log in to your dashboard and confirm the delivery to release the escrow payment.</p>`,
        userEmail: customer.email,
      });
    }

    return { success: true, message: "Delivery confirmed successfully! Payment is now pending customer approval." };
  } catch (error: any) {
    console.error("❌ Confirm delivery exception:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// ============================================
// 📸 SUPPLIER UPLOADS DELIVERY EVIDENCE
// ============================================
export async function uploadSupplierEvidence(orderId: string, evidenceFile: File, notes?: string) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, supplier_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "Order not found" };
    if (order.supplier_id !== user.id) return { error: "You don't have permission to upload evidence for this order" };
    if (order.status !== "delivered") return { error: "Can only upload evidence for delivered orders" };

    const fileExt = evidenceFile.name.split('.').pop();
    const fileName = `supplier-${orderId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('delivery-evidence')
      .upload(`public/${fileName}`, evidenceFile);
      
    if (uploadError) {
      console.error("❌ Evidence upload error:", uploadError);
      return { error: "Failed to upload file. Please try again." };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('delivery-evidence')
      .getPublicUrl(`public/${fileName}`);

    const { error: insertError } = await supabase.from("delivery_evidence").insert({
      order_id: orderId,
      supplier_id: user.id,
      file_url: publicUrl,
      file_type: evidenceFile.type,
      file_name: evidenceFile.name,
      notes: notes || "Evidence uploaded by supplier",
    });

    if (insertError) {
      console.error("❌ Evidence insert error:", insertError);
      return { error: "Failed to record evidence in database" };
    }

    return { success: true, message: "Evidence uploaded successfully!" };
  } catch (error: any) {
    console.error("❌ Upload evidence exception:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// ============================================
// ✅ CUSTOMER CONFIRMS DELIVERY (RELEASES ESCROW & AUTO-DEDUCTS COMMISSIONS)
// ============================================
export async function confirmCustomerDelivery(orderId: string) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "Order not found" };
    if (order.customer_id !== user.id) return { error: "You are not the customer for this order" };
    if (order.status === "completed") return { error: "Order is already completed" };

    const service_charge = 0; // ✅ CHANGED: Service charge temporarily set to 0
    const supplier_commission = order.supplier_commission || 0;
    const driver_commission = order.driver_commission || 0;
    
    const ewa_revenue = service_charge + supplier_commission + driver_commission;

    const gross_supplier_amount = order.material_price || 0; 
    const net_supplier_payout = Math.max(0, gross_supplier_amount - supplier_commission);

    const gross_driver_amount = order.delivery_fee || 0;
    const net_driver_payout = Math.max(0, gross_driver_amount - driver_commission);

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        delivery_code_confirmed: true,
        delivered_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        ewa_revenue: ewa_revenue,
        net_supplier_payout: net_supplier_payout,
        net_driver_payout: net_driver_payout,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) return { error: "Failed to confirm delivery" };

    await supabase.from("ewa_wallet_transactions").insert({
      order_id: orderId,
      amount: ewa_revenue,
      type: "revenue",
      description: `Commission for Order ${orderId}`, // ✅ Updated description
    });

    if (net_supplier_payout > 0 && order.supplier_id) {
      await supabase.from("supplier_earnings").insert({
        user_id: order.supplier_id,
        order_id: orderId,
        amount: net_supplier_payout,
        status: "available",
      });
    }

    if (net_driver_payout > 0 && order.driver_id) {
      await supabase.from("driver_earnings").insert({
        user_id: order.driver_id,
        order_id: orderId,
        amount: net_driver_payout,
        status: "available", // Changes from "pending" to "available"
      });
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: order.status,
      new_status: "completed",
      changed_by: user.id,
      notes: "Delivery confirmed by customer. Escrow released and earnings credited.",
    });

    // 📢 NOTIFY CUSTOMER (Order Completed)
    const { data: customer } = await supabase.from("profiles").select("email, full_name").eq("id", order.customer_id).single();
    if (customer) {
      await sendNotification({
        userId: order.customer_id,
        title: "Order Completed Successfully! 🎉",
        message: "Your order is fully completed. Escrow has been released.",
        type: "success",
        emailSubject: "🎉 Order Completed Successfully!",
        emailHtml: `<p>Hi ${customer.full_name},</p><p>Your order <strong>${orderId}</strong> has been fully completed and the escrow payment has been successfully released to the supplier and driver.</p><p>Thank you for using EWA Logistics!</p>`,
        userEmail: customer.email,
      });
    }

    // 📢 NOTIFY SUPPLIER (Payment Released)
    if (order.supplier_id) {
      const { data: supplier } = await supabase.from("profiles").select("email, full_name").eq("id", order.supplier_id).single();
      if (supplier) {
        await sendNotification({
          userId: order.supplier_id,
          title: "Payment Released! 💰",
          message: "The customer has confirmed delivery. Your earnings have been credited to your wallet.",
          type: "success",
          emailSubject: "💰 Payment Released for Your Order!",
          emailHtml: `<p>Great news!</p><p>The customer has confirmed the delivery for Order <strong>${orderId}</strong>. Your earnings have been credited to your EWA Logistics wallet and are available for withdrawal.</p>`,
          userEmail: supplier.email,
        });
      }
    }

    // 📢 NOTIFY DRIVER (Payment Released)
    if (order.driver_id) {
      const { data: driver } = await supabase.from("profiles").select("email, full_name").eq("id", order.driver_id).single();
      if (driver) {
        await sendNotification({
          userId: order.driver_id,
          title: "Payment Released! 💰",
          message: "The customer has confirmed delivery. Your trip earnings have been credited to your wallet.",
          type: "success",
          emailSubject: "💰 Trip Earnings Credited to Your Wallet!",
          emailHtml: `<p>Great job, ${driver.full_name}!</p><p>The customer has confirmed the delivery for Order <strong>${orderId}</strong>. Your trip earnings have been credited to your EWA Logistics wallet and are available for withdrawal.</p>`,
          userEmail: driver.email,
        });
      }
    }

    // 📢 NOTIFY ADMIN
    const { data: admins } = await supabase.from("profiles").select("id, email").eq("role", "admin");
    if (admins) {
      for (const admin of admins) {
        await sendNotification({
          userId: admin.id,
          title: "Order Completed & Escrow Released",
          message: `Order ${orderId} is fully completed. Escrow released to supplier and driver.`,
          type: "success",
          emailSubject: "✅ Order Completed & Escrow Released",
          emailHtml: `<p>Admin Alert:</p><p>Order <strong>${orderId}</strong> has been fully completed by the customer. Escrow funds have been successfully released to the supplier and driver.</p>`,
          userEmail: admin.email,
        });
      }
    }

    return { success: true, message: "Delivery confirmed successfully! Escrow released and earnings credited." };
  } catch (error: any) {
    console.error("❌ Confirm delivery exception:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// ============================================
// ✅ VERIFY PAYMENT & UPDATE ORDER STATUS (UPDATED WITH NOTIFICATIONS)
// ============================================
export async function verifyPaymentAndUpdateOrder(orderId: string, txRef: string) {
  const supabase = await createClient();
  
  try {
    const { data: order } = await supabase.from("orders").select("customer_id, material_type, tonnage, pickup_location").eq("id", orderId).single();
    
    // 1. Update the order status in Supabase
    const { error } = await supabase
      .from("orders")
      .update({
        status: "pending_supplier_acceptance",
        is_paid: true,
        payment_reference: txRef,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("❌ Failed to update order status:", error);
      return { success: false, error: error.message };
    }

    // 2. Record in status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: "pending_payment",
      new_status: "pending_supplier_acceptance",
      changed_by: "system",
      notes: `Payment verified via Flutterwave (TxRef: ${txRef})`,
    });

    // 📢 NOTIFY ADMIN (Order is now paid and ready)
    const { data: admins } = await supabase.from("profiles").select("id, email, full_name").eq("role", "admin");
    if (admins) {
      for (const admin of admins) {
        await sendNotification({
          userId: admin.id,
          title: "Payment Verified - Order Ready",
          message: `Payment verified for ${order?.material_type}. Ready for supplier acceptance.`,
          type: "success",
          emailSubject: "✅ Payment Verified - Order Ready for Supplier",
          emailHtml: `<p>Payment has been successfully verified for an order of <strong>${order?.material_type}</strong>. It is now ready for supplier acceptance.</p>`,
          userEmail: admin.email,
        });
      }
    }

    // 📢 NOTIFY ALL SUPPLIERS (Order is now paid and ready)
    const { data: suppliers } = await supabase.from("profiles").select("id, email, full_name").eq("role", "supplier");
    if (suppliers) {
      for (const supplier of suppliers) {
        await sendNotification({
          userId: supplier.id,
          title: "New Paid Order Ready for Acceptance! 🎉",
          message: `A customer has paid for ${order?.material_type}. Please review and accept the order.`,
          type: "order",
          emailSubject: "📦 New Paid Order Ready for Your Acceptance!",
          emailHtml: `<p>A customer has successfully paid for an order of <strong>${order?.material_type}</strong> (${order?.tonnage} tons).</p><p>Please log in to your supplier dashboard to review and accept this order.</p>`,
          userEmail: supplier.email,
        });
      }
    }

    console.log("✅ Order status updated and notifications sent for Order ID:", orderId);
    return { success: true };

  } catch (error: any) {
    console.error("❌ Verify payment exception:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 🚛 CUSTOMER ASSIGNS OWN DRIVER (Triggers Payment)
// ============================================
export async function customerAssignOwnDriver(orderId: string, driverData: {
  driver_name: string;
  driver_phone: string;
  truck_plate_number: string;
  delivery_fee: number;
}) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Verify order belongs to this customer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "Order not found" };
    if (order.customer_id !== user.id) return { error: "You don't have permission to modify this order" };

    // Update order with own driver details and set to pending payment
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        driver_name: driverData.driver_name,
        driver_phone: driverData.driver_phone,
        truck_plate_number: driverData.truck_plate_number,
        delivery_fee: driverData.delivery_fee,
        status: "pending_delivery_payment", // This triggers the payment modal flow
        driver_assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("❌ Assign own driver error:", updateError);
      return { error: "Failed to assign driver" };
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: order.status,
      new_status: "pending_delivery_payment",
      changed_by: user.id,
      notes: `Customer assigned own driver: ${driverData.driver_name}. Awaiting delivery fee payment.`,
    });

    return { success: true, message: "Driver details saved. Please proceed to payment." };
  } catch (error: any) {
    console.error("❌ Assign own driver exception:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}