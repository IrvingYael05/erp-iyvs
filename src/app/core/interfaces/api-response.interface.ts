export interface ApiResponse<T> {
  statusCode: number;
  intOpCode: number;
  data: T;
}
