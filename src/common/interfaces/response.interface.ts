export interface IResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}