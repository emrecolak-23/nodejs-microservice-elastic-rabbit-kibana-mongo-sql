import Stripe from 'stripe';
import { EnvConfig } from '@order/config';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { randomUUID } from 'crypto';
import { injectable, singleton } from 'tsyringe';
import { IdempotencyService } from './idempotency.service';

@injectable()
@singleton()
export class StripeService {
  private readonly PAYMENT_INTENT_IDEMPOTENCY_TTL = 30;
  private log: Logger = winstonLogger(this.config.ELASTIC_SEARCH_URL, 'StripeService', 'debug');
  private stripe: Stripe;
  constructor(
    private readonly config: EnvConfig,
    private readonly idempotencyService: IdempotencyService
  ) {
    this.stripe = new Stripe(this.config.STRIPE_API_KEY, {
      typescript: true
    });
  }

  private sanitizeEmail(email: string): string {
    return email.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  calculateAmountInCents(price: number): number {
    const priceInCents = Math.round(price * 100);
    const serviceFeeInCents = price < 50 ? Math.round(price * 5.5) + 200 : Math.round(price * 5.5);
    return priceInCents + serviceFeeInCents;
  }

  async getExistingCustomer(email: string): Promise<Stripe.Customer | null> {
    const sanitizedEmail = this.sanitizeEmail(email);
    const customer: Stripe.Response<Stripe.ApiSearchResult<Stripe.Customer>> = await this.stripe.customers.search({
      query: `email:'${sanitizedEmail}'`
    });

    if (!customer.data.length) {
      return null;
    }

    return customer.data[0];
  }

  async checkIfCustomerExists(email: string): Promise<boolean> {
    const customer: Stripe.Customer | null = await this.getExistingCustomer(email);
    return !!customer;
  }

  async createCustomer(email: string, buyerId: string): Promise<Stripe.Customer> {
    const customer: Stripe.Response<Stripe.Customer> = await this.stripe.customers.create(
      {
        email,
        metadata: {
          buyerId
        }
      },
      {
        idempotencyKey: `create-customer-${buyerId}`
      }
    );

    this.log.info(`Customer created: id=${customer.id}, buyerId=${buyerId}`);
    return customer;
  }

  private async getOrCreateCustomer(email: string, buyerId: string): Promise<Stripe.Customer> {
    const existing = await this.getExistingCustomer(email);
    if (existing) {
      return existing;
    }
    return this.createCustomer(email, buyerId);
  }

  async createPaymentIntent(email: string, buyerId: string, price: number): Promise<Stripe.PaymentIntent> {
    const customer: Stripe.Customer = await this.getOrCreateCustomer(email, buyerId);
    const amount: number = this.calculateAmountInCents(price);

    const idempotencyKey: string = await this.idempotencyService.getOrCreate(
      `stripe:intent:${buyerId}:${amount}`,
      randomUUID(),
      this.PAYMENT_INTENT_IDEMPOTENCY_TTL
    );

    const paymentIntent: Stripe.Response<Stripe.PaymentIntent> = await this.stripe.paymentIntents.create(
      {
        amount,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true
        },
        customer: customer.id
      },
      {
        idempotencyKey
      }
    );

    return paymentIntent;
  }

  async refundPaymentIntent(paymentIntentId: string): Promise<Stripe.Refund> {
    const refund: Stripe.Response<Stripe.Refund> = await this.stripe.refunds.create({
      payment_intent: paymentIntentId
    });
    return refund;
  }
}
