export class RepositoryError extends Error {
  constructor(operation: string, detail: string) {
    super(`${operation} failed: ${detail}`);
    this.name = 'RepositoryError';
  }
}
