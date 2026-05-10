import { Router, Request, Response } from "express";
import authMiddleware from "../middlewares/auth";
import userMiddleware from "../middlewares/user";
import { AppDataSource } from "../data-source";
import Post from "../entities/Post";
import Like from "../entities/Like";

const router = Router();
const postRepo = AppDataSource.getRepository(Post);
const likeRepo = AppDataSource.getRepository(Like);

// 좋아요 토글
router.post("/", userMiddleware, authMiddleware, async (req: Request, res: Response) => {
  const { identifier, slug } = req.body;
  const user = res.locals.user;

  try {
    //  게시물 찾기
    const post = await postRepo.findOneOrFail({
      where: { identifier, slug },
    });

    //  기존 좋아요 확인
    const existingLike = await likeRepo.findOne({
      where: {
        username: user.username,
        postId: post.id, // 직접 postId 사용
      },
    });

    //  좋아요가 이미 있으면 제거
    if (existingLike) {
      await likeRepo.remove(existingLike);
      return res.json({ liked: false });
    }

    //  새 좋아요 생성
    const like = likeRepo.create({
      username: user.username,
      postId: post.id,
    });

    await likeRepo.save(like);
    return res.json({ liked: true });

  } catch (e) {
    console.error(" LIKE ERROR:", e);
    return res.status(500).json({ error: "좋아요 처리 실패" });
  }
});

export default router;
