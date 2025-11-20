export interface Pagination {
  totalData: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface ControllerResponse {
  message: string;
  data: unknown;
  meta?: Pagination;
}

export interface CustomResponse extends ControllerResponse {
  statusCode: number;
}
