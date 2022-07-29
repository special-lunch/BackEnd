import request from 'supertest';
import { app } from '../../app';

it('성공시 201 반환', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
});

it('잘못된 이메일은 400 반환', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'adfasdfasd',
      password: 'password'
    })
    .expect(400);
});

it('잘못된 패스워드는 400 반환', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'adfasdfasd',
      password: 'o'
    })
    .expect(400);
});

it('이메일, 패스워드 누락은 400 반환', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'password'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
    })
    .expect(400);
});

it('동일한 이메일로 가입 금지', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('성공적으로 가입 시 쿠키에 JWT 설정', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});