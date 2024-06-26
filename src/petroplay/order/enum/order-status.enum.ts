export enum OrderStatusEnum {
  AWAT = 'AWAT',
  INSP = 'INSP',
  ADD = 'ADD',
  TECR = 'TECR',
  QUTD = 'QUTD',
  AAPR = 'AAPR',
  AWAITING_SIGNATURE_CUSTOMER = 'AWAITING_SIGNATURE_CUSTOMER',
  SIGNED_OS = 'SIGNED_OS',
  AWAIT_SEND_OS = 'AWAIT_SEND_OS',
  FAILED_SEND_OS = 'FAILED_SEND_OS',
  APPR = 'APPR',
  IPGR = 'IPGR',
  RFCO = 'RFCO',
  DINP = 'DINP',
  PAID = 'PAID',
  DLVD = 'DLVD',
  NPS = 'NPS',
  PRNT = 'PRNT',
  ASGD = 'ASGD',
  PAPR = 'PAPR',
  NAPR = 'NAPR',
  AWAIT_SEND_BUDGET = 'AWAIT_SEND_BUDGET',
  BDGT = 'BDGT',
  FAILED_SEND_BUDGET = 'FAILED_SEND_BUDGET',
  DONE = 'DONE',
  CAND = 'CAND',
}

export type OrderStatus = keyof typeof OrderStatusEnum;
