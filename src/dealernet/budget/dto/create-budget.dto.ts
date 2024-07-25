import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

class ProdutoCreateDTO {
  @ApiProperty()
  tipo_os_sigla: string;

  @ApiProperty()
  produto?: string;

  @ApiProperty()
  produto_referencia?: string;

  @ApiProperty()
  valor_unitario: number;

  @ApiProperty()
  quantidade: number;

  @ApiProperty()
  desconto?: number;

  @ApiProperty()
  desconto_percentual?: number;

  @ApiProperty()
  kit_codigo?: number;

  @ApiProperty()
  campanha_codigo?: number;

  @ApiProperty()
  selecionado?: boolean;
}

class ServicoCreateDTO {
  @ApiProperty()
  tipo_os_sigla: string;

  @ApiProperty()
  tmo_referencia: string;

  @ApiProperty()
  tempo: number;

  @ApiProperty()
  valor_unitario: number;

  @ApiProperty()
  quantidade: number;

  @ApiProperty()
  cobra: boolean;

  @ApiProperty({ type: ProdutoCreateDTO })
  produtos: ProdutoCreateDTO[];
}

export class CreateDealernetBudgetDTO {
  @ApiProperty()
  veiculo_placa_chassi: string;

  @ApiProperty()
  veiculo_Km: number;

  @ApiProperty()
  cliente_documento: string;

  @ApiProperty()
  consultor_documento: string;

  @ApiProperty()
  @IsOptional()
  data?: string;

  @ApiProperty()
  observacao: string;

  @ApiProperty()
  dias_prazo_entrega: string;

  @ApiProperty()
  @IsOptional()
  data_validade?: string;

  @ApiProperty()
  @IsOptional()
  data_proximo_contato?: string;

  @ApiProperty()
  @IsOptional()
  data_prometida?: string;

  @ApiProperty({ type: ServicoCreateDTO })
  servicos: ServicoCreateDTO[];
}
