const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios"); // To verify PayPal IPN data

admin.initializeApp();

// This is your PayPal IPN listener endpoint
exports.paypalIPNListener = functions.https.onRequest(async (req, res) => {
  const ipnData = req.body; // PayPal sends data in body

  // Verify the IPN data with PayPal
  const verifyUrl = "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"; // Sandbox URL, change to live for production
  const params = new URLSearchParams();
  params.append("cmd", "_notify-validate");
  Object.keys(ipnData).forEach((key) => {
    params.append(key, ipnData[key]);
  });

  try {
    // Send verification request to PayPal
    const response = await axios.post(verifyUrl, params);

    if (response.data === "VERIFIED") {
      // Check if payment was successful
      if (ipnData.payment_status === "Completed") {
        // Send email to user with materials
        const payerEmail = ipnData.payer_email;

        await sendEmail(payerEmail); // Send materials to user's email
        res.status(200).send("Payment verified and email sent");
      } else {
        res.status(400).send("Payment not completed");
      }
    } else {
      res.status(400).send("IPN verification failed");
    }
  } catch (error) {
    console.error("Error verifying PayPal IPN:", error);
    res.status(500).send("Server error");
  }
});

// Function to send email to the user (using an email service like SendGrid, Mailgun)
async function sendEmail(email) {
  // Configure the email service (e.g., SendGrid or Mailgun)
  // Example using SendGrid (you would need to set up your API key and send an email template)
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey("YOUR_SENDGRID_API_KEY");

  const msg = {
    to: email,
    from: "your-email@example.com",
    subject: "Your Digital Materials",
    text: "Thank you for your purchase! Please find your materials attached.",
    // Attachments or links to materials
    attachments: [
      {
        content: "Base64EncodedContentOfYourMaterial", // Attach file in base64 format or provide a link
        filename: "material.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
