import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source";
import User from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const router = Router();
const userRepo = AppDataSource.getRepository(User);

const mapError = (errors: Object[]) =>
  errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.values(err.constraints)[0];
    return prev;
  }, {});

router.get("/me", userMiddleware, authMiddleware, async (req: Request, res: Response) => {
   const user: User = res.locals.user;

    return res.json({
      ...user,
      imageUrl: user.imageUrl, // getter 수동 포함
    });
  }
);

router.post("/register", async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    if (await userRepo.findOneBy({ email }))
      errors.email = "이미 해당 이메일 주소가 사용되었습니다.";

    if (await userRepo.findOneBy({ username }))
      errors.username = "이미 이 사용자 이름이 사용되었습니다.";

    if (Object.keys(errors).length > 0)
      return res.status(400).json(errors);

    const user = userRepo.create({ email, username, password });

    const validationErrors = await validate(user);
    if (validationErrors.length > 0)
      return res.status(400).json(mapError(validationErrors));

    await userRepo.save(user);
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "회원가입 실패" });
  }
});

router.post("/guest", async (req: Request, res: Response) => {

  try {

    const user = await userRepo.findOneBy({ username: "guest" });
    if (!user)
      return res.status(404).json({ username: "사용자를 찾을 수 없습니다." });

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);

    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    );

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "로그인 실패" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};
    if (isEmpty(username)) errors.username = "사용자 이름은 비워둘 수 없습니다.";
    if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다.";
    if (Object.keys(errors).length > 0)
      return res.status(400).json(errors);

    const user = await userRepo.findOneBy({ username });
    if (!user)
      return res.status(404).json({ username: "사용자를 찾을 수 없습니다." });

    const matches = await bcrypt.compare(password, user.password);
    if (!matches)
      return res.status(401).json({ password: "비밀번호가 잘못되었습니다." });

    const token = jwt.sign({ username }, process.env.JWT_SECRET);

    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    );

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "로그인 실패" });
  }
});

router.post("/logout", userMiddleware, authMiddleware, (_req, res) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    })
  );
  res.json({ success: true });
});

export default router;
