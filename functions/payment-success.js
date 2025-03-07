const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  // Verify the Stripe webhook signature
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Handle successful payment
  if (stripeEvent.type === 'charge.succeeded') {
    const email = stripeEvent.data.object.billing_details.email;
    const downloadLink = 'https://drive.google.com/drive/folders/1sXsoWPyyGndm1OUA4XlhFQOoXwbGxv1K?usp=drive_link'; // Replace with your link (e.g., Google Drive)

    const msg = {
      to: email,
      from: 'info@dostansenaprava.cz', // Replace with your verified SendGrid email
      subject: 'Your Study Flashcards',
      text: `Thanks for your purchase! Download your flashcards here: ${downloadLink}`,
    };

    await sgMail.send(msg);
    return { statusCode: 200, body: 'Email sent!' };
  }

  return { statusCode: 200, body: 'Event received but not processed' };
};