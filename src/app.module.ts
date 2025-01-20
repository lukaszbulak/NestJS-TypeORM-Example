import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardModule } from './board/board.module';
import { UserModule } from './user/user.module';
import { User } from './entities/user/user.entity';
import { Board } from './entities/board/board.entity';
import { UserRepository } from './entities/user/user.repository';
import { BoardRepository } from './entities/board/board.repository';

@Module({
   imports: [TypeOrmModule.forRoot({

     name: 'default',

     type: 'sqlite',

     database: ':memory:',

     keepConnectionAlive: true,

      logging: true,

      synchronize: true,

      entities: [User, Board],



      }), UserModule, BoardModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
