import inquirer from 'inquirer';
import fetch from 'node-fetch';
import Stripe from 'stripe';

async function runCLI(): Promise<void> {
  
  const stripe = new Stripe("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");
  try {
   const configuration = await stripe.billingPortal.configurations.create({
      features: {
        customer_update: {
          allowed_updates: ['name', 'email','phone','address'],
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true
        },
        subscription_cancel: {
          enabled: true,
          mode: 'immediately',
          proration_behavior: 'create_prorations'
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price','promotion_code'],
          products: [
            {
              prices: ["price_1QwhZfIiL0oeTlYviLI2B30F","price_1QwhZfIiL0oeTlYvbBAOE5ov"],
              product: "prod_RqOMCCt5x5N1Or"
            },
            {
              prices: ["price_1QwhZWIiL0oeTlYvEHFfSQtj","price_1QwhZWIiL0oeTlYvwAIDTJYa"],
              product: "prod_RqOMU1IgVElV1N"
            },
            {
              prices: ["price_1QwhQXIiL0oeTlYvXrlc6375","price_1QwhQWIiL0oeTlYvoMopgMh6"],
              product: "prod_RqOCXlSqUEk0Wz"
            },
            {
              prices: ["price_1Qwip8IiL0oeTlYv0X6OBIkv","price_1QwhPhIiL0oeTlYvP4FpYOq9"],
              product: "prod_RqOC259ZFWJDwe"
            }
          ],
          proration_behavior: 'always_invoice'
        }
      },
      business_profile: {
        headline: 'HLTHI Billing Portal'

      }
    });

    console.log(configuration.id);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

runCLI().catch(() => process.exit(1));
