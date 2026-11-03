import { SetMetadata } from '@nestjs/common';

export const ACCESS = 'route-access';
export const Public = () => SetMetadata(ACCESS, 'public');
export const Authenticated = () => SetMetadata(ACCESS, 'authenticated');
