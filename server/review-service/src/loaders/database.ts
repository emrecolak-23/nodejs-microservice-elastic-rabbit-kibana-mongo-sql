import { injectable, singleton } from 'tsyringe';
import { EnvConfig } from '@review/config';
import { winstonLogger } from '@emrecolak-23/jobber-share';
import { Logger } from 'winston';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@singleton()
@injectable()
export class Database {
  private pool: Pool;
  private log: Logger = winstonLogger(`${this.config.ELASTIC_SEARCH_URL}`, 'reviewServiceDatabaseConnection', 'debug');

  constructor(private readonly config: EnvConfig) {
    this.pool = new Pool({
      host: this.config.DATABASE_HOST,
      user: this.config.DATABASE_USER,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      password: this.config.DATABASE_PASSWORD,
      database: this.config.DATABASE_NAME,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ...(this.config.NODE_ENV === 'production' &&
        this.config.CLUSTER_TYPE !== 'local' &&
        this.config.CLUSTER_TYPE !== 'minikube' && {
          ssl: { rejectUnauthorized: false }
        })
    });

    this.registerEventHandlers();
  }

  async createTableText(): Promise<string> {
    return `
    CREATE TABLE IF NOT EXISTS public.reviews (
      id SERIAL UNIQUE,
      gigId TEXT NOT NULL,
      reviewerId TEXT NOT NULL,
      orderId TEXT NOT NULL,
      sellerId TEXT NOT NULL,
      review TEXT NOT NULL,
      reviewerImage TEXT NOT NULL,
      reviewerUsername TEXT NOT NULL,
      country TEXT NOT NULL,
      reviewType TEXT NOT NULL,
      rating INTEGER DEFAULT 0 NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_DATE NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_DATE NOT NULL,
      PRIMARY KEY (id)
    );

    CREATE INDEX IF NOT EXISTS gigId_idx ON public.reviews (gigId);
    CREATE INDEX IF NOT EXISTS sellerId_idx ON public.reviews (sellerId);
    `;
  }

  async connect(retries = 3, delay = 3000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const client = await this.pool.connect();
        const createTableText = await this.createTableText();
        await this.pool.query(createTableText);
        client.release();
        this.log.info('ReviewService connected to database successfully');
        return;
      } catch (error) {
        this.log.log('error', `ReviewService databaseConnection() attempt ${attempt}/${retries} failed:`, error);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    this.log.log('error', 'ReviewService databaseConnection() all retry attempts exhausted');
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.log.info('ReviewService disconnected from database successfully');
    } catch (error) {
      this.log.log('error', 'ReviewService databaseDisconnect() method error:', error);
    }
  }

  private registerEventHandlers(): void {
    this.pool.on('error', (error) => {
      this.log.log('error', 'ReviewService unexpected database error:', error);
    });
    this.pool.on('connect', () => this.log.info('ReviewService Database connected'));
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }
}
