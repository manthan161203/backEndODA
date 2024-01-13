const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const processStripePayment = async (email, feeAmount) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: feeAmount * 100, // Convert to cents
            currency: 'usd',
            payment_method: 'visa', // Use an actual payment method ID from Stripe
            confirm: true,
            description: 'Appointment Fee',
            receipt_email: email,
        });

        if (paymentIntent.status === 'succeeded') {
            console.log(`Payment successful: ${paymentIntent.id}`);
            return true;
        } else {
            console.log(`Payment failed: ${paymentIntent.failure_message}`);
            return false;
        }
    } catch (error) {
        console.error('Error processing payment: ', error);
        return false;
    }
};

module.exports = { processStripePayment };
