export enum StatusExecucaoEnum {
  Autorizada = 'Autorizada',
  Pendente = 'Pendente',
  Cancelada = 'Cancelada',
}

export type StatusExecucao = keyof typeof StatusExecucaoEnum;
