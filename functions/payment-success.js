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

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const email = session.customer_email || session.customer_details.email;

    // Fetch line items from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    let productMessage = 'Thank you for your purchase! Download link will be sent separately.';

    // Check each line item to determine the product
    for (const item of lineItems.data) {
      const productId = item.price.product;
      console.log('Product ID:', productId); // Log the product ID for debugging
      switch (productId) {
        case 'prod_RvQCWmZJqAU0nC':
          productMessage = 'Thank you for purchasing vse potrebne k priprave! Download your flashcards here: https://drive.google.com/file/d/SET1_LINK';
          break;
        case 'prod_RtpU6xXuz6TPFe':
          productMessage = 'Thank you for purchasing Rapid! Download your flashcards here: https://drive.google.com/file/d/SET2_LINK';
          break;
        case 'prod_RvQF0wfixePqxP':
          productMessage = 'Thank you for purchasing Srovnavaci! Download your flashcards here: https://drive.google.com/file/d/SET3_LINK';
          break;
        default:
          productMessage = 'Thank you for your purchase! Download link will be sent separately.';
      }
    }

    const msg = {
      to: email,
      from: 'info@dostansenaprava.cz',
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