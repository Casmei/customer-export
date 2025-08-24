import { Controller, Get, StreamableFile } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { minutes, Throttle } from '@nestjs/throttler';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Throttle({ default: { limit: 2, ttl: minutes(30) } })
  @Get('export')
  async exportAll() {
    const all = await this.customersService.findAll();
    const body = JSON.stringify(all, null, 2);
    const file = Buffer.from(body, 'utf-8');

    const filename = `customer-${new Date().toISOString().slice(0, 10)}.json`;

    return new StreamableFile(file, {
      type: 'application/json; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
      length: file.length,
    });
  }
}
