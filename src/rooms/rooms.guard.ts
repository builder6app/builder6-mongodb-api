import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoomsGuard implements CanActivate {
  constructor(
    private roomsService: RoomsService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, bearerToken] = request.headers.authorization?.split(' ') ?? [];
    const token = type === 'Bearer' ? bearerToken : undefined;
    if (!token) {
      console.error('Token not found', token);
      throw new UnauthorizedException();
    }
    if (this.jwtService.verify(token) === false) {
      throw new UnauthorizedException();
    }
    try {
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      const jwt = await this.jwtService.decode(token);
      request['jwt'] = jwt;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
