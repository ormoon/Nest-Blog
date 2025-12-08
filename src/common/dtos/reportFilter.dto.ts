import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';

export class ReportFilter {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'order must be ASC, DESC, asc or desc' })
  order?: SortOrder;
}
