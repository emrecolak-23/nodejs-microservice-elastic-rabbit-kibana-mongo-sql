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
      ...(this.config.NODE_ENV === 'production' && {
        ssl: { rejectUnauthorized: false }
      })
    });

    this.registerEventHandlers();
  }

  async connect(retries = 3, delay = 3000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const client = await this.pool.connect();
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

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }
}
