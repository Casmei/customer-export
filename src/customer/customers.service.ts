import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { faker } from '@faker-js/faker';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async onModuleInit() {
    await this.seedInitialCustomers(5);
  }

  private async seedInitialCustomers(minCount: number) {
    const current = await this.repo.count();
    const toCreate = Math.max(0, minCount - current);

    if (toCreate > 0) {
      this.logger.log(
        `Semear: criando ${toCreate} customer(s) para atingir ${minCount}.`,
      );
    }

    for (let i = 0; i < toCreate; i++) {
      await this.createUniqueRandomCustomer();
    }

    if (toCreate > 0) {
      const total = await this.repo.count();
      this.logger.log(`Seed concluído. Total no banco: ${total}.`);
    }
  }

  async createUniqueRandomCustomer(): Promise<Customer> {
    let saved: Customer | null = null;

    while (!saved) {
      const name = faker.person.fullName();
      const email = faker.internet
        .email({
          firstName: name.split(' ')[0] ?? '',
          lastName: name.split(' ').slice(1).join(' '),
        })
        .toLowerCase();

      const exists = await this.repo.findOne({ where: { email } });

      if (exists) {
        this.logger.warn(`Email ${email} já existe, gerando outro...`);
        continue;
      }

      const customer = this.repo.create({
        name,
        email,
        phone: faker.phone.number(),
      });

      saved = await this.repo.save(customer);

      this.logger.log(
        `Novo customer criado via cron: ${saved.id} - ${saved.email}`,
      );
    }

    return saved;
  }

  async findAll(): Promise<Customer[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron(): Promise<void> {
    await this.createUniqueRandomCustomer();
  }

  @Cron('0 0 */7 * *')
  async clearDatabase(): Promise<void> {
    await this.repo.clear();
    this.logger.warn('🚨 Banco de dados limpo automaticamente');
  }
}
