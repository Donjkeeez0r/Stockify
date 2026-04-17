import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('Аутентификация')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации',
  })
  @ApiResponse({
    status: 409,
    description: 'Email уже занят',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему и получение JWT токена' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход в систему',
  })
  @ApiResponse({
    status: 401,
    description: 'Неверные учетные данные',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
