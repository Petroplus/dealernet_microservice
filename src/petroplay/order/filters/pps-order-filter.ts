import { OrderStatus } from '../enum/order-status.enum';

import { OrderRelations } from './expand-orders';

export class PpsOrderFilter {
  inspection_initial_date?: Date;
  inspection_final_date?: Date;
  app_date_initial_date?: Date;
  app_date_final_date?: Date;
  scheduled_date_initial_date?: Date;
  scheduled_date_final_date?: Date;
  client_ids?: string[];
  ids?: string[];
  internal_ids?: number[];
  integration_ids?: string[];
  license_plate?: string;
  status?: OrderStatus[];
  status_ignore?: OrderStatus[];
  survey_answered?: boolean;
  budget_ids?: string[];
  is_approved?: boolean;
  expand?: OrderRelations[];
  cache?: boolean;
  restrict_return?: string[];
}
