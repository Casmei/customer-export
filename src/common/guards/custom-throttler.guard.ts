import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Limite atingido: tente novamente em até 30 minutos.',
    );
  }
}
