import { NextFunction, Request, Response, Router } from "express";
import { isEmpty } from "class-validator";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { unlinkSync } from "fs";

import { AppDataSource } from "../data-source";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import User from "../entities/User";
import Sub from "../entities/Sub";
import Post from "../entities/Post";
import { makeId } from "../utils/helpers";

  //  Repository
const subRepo = AppDataSource.getRepository(Sub);
const postRepo = AppDataSource.getRepository(Post);

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;
  const currentPage = Number(req.query.page || 0);
  const perPage = Number(req.query.count || 8);

  try {
    const sub = await subRepo.findOneOrFail({ where: { name } });

    const posts = await postRepo.find({
      where: { subName: sub.name },
      relations: ["comments", "votes", "user", "savedPosts", "savedPosts.user", "likes", "likes.user"],
      order: { createdAt: "DESC" },
      skip: currentPage * perPage,
      take: perPage,
    });

     const postCount = await postRepo.count({
      where: { subName: sub.name },
    });

    sub.posts = posts;
    (sub as any).postCount = postCount;


    if (res.locals.user) {
      sub.posts.forEach(p => {
      p.setUserVote(res.locals.user);
      p.setSaved(res.locals.user);
      p.setLiked(res.locals.user);
    });

    }

    return res.json(sub);
  } catch (error) {
    console.error(error);
    return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다." });
  }
};

  //  Get Sub
// const getSub = async (req: Request, res: Response) => {
//   const name = req.params.name;

//   try {
//     const sub = await subRepo.findOneOrFail({ where: { name } });

//     const posts = await postRepo.find({
//       where: { subName: sub.name },
//       relations: ["comments", "votes", "user", "savedPosts", "savedPosts.user", "likes", "likes.user"],
//       order: { createdAt: "DESC" },
//     });

//      const postCount = await postRepo.count({
//       where: { subName: sub.name },
//     });

//     sub.posts = posts;
//     (sub as any).postCount = postCount;


//     if (res.locals.user) {
//       sub.posts.forEach(p => {
//       p.setUserVote(res.locals.user);
//       p.setSaved(res.locals.user);
//       p.setLiked(res.locals.user);
//     });

//     }

//     return res.json(sub);
//   } catch (error) {
//     console.error(error);
//     return res.status(404).json({ error: "커뮤니티를 찾을 수 없습니다." });
//   }
// };

  //  Create Sub
const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  let errors: any = {};
  if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
  if (isEmpty(title)) errors.title = "제목은 비워둘 수 없습니다.";

  try {
    const exist = await subRepo
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (exist) errors.name = "서브가 이미 존재합니다.";
    if (Object.keys(errors).length > 0) throw errors;

    const user: User = res.locals.user;

    const sub = subRepo.create({
      name,
      title,
      description,
      user,
    });

    await subRepo.save(sub);
    return res.json(sub);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

  //  Top Subs 
const topSubs = async (_: Request, res: Response) => {
  try {
    const imageUrlExp = `
      COALESCE(
        '${process.env.APP_URL}/images/' || s."imageUrn",
        'https://www.gravatar.com/avatar?d=mp&f=y'
      )
    `;

    const subs = await subRepo
      .createQueryBuilder("s")
      .select(`
        s.title,
        s.name,
        ${imageUrlExp} AS "imageUrl",
        COUNT(p.id) AS "postCount"
      `)
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy(`s.title, s.name, "imageUrl"`)
      .orderBy(`"postCount"`, "DESC")
      .limit(4)
      .getRawMany();

    return res.json(subs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};


// All Subs
const allSubs = async (_: Request, res: Response) => {
  try {
    const imageUrlExp = `
      COALESCE(
        '${process.env.APP_URL}/images/' || s."imageUrn",
        'https://www.gravatar.com/avatar?d=mp&f=y'
      )
    `;

    const subs = await subRepo
      .createQueryBuilder("s")
      .select(`
        s.title,
        s.name,
        ${imageUrlExp} AS "imageUrl",
        COUNT(p.id) AS "postCount"
      `)
      .leftJoin(Post, "p", `s.name = p."subName"`)
      .groupBy(`s.title, s.name, "imageUrl"`)
      .orderBy(`"postCount"`, "DESC")
      .getRawMany();

    return res.json(subs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

  //  Own Sub Middleware
const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await subRepo.findOneOrFail({
      where: { name: req.params.name },
    });

    if (sub.username !== res.locals.user.username) {
      return res
        .status(403)
        .json({ error: "이 커뮤니티를 소유하고 있지 않습니다." });
    }

    res.locals.sub = sub;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

  //  Upload Config
const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeId(10);
      callback(null, name + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new Error("이미지가 아닙니다."));
    }
  },
});

  //  Upload Sub Image
const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;

  try {
    const type = req.body.type;
    if (!["image", "banner"].includes(type)) {
      if (req.file?.path) unlinkSync(req.file.path);
      return res.status(400).json({ error: "잘못된 유형" });
    }

    let oldUrn = "";

    if (type === "image") {
      oldUrn = sub.imageUrn || "";
      sub.imageUrn = req.file?.filename || "";
    } else {
      oldUrn = sub.bannerUrn || "";
      sub.bannerUrn = req.file?.filename || "";
    }

    await subRepo.save(sub);

    if (oldUrn) {
      unlinkSync(path.join("public/images", oldUrn));
    }

    return res.json(sub);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

  //  Router
const router = Router();

router.get("/topSubs", topSubs);
router.get("/allSubs", allSubs);
router.get("/:name", userMiddleware, getSub);
router.post("/", userMiddleware, authMiddleware, createSub);
router.post(
  "/:name/upload",
  userMiddleware,
  authMiddleware,
  ownSub,
  upload.single("file"),
  uploadSubImage
);

export default router;
