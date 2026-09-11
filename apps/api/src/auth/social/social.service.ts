import { Injectable } from '@nestjs/common';
import { AuthProvider } from '@prisma/client';

export interface SocialProfile {
  providerId: string;
  email: string;
  fullName?: string;
}

// OAuth soyutlaması. Production'da her provider'ın token'ı kendi API'siyle doğrulanır:
// GOOGLE: google-auth-library verifyIdToken, APPLE: apple-signin, FACEBOOK/INSTAGRAM: Graph API, TIKTOK: TikTok Login Kit.
@Injectable()
export class SocialService {
  authorizeUrl(provider: AuthProvider): string {
    const map: Partial<Record<AuthProvider, string>> = {
      GOOGLE: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID || ''}&response_type=code&scope=openid%20email%20profile`,
      FACEBOOK: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID || ''}&scope=email`,
      INSTAGRAM: `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID || ''}&scope=user_profile&response_type=code`,
      TIKTOK: `https://www.tiktok.com/v2/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY || ''}&scope=user.info.basic&response_type=code`,
      APPLE: `https://appleid.apple.com/auth/authorize?client_id=${process.env.APPLE_CLIENT_ID || ''}&response_type=code&scope=email%20name`,
    };
    return map[provider] || '';
  }

  // Scaffold: token'ı doğrular ve profil döndürür.
  // Şimdilik istemciden gelen email/fullName kullanılır; token opak kabul edilir.
  async verify(
    provider: AuthProvider,
    token: string,
    fallback: { email: string; fullName?: string },
  ): Promise<SocialProfile> {
    // TODO(production): provider'a göre gerçek token doğrulaması
    return {
      providerId: `${provider.toLowerCase()}_${token.slice(0, 24)}`,
      email: fallback.email,
      fullName: fallback.fullName,
    };
  }
}
