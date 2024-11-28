import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{message: string, username: string, role: string}> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    var user = null;
    if (!dto.role) {
      user = this.userRepository.create({ ...dto, role: "user", password: hashedPassword });
    } else {
      user = this.userRepository.create({ ...dto, password: hashedPassword });
    }
    await this.userRepository.save(user);
    return { message: "User created successfully", username: user.username, role: user.role };
  } 

  async login(username: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { id: user._id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
