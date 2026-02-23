import { Router, Request, Response } from "express";
import authMiddleware from "../middlewares/auth";
import userMiddleware from "../middlewares/user";
import { AppDataSource } from "../data-source";
import Post from "../entities/Post";
import SavedPost from "../entities/SavedPost";

const router = Router();
const postRepo = AppDataSource.getRepository(Post);
const savedRepo = AppDataSource.getRepository(SavedPost);


router.post(
  "/:identifier/:slug/save",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { identifier, slug } = req.params;
    const user = res.locals.user;

    try {
      const post = await postRepo.findOneOrFail({
        where: { identifier, slug },
      });

      const saved = await savedRepo.findOne({
        where: {
          user: { id: user.id },
          post: { id: post.id },
        },
        relations: ["user", "post"],
      });

      //  토글
      if (saved) {
        await savedRepo.remove(saved);
        return res.json({ saved: false });
      } else {
        const newSaved = savedRepo.create({ user, post });
        await savedRepo.save(newSaved);
        return res.json({ saved: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "저장 처리 실패" });
    }
  }
);




  //  저장한 게시물 목록 (사이드바용)
const getSavedPosts = async (req: Request, res: Response) => {
  const user = res.locals.user;

  if (!user) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  try {
    const savedPosts = await savedRepo.find({
      where: {
        user: { id: user.id },
      },
      relations: [
        "post",
        "post.sub",
        "post.user",
        "post.votes",
        "post.comments",
        "post.savedPosts",
        "post.savedPosts.user",
      ],
      order: {
        createdAt: "DESC", 
      },
      take: 3, 
    });

    const posts = savedPosts.map(sp => sp.post);

    posts.forEach(post => {
      post.setSaved(user); 
    });

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "저장한 게시물 조회 실패" });
  }
};



router.get("/", userMiddleware, getSavedPosts);

export default router;







