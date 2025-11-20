import { LIMIT, PAGE } from '../../config/default-value.config';
import { SortOrder } from '../enums/sort-order.enum';

type QueryOptions = {
  page?: any;
  limit?: any;
  orderBy?: string;
  order?: SortOrder;
};

export function parseNumber(
  value: any,
  defaultValue: number,
  min?: number,
): number {
  const num = Number(value);
  if (Number.isNaN(num) || (min !== undefined && num < min)) {
    return defaultValue;
  }
  return num;
}

export function getPagination(query: QueryOptions) {
  const page = parseNumber(query.page, PAGE, 1);
  const perPage = parseNumber(query.limit, LIMIT, 1);
  const skip = (page - 1) * perPage;

  return { perPage, skip };
}

export function getSort(query: QueryOptions) {
  const orderBy = query.orderBy ?? 'createdAt';
  const order = query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  return { orderBy, order };
}

export function buildQueryOptions(query: QueryOptions) {
  const { perPage, skip } = getPagination(query);
  const { orderBy, order } = getSort(query);

  return {
    perPage,
    skip,
    orderBy,
    order,
  };
}
