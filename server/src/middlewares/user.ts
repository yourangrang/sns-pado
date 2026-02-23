import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import  User from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    const { username }: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { username },
    });

    if (!user) return next();

    // 이후 미들웨어 / 라우트에서 바로 사용 가능
    res.locals.user = user;
    return next();
  } catch (error) {
    console.log(error);
    return next();
  }
};


//현 미들웨어 목적: 
// 요청마다 쿠키의 JWT를 보고 사용자가 로그인했는지 판단하고 res.local.user에 넣어주어 미들웨어나 라우트에서 바로 사용 가능
// 각 라우트에서 JWT를 다시 확인하지 않아도 됨
