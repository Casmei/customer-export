import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Vehicle } from './vehicles.entity';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  async onModuleInit() {
    await this.seedInitialVehicles(25);
  }

  private async seedInitialVehicles(minCount: number) {
    const current = await this.repo.count();
    const toCreate = Math.max(0, minCount - current);

    if (toCreate > 0) {
      this.logger.log(
        `Semear: criando ${toCreate} vehicle(s) para atingir ${minCount}.`,
      );
    }

    for (let i = 0; i < toCreate; i++) {
      await this.createUniqueRandomVehicle();
    }

    if (toCreate > 0) {
      const total = await this.repo.count();
      this.logger.log(`Seed concluído. Total no banco: ${total}.`);
    }
  }

  async createUniqueRandomVehicle(): Promise<Vehicle> {
    const vehicle = this.repo.create({
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      version: faker.vehicle.vin(),
      year: faker.number.int({ min: 2000, max: 2024 }),
      color: faker.vehicle.color(),
      fuel: faker.vehicle.fuel(),
      doors: faker.number.int({ min: 2, max: 5 }),
      km: faker.number.int({ min: 0, max: 200000 }),
      price: faker.finance.amount({
        min: 70000,
        max: 500000,
        dec: 2,
        symbol: 'R$',
        autoFormat: true,
      }),
      description: faker.lorem.paragraph(),
    });

    const saved = await this.repo.save(vehicle);

    this.logger.log(
      `Novo Vehicle criado via cron: ${saved.id} - ${saved.model} - ${saved.price}`,
    );

    return saved;
  }

  async findAll(): Promise<Vehicle[]> {
    return this.repo.find({ order: { created: 'ASC' } });
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron(): Promise<void> {
    await this.createUniqueRandomVehicle();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearDatabase(): Promise<void> {
    await this.repo.clear();
    this.logger.warn('🚨 Banco de dados limpo automaticamente');
  }
}
