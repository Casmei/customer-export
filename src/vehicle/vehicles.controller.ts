import { Controller, Get, StreamableFile } from '@nestjs/common';
import { minutes, Throttle } from '@nestjs/throttler';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Throttle({ default: { limit: 2, ttl: minutes(30) } })
  @Get('export')
  async exportAll() {
    const all = await this.vehiclesService.findAll();
    const body = JSON.stringify(all, null, 2);
    const file = Buffer.from(body, 'utf-8');

    const filename = `vehicle-${new Date().toISOString().slice(0, 10)}.json`;

    return new StreamableFile(file, {
      type: 'application/json; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
      length: file.length,
    });
  }
}
