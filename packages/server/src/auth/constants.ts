import { SetMetadata } from '@nestjs/common';

export const jwtConstants = {
  secret: 'anquandeyipi',
};

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
