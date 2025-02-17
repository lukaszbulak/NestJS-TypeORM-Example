import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { Board } from '../src/entities/board/board.entity';
import { User } from '../src/entities/user/user.entity';
import { BoardModule } from '../src/board/board.module';
import { BoardInfoResponseDto } from '../src/board/dtos/board-info.dto';
describe('BoardController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let boardRepository: Repository<Board>;
  const NAME = 'NAME';
  const EMAIL = 'test@test.com';
  const PASSWORD = '12345asbcd';
  const TITLE = 'THIS IS TITLE';
  const CONTENT = 'THIS IS CONTENT';

  const saveUser = async (): Promise<User> => {
    const savedUser = new User();
    savedUser.setEmail = EMAIL;
    savedUser.setName = NAME;
    savedUser.setPassword = PASSWORD;
    return await userRepository.save(savedUser);
  };

  const saveBoards = async (count: number): Promise<User> => {
    const savedUser = await saveUser();
    for (let i = 0; i < count; i++) {
      const board = new Board();
      board.setContent = `${CONTENT + count}`;
      board.setTitle = `${TITLE + count}`;
      board.user = savedUser;
      await boardRepository.save(board);
    }
    return userRepository.findOne({where: {getUser_id: savedUser.getUser_id},
      relations: ['boards'],
    });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        BoardModule,
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [User, Board],
          logging: false,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    userRepository = moduleFixture.get('UserRepository');
    boardRepository = moduleFixture.get('BoardRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await boardRepository.query('DELETE FROM boards');
    await userRepository.query('DELETE FROM users');
  });

  it('[GET] /board/{boardId} : Response is OK if conditions are right', async () => {
    const savedUser = await saveBoards(1);
    const boardId = savedUser.boards[0].getBoard_id;

    const result = await request(app.getHttpServer())
      .get(`/board/${boardId}`)
      .expect(HttpStatus.OK);
    const response = result.body as BoardInfoResponseDto;
    expect(response.name).toBe(NAME);
    expect(response.userId).toBe(savedUser.getUser_id);
    expect(response.boardId).toBe(boardId);
    expect(response.content).toBe(`${CONTENT + 1}`);
    expect(response.title).toBe(`${TITLE + 1}`);
  });

  it('[GET] /board/{boardId} : Response is NOT_FOUND if boardId is invalid', async () => {
    return request(app.getHttpServer())
      .get('/board/-1')
      .expect(HttpStatus.NOT_FOUND);
  });

  it('[GET] /board : Should return array of 5 objects since 7 boards are saved', async () => {
    const savedUser = await saveBoards(7);
    const result = await request(app.getHttpServer()).get(
      '/board?page=0&size=5',
    );
    expect(result.status).toBe(HttpStatus.OK);
    const response = result.body as BoardInfoResponseDto[];
    expect(response.length).toBe(5);
    for (const board of response) {
      expect(typeof board.boardId).toBe('number');
      expect(board.content).toContain(CONTENT);
      expect(board.createdAt).toBeDefined();
      expect(board.lastModifiedAt).toBeDefined();
      expect(board.name).toBe(NAME);
      expect(board.title).toContain(TITLE);
      expect(board.userId).toBe(savedUser.getUser_id);
    }
  });

  it('[GET] /board: Should return array of 2 objects since 7 boards are saved', async () => {
    const savedUser = await saveBoards(7);
    const result = await request(app.getHttpServer()).get(
      '/board?page=1&size=5',
    );
    expect(result.status).toBe(HttpStatus.OK);
    const response = result.body as BoardInfoResponseDto[];
    expect(response.length).toBe(2);
    for (const board of response) {
      expect(typeof board.boardId).toBe('number');
      expect(board.content).toContain(CONTENT);
      expect(board.createdAt).toBeDefined();
      expect(board.lastModifiedAt).toBeDefined();
      expect(board.name).toBe(NAME);
      expect(board.title).toContain(TITLE);
      expect(board.userId).toBe(savedUser.getUser_id);
    }
  });

  it('[GET] /board: Should return array of 0 objects since 0 boards are saved', async () => {
    const result = await request(app.getHttpServer()).get(
      '/board?page=0&size=5',
    );
    expect(result.status).toBe(HttpStatus.OK);
    const response = result.body as BoardInfoResponseDto[];
    expect(response.length).toBe(0);
  });
});
