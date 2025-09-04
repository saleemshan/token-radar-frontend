interface ErrorResponse {
  code: number;
  message: string;
}

type AlphaFeedErrorType = 'list' | 'user';

interface AlphaFeedError extends ErrorResponse {
  type: AlphaFeedErrorType;
}
