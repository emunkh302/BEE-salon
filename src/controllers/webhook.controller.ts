import { Request, Response } from 'express';
import Stripe from 'stripe';
import Booking, { DepositStatus } from '../models/Booking.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// This is the secret for verifying webhook signatures
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const stripeWebhookHandler = async (req: Request, res: Response) => {
    // Get the signature from the headers
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
        // Use the raw request body for verification
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`✅ PaymentIntent was successful for: ${paymentIntent.id}`);
            
            // Find the booking associated with this payment intent
            const booking = await Booking.findOne({ stripePaymentIntentId: paymentIntent.id });

            if (booking) {
                // Update the booking's deposit status to 'Paid'
                booking.depositStatus = DepositStatus.PAID;
                await booking.save();
                
                // You can also emit a real-time event to the artist here if needed
                if (req.io) {
                    req.io.to(booking.artist.toString()).emit('deposit_paid', {
                        message: `The deposit for booking #${booking._id} has been paid.`
                    });
                }
            } else {
                console.warn(`Webhook received for unknown paymentIntent: ${paymentIntent.id}`);
            }
            break;
            
        // You can handle other event types here if needed
        // case 'payment_intent.payment_failed':
        //    ...
        //    break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
};
