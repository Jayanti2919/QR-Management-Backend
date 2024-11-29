import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: Repository<User>;
  let mockJwtService: JwtService;

  beforeEach(() => {
    // Mocking the userRepository and JwtService
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<User>;

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as JwtService;

    // Instantiating AuthService with the mocked dependencies
    authService = new AuthService(mockUserRepository, mockJwtService);
  });

  describe('register', () => {
    it('should register a new user with default role "user" when no role is provided', async () => {
      const registerDto = {
        username: 'testUser',
        password: 'password123',
        role: 'user',
      };
      const hashedPassword = 'hashedPassword';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      const objectID = new ObjectId('e34124411211');
      const mockUser = {
        _id: objectID,
        username: 'testUser',
        password: hashedPassword,
        role: 'user',
      };
      jest.spyOn(mockUserRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockUser);

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        message: 'User created successfully',
        username: 'testUser',
        role: 'user',
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
        role: 'user',
      });

      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should give appropriate error if username is missing', async () => {
      const registerDto = {
        username: '',
        password: 'password345',
        role: 'user',
      };

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      // Call the register method and check if an error is thrown
      await expect(authService.register(registerDto)).rejects.toThrowError(
        'Username and password are required',
      );
    });

    it('should give appropriate error if password is missing', async () => {
      const registerDto = {
        username: 'user1',
        password: '',
        role: 'user',
      };

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      // Call the register method and check if an error is thrown
      await expect(authService.register(registerDto)).rejects.toThrowError(
        'Username and password are required',
      );
    });
  });

  describe('login', () => {
    it('should return an access token if credentials are valid', async () => {
      const loginDto = { username: 'user1', password: 'password123' };
      const objectID = new ObjectId('e34124411211');
      const mockUser = {
        _id: objectID,
        username: 'user1',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      };

      const expectedAccessToken = 'mockAccessToken';

      // Mock the repository and bcrypt compare
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(mockJwtService, 'sign').mockReturnValue(expectedAccessToken);

      const result = await authService.login(
        loginDto.username,
        loginDto.password,
      );

      expect(result).toEqual({ accessToken: expectedAccessToken });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: loginDto.username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: mockUser._id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw an error if username or password is missing', async () => {
      await expect(authService.login('', 'password123')).rejects.toThrowError(
        'Username and password are required',
      );
      await expect(authService.login('user1', '')).rejects.toThrowError(
        'Username and password are required',
      );
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const loginDto = { username: 'user1', password: 'password123' };
      const objectID = new ObjectId('e34124411211');
      const mockUser = {
        _id: objectID,
        username: 'user1',
        password: await bcrypt.hash('wrongPassword', 10),
        role: 'user',
      };

      // Mock the repository and bcrypt compare to simulate invalid password
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); // Simulating incorrect password

      await expect(
        authService.login(loginDto.username, loginDto.password),
      ).rejects.toThrowError(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw an UnauthorizedException if user does not exist', async () => {
      const loginDto = { username: 'nonexistentUser', password: 'password123' };

      // Mock the repository to return null for a non-existing user
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.login(loginDto.username, loginDto.password),
      ).rejects.toThrowError(new UnauthorizedException('Invalid credentials'));
    });
  });
});
