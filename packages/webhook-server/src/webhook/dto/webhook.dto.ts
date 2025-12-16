// src/webhook/dto/webhook.dto.ts
export class WebhookDto {
  ref?: string;
  before?: string;
  after?: string;
  commits?: Array<{
    id?: string;
    message?: string;
    added?: string[];
    modified?: string[];
    removed?: string[];
    author?: {
      name?: string;
      email?: string;
    };
    timestamp?: string;
  }>;
  repository?: {
    name?: string;
    url?: string;
    homepage?: string;
  };
  sender?: {
    login?: string;
    id?: number;
    avatar_url?: string;
    url?: string;
  };
}