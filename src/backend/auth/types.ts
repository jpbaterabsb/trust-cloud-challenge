import { IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty({ message: 'username nao pode ser vazio' })
  username: string;
  @IsNotEmpty({ message: 'password nao pode ser vazio' })
  password: string;
}
