const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'charge.succeeded') {
    const email = stripeEvent.data.object.billing_details.email;
    const lineItems = stripeEvent.data.object.lines.data; // Get line items from the charge
    let productMessage = '';

    // Check each line item to determine the product
    for (const item of lineItems) {
      const productId = item.price.product; // This is the product ID
      switch (productId) {
        case 'prod_RtsvHFmxsZsBDn': // Replace with your Product ID for Flashcards Set 1
          productMessage = 'Thank you for purchasing vse potrebne k priprave! Download your flashcards here: https://drive.google.com/file/d/SET1_LINK';
          break;
        case 'prod_Ru9JqsSEfQs1Ym': // Replace with your Product ID for Flashcards Set 2
          productMessage = 'Thank you for purchasing Rapid! Download your flashcards here: https://drive.google.com/file/d/SET2_LINK';
          break;
        case 'prod_Ru9KzvfLOGtVOF': // Replace with your Product ID for Flashcards Set 3
          productMessage = 'Thank you for purchasing Srovnavaci! Download your flashcards here: https://drive.google.com/file/d/SET3_LINK';
          break;
        default:
          productMessage = 'Thank you for your purchase! Download link will be sent separately.';
      }
    }

    const msg = {
      to: email,
      from: 'info@dostansenaprava.cz', // Replace with your verified SendGrid email
      subject: 'Your Flashcards Purchase',
      text: productMessage,
    };

    console.log('Sending email to:', email, 'with message:', productMessage);
    try {
      await sgMail.send(msg);
      console.log('Email sent!');
      return { statusCode: 200, body: 'Email sent!' };
    } catch (error) {
      console.error('SendGrid Error:', error.message);
      return { statusCode: 500, body: `SendGrid Error: ${error.message}` };
    }
  }

  return { statusCode: 200, body: 'Event received but not processed' };
};