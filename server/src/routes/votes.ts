import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { AppDataSource } from "../data-source";
import User from "../entities/User";
import Post from "../entities/Post";
import Vote from "../entities/Vote";
import Comment from "../entities/Comment";

const router = Router();

router.post("/", userMiddleware, authMiddleware, async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  if (![-1, 0, 1].includes(value)) {
    return res
      .status(400)
      .json({ value: "-1, 0, 1의 value만 올 수 있습니다." });
  }

  try {
    const user: User = res.locals.user;

    const postRepo = AppDataSource.getRepository(Post);
    const voteRepo = AppDataSource.getRepository(Vote);
    const commentRepo = AppDataSource.getRepository(Comment);

    const post = await postRepo.findOneByOrFail({ identifier, slug });

    let vote: Vote | null = null;
    let comment: Comment | null = null;

    if (commentIdentifier) {
      comment = await commentRepo.findOneByOrFail({
        identifier: commentIdentifier,
      });

      vote = await voteRepo.findOneBy({
        username: user.username,
        commentId: comment.id,
      });
    } else {
      vote = await voteRepo.findOneBy({
        username: user.username,
        postId: post.id,
      });
    }

    // vote 없음 + value 0 → 에러
    if (!vote && value === 0) {
      return res.status(404).json({ error: "Vote을 찾을 수 없습니다." });
    }

    // vote 새로 생성
    if (!vote && value !== 0) {
      vote = voteRepo.create({
        user,
        value,
        post: comment ? undefined : post,
        comment: comment ?? undefined,
      });
      await voteRepo.save(vote);
    }
    // vote 삭제
    else if (vote && value === 0) {
      await voteRepo.remove(vote);
    }
    // vote 값 변경
    else if (vote && vote.value !== value) {
      vote.value = value;
      await voteRepo.save(vote);
    }

    // 최신 post 다시 조회 (vote/댓글 반영)
    const updatedPost = await postRepo.findOneOrFail({
      where: { identifier, slug },
      relations: ["comments", "comments.votes", "sub", "votes"],
    });

    updatedPost.setUserVote(user);
    updatedPost.comments.forEach((c) => c.setUserVote(user));

    return res.json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
});

export default router;
