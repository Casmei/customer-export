import { Controller, Get, StreamableFile } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get('export')
  async exportAll() {
    const all = await this.customersService.findAll();
    const body = JSON.stringify(all, null, 2);
    const file = Buffer.from(body, 'utf-8');

    // nome opcional com data (ex.: customer-2025-08-24.json)
    const filename = `customer-${new Date().toISOString().slice(0, 10)}.json`;

    return new StreamableFile(file, {
      type: 'application/json; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
      length: file.length,
    });
  }
}
