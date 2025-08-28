const getVerificationEmailHTML = (user, verificationUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Welcome to ResellBay, ${user.name}!</h2>
        <p style="color: #555; font-size: 16px;">
          We're excited to have you on board. Please click the button below to verify your email address and activate your account.
        </p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 25px 0; font-size: 16px; font-weight: bold;">
          Verify My Email
        </a>
        <p style="color: #888; font-size: 12px;">
          This link will expire in 24 hours. If you did not sign up for an account, please disregard this email.
        </p>
      </div>
    </div>
  `;
};

const getOrderConfirmationHTML = (user, order) => {
  const itemsList = order.items
    .map(
      (item) =>
        `<li>${item.title} (x${item.quantity}) - <strong>$${(item.price * item.quantity).toFixed(2)}</strong></li>`
    )
    .join('');

  const shippingAddr = order.shippingAddress;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="text-align: center; color: #007bff;">Thank You For Your Order!</h2>
      <p>Hi ${user.name},</p>
      <p>Your order #${order._id} has been confirmed and is now being processed. Here are the details:</p>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0;">Order Summary</h3>
        <ul>${itemsList}</ul>
        <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
        <p>Platform Fee: $${order.platformFee.toFixed(2)}</p>
        <p style="font-size: 1.2em; font-weight: bold;">Total: $${order.total.toFixed(2)}</p>
      </div>

      <div>
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Shipping To</h3>
        <p>
          ${shippingAddr.street}<br>
          ${shippingAddr.city}, ${shippingAddr.state} ${shippingAddr.zipCode}<br>
          ${shippingAddr.country}
        </p>
      </div>

      <p style="text-align: center; margin-top: 30px;">Thanks for shopping with ResellBay!</p>
    </div>
  `;
};

module.exports = {
  getVerificationEmailHTML,
  getOrderConfirmationHTML,
};
