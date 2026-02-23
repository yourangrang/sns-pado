import { Request, Response, Router, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import User from "../entities/User";
import Post from "../entities/Post";
import Comment from "../entities/Comment";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { unlinkSync } from "fs";
import { makeId } from "../utils/helpers";


const router = Router();



router.get(
  "/count",
  userMiddleware,
  authMiddleware,
  async (_: Request, res: Response) => {
    try {
      const user: User = res.locals.user;

      const postRepo = AppDataSource.getRepository(Post);
      const commentRepo = AppDataSource.getRepository(Comment);

      const postCount = await postRepo.count({
        where: { username: user.username },
      });

      const commentCount = await commentRepo.count({
        where: { username: user.username },
      });

      return res.json({
        username: user.username,
        postCount,
        commentCount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "문제가 발생했습니다." });
    }
  }
);

  //  Multer Config
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

  //  Own User Middleware
const ownUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User = res.locals.user;

    if (user.username !== req.params.username) {
      return res
        .status(403)
        .json({ error: "본인만 이미지를 변경할 수 있습니다." });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

  //  Get User Profile
router.get("/:username", userMiddleware, async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const postRepo = AppDataSource.getRepository(Post);
    const commentRepo = AppDataSource.getRepository(Comment);


    const user = await userRepo.findOneOrFail({
      where: { username: req.params.username },
      select: ["username", "createdAt", "imageUrn"],
    });

    const posts = await postRepo.find({
      where: { username: user.username },
      relations: ["comments", "votes", "sub", "user", "savedPosts", "savedPosts.user", "likes", "likes.user"],
    });

    const comments = await commentRepo.find({
      where: { username: user.username },
      relations: ["post", "votes"],
    });

    if (res.locals.user) {
      const currentUser = res.locals.user;
      posts.forEach((p) => p.setUserVote(currentUser));
      posts.forEach((p) => p.setSaved(currentUser));
      posts.forEach((p) => p.setLiked(currentUser));
      comments.forEach((c) => c.setUserVote(currentUser));
    }

    const userData: any[] = [];
    posts.forEach((p) => userData.push({ type: "Post", ...p.toJSON() }));
    comments.forEach((c) => userData.push({ type: "Comment", ...c.toJSON() }));

    userData.sort((a, b) =>
      b.createdAt > a.createdAt ? 1 : -1
    );

    return res.json({
      user: {
        ...user,
        imageUrl: user.imageUrl,
      },
      userData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
});

  //  Upload User Image
router.post(
  "/:username/upload",
  userMiddleware,
  authMiddleware,
  ownUser,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const user: User = res.locals.user;

      if (!req.file) {
        return res.status(400).json({ error: "파일이 없습니다." });
      }

      const oldUrn = user.imageUrn || "";
      user.imageUrn = req.file.filename;

      await AppDataSource.getRepository(User).save(user);

      if (oldUrn) {
        unlinkSync(path.join("public/images", oldUrn));
      }

      return res.json({
        success: true,
        imageUrl: `${process.env.APP_URL}/images/${user.imageUrn}`,
      });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "문제가 발생했습니다." });
    }
  }
);





export default router;

