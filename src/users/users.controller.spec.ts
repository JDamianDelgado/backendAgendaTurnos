import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;

  // Mock del servicio de usuarios
  const mockUsersService = {
    findAll: jest.fn().mockReturnValue([{ idUser: 1, nombre: 'Test User' }]),
    findOne: jest
      .fn()
      .mockImplementation((id) => ({ idUser: id, nombre: 'Test User' })),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    update: jest.fn().mockImplementation((id, dto) => ({ idUser: id, ...dto })),
    remove: jest.fn().mockReturnValue({ deleted: true }),
  };

  // Mocks de guards
  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of users', async () => {
    expect(await controller.findAll()).toEqual([
      { idUser: 1, nombre: 'Test User' },
    ]);
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  // it('should return a single user by id', async () => {
  //   expect(await controller.findOne('5')).toEqual({
  //     idUser: '5',
  //     nombre: 'Test User',
  //   });
  //   expect(mockUsersService.findOne).toHaveBeenCalledWith(+'5');
  // });

  // it('should update a user', async () => {
  //   const updateDto = { nombre: 'Updated Name' };
  //   expect(await controller.update('10', updateDto)).toEqual({
  //     idUser: '10',
  //     ...updateDto,
  //   });
  //   expect(mockUsersService.update).toHaveBeenCalledWith(+'10', updateDto);
  // });

  // it('should remove a user', async () => {
  //   expect(await controller.remove('7')).toEqual({ deleted: true });
  //   expect(mockUsersService.remove).toHaveBeenCalledWith(+'7');
  // });
});
