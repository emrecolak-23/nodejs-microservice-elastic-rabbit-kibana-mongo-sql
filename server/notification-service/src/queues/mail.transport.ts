import { Logger } from 'winston';
import { IEmailLocals, winstonLogger } from '@emrecolak-23/jobber-share';
import { config } from '@notifications/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransports', 'debug');

export async function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> {
  try {
    // email templates
    log.info('Email sent successfully');
  } catch (error) {
    log.log('error', 'NotificationService MailTransport sendEmail() method error:', error);
  }
}
