import { CronJob } from 'cron';
import { logger } from '../utils';
import { SafeHaven } from '../services';
import { AppDataSource, SafeHavenService } from '../database';
import { Repository } from 'typeorm';

export class VasCronjob {
  private gateway: SafeHaven;
  private serviceRepo: Repository<SafeHavenService>;

  constructor() {
    this.gateway = new SafeHaven();
    this.serviceRepo = AppDataSource.getRepository(SafeHavenService);
  }

  syncServices = async () => {
    // runs every 12am
    const job = new CronJob('00 00 * * *', async () => {
      logger.warn(`Syncing VAS from Safehaven`);

      const result = await this.gateway.getAllVas();
      const gatewayServices = result.data;

      gatewayServices.map(async (item) => {
        const savedServices = await this.serviceRepo.findOne({
          where: { serviceId: item._id },
        });

        if (!savedServices) {
          await this.serviceRepo.save(
            new SafeHavenService({
              serviceId: item._id,
              identifier: item.identifier,
              name: item.name,
            }),
          );
        }
      });
    });

    try {
      job.start();
    } catch (error) {
      logger.warn(`CRON error (VAS): ${error}`);
    }
  };
}
