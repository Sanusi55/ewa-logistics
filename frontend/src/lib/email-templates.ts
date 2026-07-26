export const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
  .header { background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 32px 24px; text-align: center; color: white; }
  .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
  .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
  .content { padding: 32px 24px; color: #1f2937; }
  .content h2 { margin: 0 0 16px 0; font-size: 22px; color: #111827; }
  .content p { margin: 0 0 16px 0; line-height: 1.6; color: #4b5563; font-size: 15px; }
  .info-box { background-color: #f9fafb; border-left: 4px solid #f97316; padding: 16px; margin: 20px 0; border-radius: 6px; }
  .info-box strong { color: #111827; }
  .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 20px 0; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
  .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }
  .footer a { color: #f97316; text-decoration: none; }
  .emoji { font-size: 40px; margin-bottom: 12px; }
`;

function wrapEmail(title: string, content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><style>${emailStyles}</style></head><body><div class="container"><div class="header"><h1>🚛 EWA Logistics</h1><p>Nigeria's trusted material delivery platform</p></div><div class="content">${content}</div><div class="footer"><p>© 2026 EWA Logistics. All rights reserved.</p><p>Need help? Reply to this email</p></div></div></body></html>`;
}

export function newOrderEmail(supplierName: string, materialName: string, quantity: number, unit: string, amount: number): string {
  return wrapEmail("New Order Received", `
    <div class="emoji">🆕</div>
    <h2>Hello ${supplierName},</h2>
    <p>You have a <strong>new order</strong> waiting for your review!</p>
    <div class="info-box">
      <p><strong>📦 Material:</strong> ${materialName}</p>
      <p><strong>📊 Quantity:</strong> ${quantity} ${unit}</p>
      <p><strong>💰 Order Value:</strong> ₦${amount.toLocaleString()}</p>
    </div>
    <p>Please log in to accept or reject this order.</p>
    <a href="http://localhost:3000/dashboard/supplier" class="button">View Order →</a>
  `);
}

export function orderAcceptedEmail(customerName: string, materialName: string): string {
  return wrapEmail("Order Accepted", `
    <div class="emoji">✅</div>
    <h2>Great news, ${customerName}!</h2>
    <p>Your supplier has <strong>accepted</strong> your order for <strong>${materialName}</strong>.</p>
    <div class="info-box">
      <p><strong>📦 Material:</strong> ${materialName}</p>
      <p><strong>🚛 Status:</strong> Drivers are now bidding</p>
    </div>
    <a href="http://localhost:3000/dashboard/orders" class="button">View Bids →</a>
  `);
}

export function driverAssignedEmail(customerName: string, driverName: string, materialName: string): string {
  return wrapEmail("Driver Assigned", `
    <div class="emoji">🚛</div>
    <h2>Hello ${customerName},</h2>
    <p>A driver has been assigned to your delivery!</p>
    <div class="info-box">
      <p><strong>👤 Driver:</strong> ${driverName}</p>
      <p><strong>📦 Material:</strong> ${materialName}</p>
    </div>
    <p>Share the <strong>4-digit delivery code</strong> with your driver when material arrives.</p>
    <a href="http://localhost:3000/dashboard/orders" class="button">View Details →</a>
  `);
}

export function bidAcceptedEmail(driverName: string, materialName: string, amount: number): string {
  return wrapEmail("Bid Accepted!", `
    <div class="emoji">🎉</div>
    <h2>Congratulations, ${driverName}!</h2>
    <p>Your bid has been <strong>accepted</strong>!</p>
    <div class="info-box">
      <p><strong>📦 Material:</strong> ${materialName}</p>
      <p><strong>💰 Your Fee:</strong> ₦${amount.toLocaleString()}</p>
    </div>
    <a href="http://localhost:3000/dashboard/driver" class="button">View Delivery →</a>
  `);
}

export function deliveryConfirmedEmail(recipientName: string, materialName: string, role: "supplier" | "driver"): string {
  const isSupplier = role === "supplier";
  return wrapEmail("Delivery Confirmed", `
    <div class="emoji">✅</div>
    <h2>Hello ${recipientName},</h2>
    <p>The customer has <strong>confirmed delivery</strong> of <strong>${materialName}</strong>.</p>
    <div class="info-box">
      <p><strong>📦 Material:</strong> ${materialName}</p>
      <p><strong>✅ Status:</strong> Delivered & Confirmed</p>
      <p><strong>💰 ${isSupplier ? "Payment" : "Earnings"}:</strong> ${isSupplier ? "Will be released" : "Will be credited"}</p>
    </div>
    <a href="http://localhost:3000/dashboard/${role}" class="button">Go to Dashboard →</a>
  `);
}

export function noDriverEmail(supplierName: string, materialName: string): string {
  return wrapEmail("No Driver Available", `
    <div class="emoji">⚠️</div>
    <h2>Attention, ${supplierName}</h2>
    <p>No driver was assigned within <strong>20 minutes</strong> for <strong>${materialName}</strong>.</p>
    <div class="info-box">
      <p><strong>📦 Material:</strong> ${materialName}</p>
      <p><strong>💡 Action:</strong> Assign your own driver</p>
    </div>
    <a href="http://localhost:3000/dashboard/supplier" class="button">Assign Driver →</a>
  `);
}