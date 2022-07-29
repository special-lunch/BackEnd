import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage('이메일 형식이어야 합니다.'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('비밀번호를 입력해야 합니다.')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('유효하지 않은 이메일 혹은 비밀번호 입니다.');
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);

    if (!passwordsMatch) {
      throw new BadRequestError('유효하지 않은 이메일 혹은 비밀번호 입니다.');
    }

    //JWT 생성
    const userJwt = jwt.sign({
      id: existingUser.id,
      email: existingUser.email
    }, process.env.JWT_KEY!);

    //쿠키에 저장
    req.session = {
      jwt: userJwt
    };

    res.status(200).send(existingUser);
  });

export { router as signinRouter };