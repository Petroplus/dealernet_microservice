export enum OrderBudgetServiceEnum {
  labor = 'labor',
  task = 'task',
}

export type OrderBudgetServiceType = keyof typeof OrderBudgetServiceEnum;
