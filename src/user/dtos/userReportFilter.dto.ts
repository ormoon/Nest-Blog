import { IsBoolean, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ReportFilter } from '../../common/dtos/reportFilter.dto';
import { UserRole } from '../user.entity';

export class UserReportFilterDto extends ReportFilter {
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsDateString()
  createdAt: Date;
}
