// Mock Email Service for Portfolio Demonstration
// In production, this would integrate with services like SendGrid, Resend, or AWS SES

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderConfirmationData {
  customer_email: string;
  customer_name: string;
  order_id: string;
  product_name: string;
  shop_name: string;
  amount_cents: number;
  currency: string;
  receipt_url?: string;
}

export interface SellerNotificationData {
  seller_email: string;
  shop_name: string;
  order_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  amount_cents: number;
  currency: string;
}

export class MockEmailService {
  private static instance: MockEmailService;
  private emailLog: Array<{ timestamp: Date; email: EmailTemplate }> = [];

  static getInstance(): MockEmailService {
    if (!MockEmailService.instance) {
      MockEmailService.instance = new MockEmailService();
    }
    return MockEmailService.instance;
  }

  // Mock email sending
  async sendEmail(email: EmailTemplate): Promise<{ success: boolean; messageId: string }> {
    // Log the email for demonstration purposes
    this.emailLog.push({
      timestamp: new Date(),
      email,
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock success (95% success rate)
    const success = Math.random() > 0.05;
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!success) {
      throw new Error('Failed to send email');
    }

    console.log(`[MOCK EMAIL] Sent to: ${email.to}`);
    console.log(`[MOCK EMAIL] Subject: ${email.subject}`);
    console.log(`[MOCK EMAIL] Message ID: ${messageId}`);

    return { success, messageId };
  }

  // Send order confirmation to customer
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<{ success: boolean; messageId: string }> {
    const email: EmailTemplate = {
      to: data.customer_email,
      subject: `Order Confirmed - ${data.product_name}`,
      html: this.generateOrderConfirmationHTML(data),
      text: this.generateOrderConfirmationText(data),
    };

    return this.sendEmail(email);
  }

  // Send new order notification to seller
  async sendSellerNotification(data: SellerNotificationData): Promise<{ success: boolean; messageId: string }> {
    const email: EmailTemplate = {
      to: data.seller_email,
      subject: `New Order - ${data.product_name}`,
      html: this.generateSellerNotificationHTML(data),
      text: this.generateSellerNotificationText(data),
    };

    return this.sendEmail(email);
  }

  // Generate HTML template for order confirmation
  private generateOrderConfirmationHTML(data: OrderConfirmationData): string {
    const amount = (data.amount_cents / 100).toFixed(2);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customer_name},</p>
            <p>Thank you for your order! We've received your payment and your order is being processed.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${data.order_id}</p>
              <p><strong>Product:</strong> ${data.product_name}</p>
              <p><strong>Shop:</strong> ${data.shop_name}</p>
              <p><strong>Amount:</strong> $${amount} ${data.currency.toUpperCase()}</p>
            </div>
            
            <p>You'll receive another email with tracking information once your order ships.</p>
            
            ${data.receipt_url ? `<p><a href="${data.receipt_url}" class="button">View Receipt</a></p>` : ''}
            
            <p>If you have any questions, please reply to this email.</p>
            
            <p>Best regards,<br>The ${data.shop_name} Team</p>
          </div>
          <div class="footer">
            <p>This is a demo email from SingleShop - Portfolio Project</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate text template for order confirmation
  private generateOrderConfirmationText(data: OrderConfirmationData): string {
    const amount = (data.amount_cents / 100).toFixed(2);
    
    return `
      Order Confirmed!
      
      Hi ${data.customer_name},
      
      Thank you for your order! We've received your payment and your order is being processed.
      
      Order Details:
      - Order ID: ${data.order_id}
      - Product: ${data.product_name}
      - Shop: ${data.shop_name}
      - Amount: $${amount} ${data.currency.toUpperCase()}
      
      You'll receive another email with tracking information once your order ships.
      
      ${data.receipt_url ? `View Receipt: ${data.receipt_url}` : ''}
      
      If you have any questions, please reply to this email.
      
      Best regards,
      The ${data.shop_name} Team
      
      ---
      This is a demo email from SingleShop - Portfolio Project
    `;
  }

  // Generate HTML template for seller notification
  private generateSellerNotificationHTML(data: SellerNotificationData): string {
    const amount = (data.amount_cents / 100).toFixed(2);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order! 💰</h1>
          </div>
          <div class="content">
            <p>Great news! You have a new order for your shop.</p>
            
            <div class="order-details">
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> ${data.order_id}</p>
              <p><strong>Product:</strong> ${data.product_name}</p>
              <p><strong>Amount:</strong> $${amount} ${data.currency.toUpperCase()}</p>
              <p><strong>Customer:</strong> ${data.customer_name}</p>
              <p><strong>Email:</strong> ${data.customer_email}</p>
            </div>
            
            <p>Please log in to your dashboard to view full order details and manage fulfillment.</p>
            
            <p><a href="https://singleshop.com/dashboard/orders" class="button">View Dashboard</a></p>
            
            <p>Keep up the great work!</p>
            
            <p>Best regards,<br>The SingleShop Team</p>
          </div>
          <div class="footer">
            <p>This is a demo email from SingleShop - Portfolio Project</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate text template for seller notification
  private generateSellerNotificationText(data: SellerNotificationData): string {
    const amount = (data.amount_cents / 100).toFixed(2);
    
    return `
      New Order!
      
      Great news! You have a new order for your shop.
      
      Order Information:
      - Order ID: ${data.order_id}
      - Product: ${data.product_name}
      - Amount: $${amount} ${data.currency.toUpperCase()}
      - Customer: ${data.customer_name}
      - Email: ${data.customer_email}
      
      Please log in to your dashboard to view full order details and manage fulfillment.
      
      Dashboard: https://singleshop.com/dashboard/orders
      
      Keep up the great work!
      
      Best regards,
      The SingleShop Team
      
      ---
      This is a demo email from SingleShop - Portfolio Project
    `;
  }

  // Get email log for demonstration
  getEmailLog(): Array<{ timestamp: Date; email: EmailTemplate }> {
    return this.emailLog;
  }

  // Clear email log
  clearEmailLog(): void {
    this.emailLog = [];
  }
}

// Export singleton instance
export const emailService = MockEmailService.getInstance();