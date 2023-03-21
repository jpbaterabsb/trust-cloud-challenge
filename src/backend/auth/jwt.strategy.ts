import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.SECRET,
    });
  }

  /**
   *  Get deserialized JWT data and it add data in req.user property.
   */
  async validate(payload: any) {
    if (payload.roles.includes('admin')) {
      return { roles: payload.roles };
    }

    const oem = await this.prismaService.oEM.findFirst({
      where: { id: payload.sub },
    });

    return { ...oem, roles: payload.roles };
  }
}
