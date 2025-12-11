import { SetMetadata } from '@nestjs/common';

export const RESPONSE_KEY = 'skipResponseFormat';

export const SkipResponseFormat = () => SetMetadata(RESPONSE_KEY, true);
