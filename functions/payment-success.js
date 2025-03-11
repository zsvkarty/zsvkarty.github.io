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
          productMessage = 'Děkujeme za váš nákup! Vše potřebné k přípravě najdete zde: https://drive.google.com/drive/folders/1YKCXSK5nkhm4wnDRIR-L8RyYjPZuW2b6?usp=sharing';
          break;
        case 'prod_RtpU6xXuz6TPFe':
          productMessage = 'Děkujeme za váš nákup Rapidní přípravy! Stáhněte si své kartičky zde: https://drive.google.com/drive/folders/1sXsoWPyyGndm1OUA4XlhFQOoXwbGxv1K?usp=sharing';
          break;
        case 'prod_RvQF0wfixePqxP':
          productMessage = 'Děkujeme za váš nákup Srovnávací přípravy! Stáhněte si své materiály zde: https://drive.google.com/drive/folders/1sXsoWPyyGndm1OUA4XlhFQOoXwbGxv1K?usp=sharing';
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