import { RequestContext } from 'nestjs-easy-context';
import { Test, TestingModule } from '@nestjs/testing';

import { ContextService } from './context.service';

describe('ContextService', () => {
  let service: ContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContextService],
    }).compile();

    service = module.get<ContextService>(ContextService);
  });

  describe('currentUser', () => {
    it('should return the current user', () => {
      const user = {} as any;

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValueOnce({ req: { user: user }, res: undefined });

      const result = service.currentUser();

      expect(result).toBe(user);
    });
  });

  describe('getClients', () => {
    it('should return the current clients', () => {
      const clients = [] as any[];

      jest.spyOn(service, 'currentUser').mockReturnValueOnce({ clients: clients } as any);

      const result = service.getClients();

      expect(result).toBe(clients);
    });

    it('should return an empty array if there are no clients', () => {
      jest.spyOn(service, 'currentUser').mockReturnValueOnce({ clients: [] } as any);

      const result = service.getClients();

      expect(result).toEqual([]);
    });
  });

  describe('getClientIds', () => {
    it('should return the current client ids', () => {
      const clients = [{ id: '1' }, { id: '2' }] as any[];

      jest.spyOn(service, 'getClients').mockReturnValueOnce(clients);

      const result = service.getClientIds();

      expect(result).toEqual(['1', '2']);
    });
  });

  describe('getPools', () => {
    it('should return the current pools', () => {
      const clients = [{ pool: { id: '1' } }, { pool: { id: '2' } }] as any[];

      jest.spyOn(service, 'getClients').mockReturnValueOnce(clients);

      const result = service.getPools();

      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('getPoolIds', () => {
    it('should return the current pool ids', () => {
      const clients = [{ pool: { id: '1' } }, { pool: { id: '2' } }] as any[];

      jest.spyOn(service, 'getClients').mockReturnValueOnce(clients);

      const result = service.getPoolIds();

      expect(result).toEqual(['1', '2']);
    });
  });

  describe('getCompanies', () => {
    it('should return the current companies', () => {
      const clients = [{ company: { id: '1' } }, { company: { id: '2' } }] as any[];

      jest.spyOn(service, 'getClients').mockReturnValueOnce(clients);

      const result = service.getCompanies();

      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('getCompanyIds', () => {
    it('should return the current company ids', () => {
      const clients = [{ company: { id: '1' } }, { company: { id: '2' } }] as any[];

      jest.spyOn(service, 'getClients').mockReturnValueOnce(clients);

      const result = service.getCompanyIds();

      expect(result).toEqual(['1', '2']);
    });
  });

  describe('request', () => {
    it('should return the current request', () => {
      const request = {} as Request;

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValueOnce({ req: request, res: undefined });

      const result = service.request();

      expect(result).toBe(request);
    });
  });

  describe('response', () => {
    it('should return the current response', () => {
      const response = {} as Response;

      jest.spyOn(RequestContext, 'currentContext', 'get').mockReturnValueOnce({ res: response, req: undefined });

      const result = service.response();

      expect(result).toBe(response);
    });
  });
});
