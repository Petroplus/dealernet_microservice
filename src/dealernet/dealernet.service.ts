/* eslint-disable prettier/prettier */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { isArray } from 'class-validator';
import { XMLParser } from 'fast-xml-parser';

import { webClient } from 'src/commons/web-client';

import { DealernetCustomerService } from './customer/customer.service';
import { CreateOsDTO } from './dto/create-os.dto';
import { CreateVehicleDTO } from './dto/create-vehicle.dto';
import { DealernetBudgetResponse } from './response/budget-response';
import { KitResponse } from './response/kit-response';
import { NotaFiscalResponse } from './response/nota-fiscal-resposne';
import { DealernetOrder } from './response/os-response';
import { CreatePessoaDealerNetDTO, PessoaInfo } from './response/pessoa-response';
import { ProdutoDealernetResponse } from './response/produto-response';
import { TMO } from './response/tmo-response';
import { VeiculoInfo } from './response/veiculo-response';
import { DealernetScheduleService } from './schedule/schedule.service';
import { DealernetVehicleModelService } from './vehicle-model/vehicle-model.service';
import { DealernetVehicleService } from './vehicle/vehicle.service';

@Injectable()
export class DealernetService {
  constructor(
    public readonly schedule: DealernetScheduleService,
    public readonly customer: DealernetCustomerService,
    public readonly vehicle: DealernetVehicleService,
    public readonly vehicleModel: DealernetVehicleModelService,
  ) {}

  async findCustomerByDocument(api: string, user: string, key: string, document: string): Promise<PessoaInfo> {
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Nome>?</deal:Pessoa_Nome>
                        <deal:Pessoa_DocIdentificador>${document}</deal:Pessoa_DocIdentificador>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    const url = `${api}/aws_fastserviceapi.aspx`;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const pessoa =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PESSOAResponse']['Sdt_fspessoaout']['SDT_FSPessoaOut'];

      if (!isArray(pessoa)) {
        return pessoa
      } else {
        const filteredClient = pessoa?.find((cliente) => {
          const docIdentificador = document
          const paddedDocIdentificador = String(cliente?.Pessoa_DocIdentificador).padStart(docIdentificador.length, '0');
          return docIdentificador === paddedDocIdentificador;
        });
        return filteredClient
      }
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async createCustomer(api: string, user: string, key: string, dto: CreatePessoaDealerNetDTO) {
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const url = `${api}/aws_fastserviceapi.aspx`;
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PESSOA>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fspessoain>
                        <deal:Pessoa_Nome>${dto.Pessoa_Nome ?? '?'}</deal:Pessoa_Nome>
                        <deal:Pessoa_TipoPessoa>${dto.Pessoa_TipoPessoa ?? '?'}</deal:Pessoa_TipoPessoa>
                        <deal:Pessoa_DocIdentificador>${dto.Pessoa_DocIdentificador ?? '?'}</deal:Pessoa_DocIdentificador>
                        <deal:Pessoa_RG>${dto.Pessoa_RG_InscricaoEstadual ?? '?'}</deal:Pessoa_RG>
                        <deal:Pessoa_OrgaoEmissor>${dto.Pessoa_OrgaoEmissor ?? '?'}</deal:Pessoa_OrgaoEmissor>
                        <deal:Pessoa_InscricaoSuframa>?</deal:Pessoa_InscricaoSuframa>
                        <deal:Pessoa_Sexo>${dto.Pessoa_Sexo ?? '?'}</deal:Pessoa_Sexo>
                        <deal:Pessoa_Email>${dto.Pessoa_Email ?? '?'}</deal:Pessoa_Email>
                        <deal:Pessoa_Nacionalidade>?</deal:Pessoa_Nacionalidade>
                        <deal:Pessoa_EstadoCivil>?</deal:Pessoa_EstadoCivil>
                        <deal:Pessoa_Nascimento>${dto.Pessoa_Nascimento ?? '?'}</deal:Pessoa_Nascimento>
                        <deal:Acao>INC</deal:Acao>
                        <deal:Endereco>
                            <deal:EnderecoItem>
                                <deal:PessoaEndereco_TipoEndereco>${dto.Endereco?.EnderecoItem?.PessoaEndereco_TipoEndereco ?? '?'
      }</deal:PessoaEndereco_TipoEndereco>
                                <deal:PessoaEndereco_Logradouro>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Logradouro ?? '?'
      }</deal:PessoaEndereco_Logradouro>
                                <deal:PessoaEndereco_TipoLogradouro_Descricao>${dto.Endereco?.EnderecoItem?.PessoaEndereco_TipoLogradouro_Descricao ?? '?'
      }</deal:PessoaEndereco_TipoLogradouro_Descricao>
                                <deal:PessoaEndereco_Numero>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Numero ?? '?'
      }</deal:PessoaEndereco_Numero>
                                <deal:PessoaEndereco_Complemento>?
      }</deal:PessoaEndereco_Complemento>
                                <deal:PessoaEndereco_CEP>${dto.Endereco?.EnderecoItem?.PessoaEndereco_CEP ?? '?'}</deal:PessoaEndereco_CEP>
                                <deal:PessoaEndereco_Bairro>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Bairro ?? '?'
      }</deal:PessoaEndereco_Bairro>
                                <deal:PessoaEndereco_Cidade>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Cidade ?? '?'
      }</deal:PessoaEndereco_Cidade>
                                <deal:PessoaEndereco_Estado>${dto.Endereco?.EnderecoItem?.PessoaEndereco_Estado ?? '?'
      }</deal:PessoaEndereco_Estado>
                            </deal:EnderecoItem>
                        </deal:Endereco>
                        <deal:Telefone>
                            <deal:TelefoneItem>
                                <deal:PessoaTelefone_TipoTelefone>${dto.Telefone?.TelefoneItem?.PessoaTelefone_TipoTelefone ?? '?'
      }</deal:PessoaTelefone_TipoTelefone>
                                <deal:PessoaTeleFone_DDD>${dto.Telefone?.TelefoneItem?.PessoaTeleFone_DDD ?? '?'}</deal:PessoaTeleFone_DDD>
                                <deal:PessoaTelefone_Fone>${dto.Telefone?.TelefoneItem?.PessoaTelefone_Fone ?? '?'
      }</deal:PessoaTelefone_Fone>
                            </deal:TelefoneItem>
                        </deal:Telefone>
                        <deal:MeioContato>
                            <deal:MeioContatoItem>
                                <deal:PessoaMeioContato_Tipo>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Ativo ?? '?'
      }</deal:PessoaMeioContato_Tipo>
                                <deal:PessoaMeioContato_Ativo>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Ativo ?? '?'
      }</deal:PessoaMeioContato_Ativo>
                                <deal:PessoaMeioContato_Principal>${dto.MeioContato?.MeioContatoItem?.PessoaMeioContato_Principal ?? '?'
      }</deal:PessoaMeioContato_Principal>
                            </deal:MeioContatoItem>
                        </deal:MeioContato>
                    </deal:Sdt_fspessoain>
                </deal:WS_FastServiceApi.PESSOA>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      console.log(xmlData);
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findVehicleByPlate(api: string, user: string, key: string, placa: string): Promise<VeiculoInfo> {
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.VEICULO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fsveiculoin>
                        <deal:Veiculo_Placa>${placa}</deal:Veiculo_Placa>
                        <deal:Veiculo_Chassi>?</deal:Veiculo_Chassi>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fsveiculoin>
                </deal:WS_FastServiceApi.VEICULO>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const veiculo: VeiculoInfo =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.VEICULOResponse']['Sdt_fsveiculoout']['SDT_FSVeiculoOut'];

      if (veiculo.Mensagem) {
        throw new BadRequestException(veiculo.Mensagem);
      }

      return veiculo;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async auxFindVehicle(api: string, user: string, key: string, placa: string): Promise<VeiculoInfo> {
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.VEICULO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fsveiculoin>
                        <deal:Veiculo_Placa>${placa}</deal:Veiculo_Placa>
                        <deal:Veiculo_Chassi>?</deal:Veiculo_Chassi>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fsveiculoin>
                </deal:WS_FastServiceApi.VEICULO>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const veiculo: VeiculoInfo =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.VEICULOResponse']['Sdt_fsveiculoout']['SDT_FSVeiculoOut'];

      return veiculo;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findProduct(
    api: string,
    user: string,
    key: string,
    doc: string,
    descricao: string,
  ): Promise<ProdutoDealernetResponse[] | ProdutoDealernetResponse> {
    Logger.log(`Buscando produto pela descrição: ${descricao}, api:${api}`, 'Produtos');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PRODUTO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fsprodutoin>
                        <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento >
                        <deal:ProdutoCodigo></deal:ProdutoCodigo >
                        <deal:ProdutoDescricao>${descricao}</deal:ProdutoDescricao>
                        <deal:VeiculoPlacaChassi>?</deal:VeiculoPlacaChassi>
                    </deal:Sdt_fsprodutoin>
                </deal:WS_FastServiceApi.PRODUTO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const products =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PRODUTOResponse']['Sdt_fsprodutooutlista']['SDT_FSProdutoOut'];

      return products;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findProductByCodigo(
    api: string,
    user: string,
    key: string,
    doc: string,
    cod: string,
  ): Promise<ProdutoDealernetResponse[] | ProdutoDealernetResponse> {
    Logger.log(`Buscando produto pelo codigo: ${cod}, api:${api}`, 'Produtos');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PRODUTO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fsprodutoin>
                        <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento >
                        <deal:ProdutoCodigo>${cod}</deal:ProdutoCodigo >
                        <deal:ProdutoDescricao>?</deal:ProdutoDescricao>
                        <deal:VeiculoPlacaChassi>?</deal:VeiculoPlacaChassi>
                    </deal:Sdt_fsprodutoin>
                </deal:WS_FastServiceApi.PRODUTO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const products =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PRODUTOResponse']['Sdt_fsprodutooutlista']['SDT_FSProdutoOut'];
      return products;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findKit(api: string, user: string, key: string, doc: string, cod?: string, descricao?: string): Promise<KitResponse[]> {
    Logger.log(`Buscando kit pelo codigo: ${cod} e descrição: ${descricao}, api:${api}`, 'Produtos');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.KIT>
                <deal:Usuario>${user}</deal:Usuario>
                <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fskitin>
                        <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento >
                        <deal:Kit_Codigo>${cod ?? '?'}</deal:Kit_Codigo>
                        <deal:Kit_Descricao>${descricao ?? '?'}</deal:Kit_Descricao>
                        <deal:GrupoKit_Codigo>?</deal:GrupoKit_Codigo>
                        <deal:TipoOS_Sigla></deal:TipoOS_Sigla>
                    </deal:Sdt_fskitin>
                </deal:WS_FastServiceApi.KIT>
            </soapenv:Body>
            </soapenv:Envelope>
        `;

    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const kits: KitResponse | KitResponse[] =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.KITResponse']['Sdt_fskitout']['SDT_FSKitOut.Item'];

      if (!isArray(kits)) {
        if (kits.Mensagem) {
          throw new BadRequestException(kits.Mensagem);
        }
        return [kits];
      }

      return kits;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findNotaFiscalOS(api: string, user: string, key: string, doc: string, numeroOs: string): Promise<NotaFiscalResponse> {
    Logger.log(`Buscando nota fiscal OS : ${numeroOs}`, 'OS');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
                <soapenv:Header/>
                <soapenv:Body>
                    <deal:WS_FastServiceApi.NOTAFISCALOS>
                        <deal:Usuario>${user}</deal:Usuario>
                        <deal:Senha>${key}</deal:Senha>
                        <deal:Sdt_fsnotafiscalosin>
                            <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento>
                            <deal:NumeroOS>${numeroOs}</deal:NumeroOS>
                            <deal:CodigoOS>?</deal:CodigoOS>
                        </deal:Sdt_fsnotafiscalosin>
                </deal:WS_FastServiceApi.NOTAFISCALOS>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const notas =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.NOTAFISCALOSResponse']['Sdt_fsnotafiscalosout'][
        'SDT_FSNotaFiscalOSOut'
        ];

      if (notas.Mensagem) {
        throw new BadRequestException(notas.Mensagem);
      }
      return notas;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findOs(
    api: string,
    user: string,
    key: string,
    doc: string,
    integration_id?: string,
    dataInicio?: string,
    dataFim?: string,
    status?: string,
    veiculoPlacaChassi?: string,
  ): Promise<DealernetOrder[]> {
    Logger.log(`Buscando  OS Dealernet`, 'OS');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    if (dataInicio) {
      dataInicio = new Date(dataInicio).addDays(0).format('yyyy-MM-dd');
    }

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.ORDEMSERVICO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
            <deal:Sdt_fsordemservicoin>
                <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento>
                <deal:Chave>${integration_id ?? '?'}</deal:Chave>
                <deal:VeiculoPlacaChassi>${veiculoPlacaChassi ?? '?'}</deal:VeiculoPlacaChassi>
                <deal:Data>${dataInicio}</deal:Data>
                <deal:DataFinal>${dataFim ?? '?'}</deal:DataFinal>
                <deal:Status>${status ?? '?'}</deal:Status>
                <deal:Acao>LST</deal:Acao>
            </deal:Sdt_fsordemservicoin>
        </deal:WS_FastServiceApi.ORDEMSERVICO>
   </soapenv:Body>
</soapenv:Envelope>
    `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const orders: DealernetOrder | DealernetOrder[] =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista'][
        'SDT_FSOrdemServicoOut'
        ];

      if (!isArray(orders)) {
        if (orders.Mensagem) {
          throw new BadRequestException(orders.Mensagem);
        }
        return [orders];
      }

      return orders;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async createOs(api: string, user: string, key: string, doc: string, dto: CreateOsDTO): Promise<DealernetOrder> {
    Logger.log(`Criando OS Dealernet`, 'OS');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };

    const xmlBody = await this.createOsSchema(user, key, doc, dto);
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const order: DealernetOrder =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORDEMSERVICOResponse']['Sdt_fsordemservicooutlista'][
        'SDT_FSOrdemServicoOut'
        ];

      if (order.Mensagem && order.Chave === 0) {
        throw new BadRequestException(order.Mensagem);
      }

      return order;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async createOsSchema(user: string, key: string, doc: string, dto: CreateOsDTO): Promise<unknown> {

    const services = dto.servicos.length > 0 ? `
    <deal:Servicos>
    ${dto.servicos.map(item => {
      const products = item.produtos.length > 0 ? `
      <deal:Produtos>
      ${item.produtos.map(product => {
        return `
      <deal:Produto>
        <deal:TipoOSSigla>${product.tipo_os_sigla}</deal:TipoOSSigla>
        <deal:ProdutoReferencia>${product.produto_referencia}</deal:ProdutoReferencia>
        <deal:ValorUnitario>${product.valor_unitario}</deal:ValorUnitario>
        <deal:Quantidade>${product.quantidade}</deal:Quantidade>
      </deal:Produto>
        `
      }).join('\n')}
      </deal:Produtos>
      ` : ''

      return `
        <deal:Servico>
        <deal:TipoOSSigla>${item.tipo_os_sigla}</deal:TipoOSSigla>
        <deal:TMOReferencia>${item.tmo_referencia}</deal:TMOReferencia>
        <deal:Tempo>${item.tempo}</deal:Tempo>
        <deal:ValorUnitario>${item.valor_unitario}</deal:ValorUnitario>
        <deal:Quantidade>${item.quantidade}</deal:Quantidade>
         ${products}
        </deal:Servico>
    `
    }).join('\n')
      }
    </deal:Servicos>
    `: '';

    const xmlBody = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.ORDEMSERVICO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
            <deal:Sdt_fsordemservicoin>
                <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento>
                <deal:VeiculoPlacaChassi>${dto.veiculo_placa_chassi ?? '?'}</deal:VeiculoPlacaChassi>
                <deal:VeiculoKM>${dto.veiculo_Km ?? '?'}</deal:VeiculoKM>
                <deal:ClienteDocumento>${dto.cliente_documento ?? '?'}</deal:ClienteDocumento>
                <deal:ConsultorDocumento>${dto.consultor_documento ?? '?'}</deal:ConsultorDocumento>
                <deal:Data>${dto.data ?? '?'}</deal:Data>
                <deal:DataFinal>${dto.data_final ?? '?'}</deal:DataFinal>
                <deal:Status>${dto.status ?? '?'}</deal:Status>
                <deal:Observacao>${dto.observacao ?? '?'}</deal:Observacao>
                <deal:DataPrometida>${dto.data_prometida ?? '?'}</deal:DataPrometida>
                <deal:PercentualCombustivel>${dto.percentual_combustivel ?? '?'}</deal:PercentualCombustivel>
                <deal:PercentualBateria>${dto.percentual_bateria ?? '?'}</deal:PercentualBateria>
                <deal:ExigeLavagem>${dto.exige_lavagem ?? '?'}</deal:ExigeLavagem>
                <deal:ClienteAguardando>${dto.cliente_aguardando ?? '?'}</deal:ClienteAguardando>
                <deal:InspecionadoElevador>${dto.inspecionado_elevador ?? '?'}</deal:InspecionadoElevador>
                <deal:BloquearProduto>${dto.bloquear_produto ?? '?'}</deal:BloquearProduto>
                <deal:CorPrisma_Codigo>${dto.prisma_codigo ?? '?'}</deal:CorPrisma_Codigo>
                <deal:NroPrisma>${dto.nro_prisma ?? '?'}</deal:NroPrisma>
                <deal:OSEntregaDomicilio>${dto.os_entrega_domicilio ?? '?'}</deal:OSEntregaDomicilio>
                <deal:ObservacaoConsultor>${dto.observacao_consultor ?? '?'}</deal:ObservacaoConsultor>
                <deal:TipoOSSigla>${dto.tipo_os_sigla ?? '?'}</deal:TipoOSSigla>
                <deal:ExisteObjetoValor>${dto.existe_objeto_valor ?? '?'}</deal:ExisteObjetoValor>
                <deal:CarregarBateria>${dto.carregar_bateria ?? '?'}</deal:CarregarBateria>
                <deal:Acao>INC</deal:Acao>
                ${services}
                <deal:TipoOS>
                    <deal:TipoOSItem>
                        <deal:TipoOSSigla>${dto.tipo_os.tipo_os_item.tipo_os_sigla ?? '?'}</deal:TipoOSSigla>
                        <deal:ConsultorDocumento>${dto.tipo_os.tipo_os_item.consultor_documento ?? '?'}</deal:ConsultorDocumento>
                        <deal:CondicaoPagamento>${dto.tipo_os.tipo_os_item.condicao_pagamento ?? '?'}</deal:CondicaoPagamento>
                    </deal:TipoOSItem>
                </deal:TipoOS>
            </deal:Sdt_fsordemservicoin>
        </deal:WS_FastServiceApi.ORDEMSERVICO>
   </soapenv:Body>
</soapenv:Envelope>
    `;

    return xmlBody;
  }

  async findTMO(api: string, user: string, key: string, doc: string, descricao: string): Promise<TMO[]> {
    Logger.log(`Buscando TMO pela descrição: ${descricao}, api:${api}`, 'Servicos');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.TMO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fstmoin>
                    <deal:Empresa_Documento>${doc}</deal:Empresa_Documento>
                    <deal:TMO_Codigo>?</deal:TMO_Codigo>
                    <deal:TMO_Descricao>${descricao}</deal:TMO_Descricao>
                    <deal:TipoOS_Sigla>V1</deal:TipoOS_Sigla>
                    <deal:Veiculo_PlacaChassi>?</deal:Veiculo_PlacaChassi>
                    </deal:Sdt_fstmoin>
                </deal:WS_FastServiceApi.TMO>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const TMOS: TMO | TMO[] =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.TMOResponse']['Sdt_fstmooutlista']['SDT_FSTMOOut'];

      if (!isArray(TMOS)) {
        if (TMOS.Mensagem) {
          throw new BadRequestException(TMOS.Mensagem);
        }
        return [TMOS];
      }
      return TMOS;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async createVehicle(api: string, user: string, key: string, doc: string, dto: CreateVehicleDTO): Promise<void> {
    Logger.log(`Criando veiculo. api:${api}`, 'veiculo');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.VEICULO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fsveiculoin>
                        <deal:Veiculo_Placa>${dto.Veiculo_Placa}/deal:Veiculo_Placa>
                        <deal:Veiculo_Chassi>${dto.Veiculo_Chassi ?? '?'}</deal:Veiculo_Chassi>
                        <deal:VeiculoAno_Codigo>${dto.Veiculo_AnoCodigo ?? '?'}</deal:VeiculoAno_Codigo>
                        <deal:Veiculo_Modelo>${dto.Veiculo_Modelo ?? '?'}</deal:Veiculo_Modelo>
                        <deal:Veiculo_CorExterna>${dto.Veiculo_CorExterna ?? '?'}</deal:Veiculo_CorExterna>
                        <deal:Veiculo_Km>${dto.Veiculo_Km ?? '?'}</deal:Veiculo_Km>
                        <deal:Veiculo_DataVenda>${dto.Veiculo_DataVenda ?? '?'}</deal:Veiculo_DataVenda>
                        <deal:Veiculo_NumeroMotor>${dto.Veiculo_NumeroMotor ?? '?'}</deal:Veiculo_NumeroMotor>
                        <deal:Cliente_Documento>${dto.Cliente_Documento ?? '?'}</deal:Cliente_Documento>
                        <deal:Acao>INC</deal:Acao>
                    </deal:Sdt_fsveiculoin>
                </deal:WS_FastServiceApi.VEICULO>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);
      console.log(parsedData);
      return;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findBudget(api: string, user: string, key: string, doc: string, id: string): Promise<DealernetBudgetResponse> {
    Logger.log(`Buscando orçamento pela descrição: ${id}, api:${api}`, 'Budgets');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.ORCAMENTO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fsorcamentoin>
                        <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento>
                        <deal:Chave>${id}</deal:Chave>
                        <deal:Acao>LST</deal:Acao>
                    </deal:Sdt_fsorcamentoin>
                </deal:WS_FastServiceApi.ORCAMENTO>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);
      const budget = parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.ORCAMENTOResponse']['Sdt_fsorcamentoout'];

      if (budget.Mensage) {
        throw new BadRequestException(budget.Mensagem);
      }
      return budget;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findSchedulesGateway(api: string, user: string, key: string, dataInicio?: string, dataFim?: string, doc?: string): Promise<any[]> {
    if (!api) {
      throw new BadRequestException('api url not provided');
    }
    if (!user) {
      throw new BadRequestException('api user not provided');
    }
    if (!key) {
      throw new BadRequestException('api key  not provided');
    }
    if (!dataFim) {
      dataFim = '?';
    }
    if (!dataInicio) {
      dataInicio = new Date().addDays(0).format('yyyy-MM-dd');
      console.log(dataInicio);
    }
    const url = `${api}/DealerNetGateway.asmx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `<?xml version="1.0" encoding="utf-8" ?>
            <Autenticacao>
                <Usuario>${user}</Usuario>
                <Senha>${key}</Senha>
                <Empresa>01</Empresa>
            </Autenticacao>
            <ParametrosConsultarAgendamento>
            <DataInicial>${dataInicio}</DataInicial>
            <DataFinal>${dataFim}</DataFinal>
            <PlacaVeiculo></PlacaVeiculo>
            <ConsultorTecnico></ConsultorTecnico>
            </ParametrosConsultarAgendamento>
        `;
    console.log(xmlBody);
    try {
      console.log('url:' + url);
      const response = await webClient.post(url, xmlBody, { headers });
      console.log(response);
      Logger.log(`Response gateway : ${JSON.stringify(response.data)}`, 'findSchedulesGateway');
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);
      console.log(parsedData);
      return parsedData;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }

  async findProductByReference(
    api: string,
    user: string,
    key: string,
    doc: string,
    ref: string,
  ): Promise<ProdutoDealernetResponse[] | ProdutoDealernetResponse> {
    Logger.log(`Buscando produto pela ref: ${ref}, api:${api}`, 'Produtos');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.PRODUTO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fsprodutoin>
                        <deal:EmpresaDocumento>${doc}</deal:EmpresaDocumento >
                        <deal:ProdutoCodigo>?</deal:ProdutoCodigo >
                        <deal:ProdutoReferencia>
                          <deal:item>${ref}</deal:item>
                        </deal:ProdutoReferencia>
                        <deal:ProdutoDescricao>?</deal:ProdutoDescricao>
                        <deal:VeiculoPlacaChassi>?</deal:VeiculoPlacaChassi>
                    </deal:Sdt_fsprodutoin>
                </deal:WS_FastServiceApi.PRODUTO>
            </soapenv:Body>
            </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const products =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.PRODUTOResponse']['Sdt_fsprodutooutlista']['SDT_FSProdutoOut'];

      return products;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }
  async findServiceByReference(
    api: string,
    user: string,
    key: string,
    doc: string,
    ref: string,
  ): Promise<TMO[] | TMO> {
    Logger.log(`Buscando serviço pela ref: ${ref}, api:${api}`, 'Serviços');
    const url = `${api}/aws_fastserviceapi.aspx`;
    const headers = {
      'Content-Type': 'text/xml;charset=utf-8',
    };
    const xmlBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:deal="DealerNet">
            <soapenv:Header/>
            <soapenv:Body>
                <deal:WS_FastServiceApi.TMO>
                    <deal:Usuario>${user}</deal:Usuario>
                    <deal:Senha>${key}</deal:Senha>
                    <deal:Sdt_fstmoin>
                    <deal:Empresa_Documento>${doc}</deal:Empresa_Documento>
                    <deal:TMO_Codigo>?</deal:TMO_Codigo>
                    <deal:TMO_Descricao>?</deal:TMO_Descricao>
                    <deal:TMO_Referencia>
                        <deal:item>${ref}</deal:item>
                    </deal:TMO_Referencia>
                    <deal:TipoOS_Sigla>V1</deal:TipoOS_Sigla>
                    <deal:Veiculo_PlacaChassi>?</deal:Veiculo_PlacaChassi>
                    </deal:Sdt_fstmoin>
                </deal:WS_FastServiceApi.TMO>
            </soapenv:Body>
        </soapenv:Envelope>
        `;
    try {
      const response = await webClient.post(url, xmlBody, { headers });
      const xmlData = response.data;
      const parser = new XMLParser();
      const parsedData = parser.parse(xmlData);

      const TMOS: TMO | TMO[] =
        parsedData['SOAP-ENV:Envelope']['SOAP-ENV:Body']['WS_FastServiceApi.TMOResponse']['Sdt_fstmooutlista']['SDT_FSTMOOut'];

      if (!isArray(TMOS)) {
        if (TMOS.Mensagem) {
          throw new BadRequestException(TMOS.Mensagem);
        }
        return [TMOS];
      }
      return TMOS;
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      throw error;
    }
  }
}
