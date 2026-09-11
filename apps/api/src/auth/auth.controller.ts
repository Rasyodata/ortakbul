import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { clientIp } from '../security/security.module';
import { AuthProvider } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto, VerifyDto } from './dto/verify.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto, { ip: clientIp(req), userAgent: req.headers?.['user-agent'] });
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  // Güvenli çıkış — verilen refresh token'ı (oturumu) iptal eder.
  @Public()
  @Post('logout')
  logout(@Body() dto: { refreshToken?: string; allDevices?: boolean }) {
    return this.auth.logout(dto?.refreshToken, dto?.allDevices);
  }

  @Public()
  @Get('social/:provider/url')
  socialUrl(@Param('provider') provider: AuthProvider) {
    return this.auth.socialAuthUrl(provider);
  }

  @Public()
  @Post('social')
  social(@Body() dto: SocialLoginDto) {
    return this.auth.socialLogin(dto);
  }

  @Post('verify')
  verify(@CurrentUser('id') userId: string, @Body() dto: VerifyDto) {
    return this.auth.verify(userId, dto.channel, dto.code);
  }

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.auth.me(userId);
  }
}
