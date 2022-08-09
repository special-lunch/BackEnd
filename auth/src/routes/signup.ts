import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { BadRequestError, validateRequest } from '@special-lunch/common';
import { User } from '../models/user';
const router = express.Router();

router.post('/api/users/signup',
  [
    body('email')
      .isEmail()
      .withMessage('이메일 형식이어야 합니다.'),
    body('password')
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage('비밀번호는 8자에서 20자 사이여야 합니다.')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, nickname } = req.body;
    const role = 'CUSTOMER';

    //이미 존재하는 유저를 검사
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('사용중인 이메일입니다.');
    }

    const user = User.build({ email, password, nickname, role });

    await user.save();

    //JWT 생성
    const userJwt = jwt.sign({
      id: user.id,
      email: user.email
    }, process.env.JWT_KEY!);

    //쿠키에 저장
    req.session = {
      jwt: userJwt
    };

    res.status(201).send(user);
  });

export { router as signupRouter };