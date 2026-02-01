import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  // todos los ususario

  it('should return all users', async () => {
    const users = [
      { idUser: '1', nombre: 'Joako' },
      { idUser: '2', nombre: 'Damian' },
    ];

    mockUserRepository.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(result).toEqual(users);
    expect(mockUserRepository.find).toHaveBeenCalled();
  });

  // busqueda por id

  it('should return a user when found', async () => {
    const user = { idUser: '123', nombre: 'Laura' };

    mockUserRepository.findOne.mockResolvedValue(user);

    const result = await service.findOne('123');

    expect(result).toEqual(user);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { idUser: '123' },
      relations: ['Turnos'],
    });
  });

  it('should throw NotFoundException if user not exist', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
  });

  //editar usuario

  it('should update and return the user', async () => {
    const user = { idUser: '1', nombre: 'Laura' } as User;
    const data = { nombre: 'Laura Maria' };

    mockUserRepository.findOne.mockResolvedValue(user);
    mockUserRepository.merge.mockReturnValue({ ...user, ...data });
    mockUserRepository.save.mockResolvedValue({ ...user, ...data });

    const result = await service.modifyUser('1', data);

    expect((result as User).nombre).toBe('Laura Maria');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { idUser: '1' },
    });
  });

  it('should throw NotFoundException if user not found on update', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.modifyUser('99', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  //borrar usuario

  it('should delete the user', async () => {
    const user = { idUser: '1' } as User;

    mockUserRepository.findOne.mockResolvedValue(user);
    mockUserRepository.remove.mockResolvedValue(user);

    const result = await service.deleteUser('1');

    expect(result).toBe('Se elimino usuario con exito');
  });

  it('should throw NotFoundException if user not found on delete', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.deleteUser('1')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if remove fails', async () => {
    const user = { idUser: '1' } as User;

    mockUserRepository.findOne.mockResolvedValue(user);
    mockUserRepository.remove.mockResolvedValue(null);

    await expect(service.deleteUser('1')).rejects.toThrow(BadRequestException);
  });
});
