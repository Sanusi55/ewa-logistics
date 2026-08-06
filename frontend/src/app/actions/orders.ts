"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// 🛡️ DEFENSIVE: Only initialize Resend if API key exists to prevent crashes
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ============================================
// 📦 CREATE ORDER
// ============================================
export async function createOrder(orderData: {
  material_type: string;
  tonnage: number;
  pickup_location: string;
  delivery_location: string;
  delivery_address: string;
  customer_notes?: string;
  total_amount: number;
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

    // ✅ FIXED: Generates a random 4-digit number (e.g., "4829")
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // ✅ NEW: Flat 5k service charge for customers
    const service_charge = 5000; 

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
        service_charge: service_charge, // ✅ NEW: Record the service charge
        status: "pending_supplier_acceptance",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Order creation error:", error);
      return { error: "Failed to create order" };
    }

    await supabase.from("order_status_history").insert({
      order_id: data.id,
      new_status: "pending_supplier_acceptance",
      changed_by: user.id,
      notes: "Order created",
    });

    return { 
      success: true, 
      order: data,
      message: "Order created successfully! Waiting for supplier acceptance." 
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
// 📋 GET USER ORDERS (WITH DIAGNOSTIC TEST)
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

    // 🔍 DIAGNOSTIC TEST: Fetch ALL pending orders without complex filters to prove connection
    const { data: debugData, error: debugError } = await supabase
      .from("orders")
      .select("id, status, customer_id")
      .eq("status", "pending_supplier_acceptance");
    
    console.log("🔍 [DIAGNOSTIC TEST] Raw pending orders found:", debugData?.length, "Error:", debugError);

    // Normal Query
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
      // ✅ Fetch ALL pending orders OR orders assigned to this supplier
      query = query.or(
        `supplier_id.eq.${user.id},status.eq.pending_supplier_acceptance`
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

    // ✅ NEW: Fetch order to calculate commission based on material type and tonnage
    const { data: order, error: orderFetchError } = await supabase
      .from("orders")
      .select("material_type, tonnage")
      .eq("id", orderId)
      .single();

    let supplier_commission = 0;
    if (order) {
      const isGranite = order.material_type.toLowerCase().includes("granite");
      if (isGranite) {
        supplier_commission = order.tonnage * 500; // ✅ ₦500 per ton for granite
      } else {
        supplier_commission = 5000; // ✅ Fixed ₦5000 per trip for sand, stone base, etc.
      }
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        supplier_id: user.id,
        material_price: materialPrice,
        supplier_commission: supplier_commission, // ✅ NEW: Save calculated commission
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

    if (resend) {
      try {
        const { data: customer } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", data.customer_id)
          .single();

        if (customer) {
          await resend.emails.send({
            from: "EWA Logistics <onboarding@resend.dev>",
            to: [customer.email],
            subject: `✅ Order Accepted - Driver Search Started`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ea580c;">Order Accepted!</h2>
                <p>Great news! A supplier has accepted your order and we're now searching for the best driver for you.</p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p><strong>Order ID:</strong> ${orderId}</p>
                  <p><strong>Material:</strong> ${data.material_type}</p>
                  <p><strong>Tonnage:</strong> ${data.tonnage} tons</p>
                  <p><strong>Status:</strong> Driver Search in Progress (30 minutes)</p>
                </div>
                <p>You'll receive another notification once a driver is assigned.</p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error("⚠️ Failed to send email:", emailError);
      }
    } else {
      console.warn("⚠️ Resend API key missing. Email notification skipped.");
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
      .select("full_name, phone")
      .eq("id", bid.driver_id)
      .single();

    // ✅ NEW: Calculate Driver Commission (5% of accepted delivery charge)
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

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update({
        driver_id: bid.driver_id,
        driver_name: driver?.full_name || "Unknown",
        driver_phone: driver?.phone || "Not provided",
        delivery_fee: bid.bid_amount,
        driver_commission: driver_commission, // ✅ NEW: Save calculated commission
        status: "driver_assigned",
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
      new_status: "driver_assigned",
      changed_by: user.id,
      notes: `Customer accepted bid from driver`,
    });

    if (resend) {
      try {
        const { data: supplier } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", order.supplier_id)
          .single();

        if (supplier) {
          await resend.emails.send({
            from: "EWA Logistics <onboarding@resend.dev>",
            to: [supplier.email],
            subject: `🚛 Driver Assigned to Order`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ea580c;">Driver Assigned!</h2>
                <p>A driver has been assigned to your order.</p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p><strong>Driver Name:</strong> ${order.driver_name}</p>
                  <p><strong>Driver Phone:</strong> ${order.driver_phone}</p>
                  <p><strong>Delivery Fee:</strong> ₦${order.delivery_fee?.toLocaleString()}</p>
                </div>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error("⚠️ Failed to send email:", emailError);
      }
    } else {
      console.warn("⚠️ Resend API key missing. Email notification skipped.");
    }

    return { 
      success: true, 
      order: order,
      message: "Driver assigned successfully!" 
    };
  } catch (error: any) {
    console.error("❌ Accept bid exception:", error);
    return { error: error.message };
  }
}

// ============================================
// 🚛 SUPPLIER USES OWN DRIVER
// ============================================
export async function supplierUseOwnDriver(orderId: string, driverData: {
  driver_name: string;
  driver_phone: string;
  truck_plate_number: string;
}) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    if (!driverData.driver_name || !driverData.driver_phone || !driverData.truck_plate_number) {
      return { error: "All driver details are required" };
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        driver_name: driverData.driver_name,
        driver_phone: driverData.driver_phone,
        truck_plate_number: driverData.truck_plate_number,
        status: "supplier_driver_assigned",
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
      new_status: "supplier_driver_assigned",
      changed_by: user.id,
      notes: "Supplier assigned their own driver",
    });

    return { 
      success: true, 
      order: data,
      message: "Your driver has been assigned!" 
    };
  } catch (error: any) {
    console.error("❌ Use own driver exception:", error);
    return { error: error.message };
  }
}

// ============================================
// ✅ CONFIRM DELIVERY BY DRIVER (WITH CODE & EVIDENCE)
// ============================================
export async function confirmDriverDelivery(orderId: string, deliveryCode: string, evidenceFile?: File) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 1. Verify order and code
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("delivery_code, driver_id, status, customer_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "Order not found" };
    if (order.driver_id !== user.id) return { error: "You are not the assigned driver for this order" };
    if (order.delivery_code !== deliveryCode) return { error: "Invalid delivery code. Please ask the customer for the correct 4-digit code." };

    let evidenceUrl = null;

    // 2. Upload evidence if provided
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

    // 3. Update order status to delivered
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivery_code_confirmed: true,
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) return { error: "Failed to update delivery status" };

    // 4. Record evidence in database if uploaded
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

    // 5. Record status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: order.status,
      new_status: "delivered",
      changed_by: user.id,
      notes: "Delivery confirmed by driver with code",
    });

    return { success: true, message: "Delivery confirmed successfully! Payment will be released." };
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

    // 1. Verify order belongs to this supplier
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, supplier_id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "Order not found" };
    if (order.supplier_id !== user.id) return { error: "You don't have permission to upload evidence for this order" };
    if (order.status !== "delivered") return { error: "Can only upload evidence for delivered orders" };

    // 2. Upload file to Supabase Storage
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

    // 3. Record evidence in database
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

    // 1. Fetch full order details for financial calculation
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return { error: "Order not found" };
    if (order.customer_id !== user.id) return { error: "You are not the customer for this order" };
    if (order.status === "completed") return { error: "Order is already completed" };

    // 2. Calculate EWA Commissions & Net Payouts
    const service_charge = order.service_charge || 5000;
    const supplier_commission = order.supplier_commission || 0;
    const driver_commission = order.driver_commission || 0;
    
    // ✅ EWA Revenue = Service Charge + Supplier Commission + Driver Commission
    const ewa_revenue = service_charge + supplier_commission + driver_commission;

    // ✅ Net Payouts (Gross Amount - Commission)
    // Note: Assuming material_price is the total agreed material cost. 
    // If material_price is per-ton in your system, change this to: (order.material_price || 0) * (order.tonnage || 1)
    const gross_supplier_amount = order.material_price || 0; 
    const net_supplier_payout = Math.max(0, gross_supplier_amount - supplier_commission);

    const gross_driver_amount = order.delivery_fee || 0;
    const net_driver_payout = Math.max(0, gross_driver_amount - driver_commission);

    // 3. Update Order to Completed and store financial breakdown
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

    // 4. Credit EWA Wallet (Admin Revenue)
    await supabase.from("ewa_wallet_transactions").insert({
      order_id: orderId,
      amount: ewa_revenue,
      type: "revenue",
      description: `Commission & Service Charge for Order ${orderId}`,
    });

    // 5. Credit Supplier Earnings Dashboard
    if (net_supplier_payout > 0 && order.supplier_id) {
      await supabase.from("supplier_earnings").insert({
        user_id: order.supplier_id,
        order_id: orderId,
        amount: net_supplier_payout,
        status: "available",
      });
    }

    // 6. Credit Driver Earnings Dashboard
    if (net_driver_payout > 0 && order.driver_id) {
      await supabase.from("driver_earnings").insert({
        user_id: order.driver_id,
        order_id: orderId,
        amount: net_driver_payout,
        status: "available",
      });
    }

    // 7. Record status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: order.status,
      new_status: "completed",
      changed_by: user.id,
      notes: "Delivery confirmed by customer. Escrow released and commissions auto-deducted.",
    });

    return { success: true, message: "Delivery confirmed successfully! Escrow released and earnings credited." };
  } catch (error: any) {
    console.error("❌ Confirm delivery exception:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}