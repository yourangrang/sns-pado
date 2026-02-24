import { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import Comment from "../entities/Comment";
import SavedPost from "../entities/SavedPost";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { ILike, Like, QueryBuilder } from "typeorm";
import multer from "multer";
import { makeId } from "../utils/helpers";
import path from "path";
import { instanceToPlain } from "class-transformer";

const postRepo = AppDataSource.getRepository(Post);
const subRepo = AppDataSource.getRepository(Sub);
const commentRepo = AppDataSource.getRepository(Comment);
const savedRepo = AppDataSource.getRepository(SavedPost);

// 인기게시글

export const getPopularPosts = async (req: Request, res: Response) => {

  const currentPage = Number(req.query.page || 0);
  const perPage = Number(req.query.count || 8);

   try {
   const posts = await postRepo.find({
  relations: ["user", "sub", "comments", "likes", "likes.user", "savedPosts", "savedPosts.user"],
});

if (res.locals.user) {
  posts.forEach(p => {
    p.setUserVote(res.locals.user);
    p.setSaved(res.locals.user);
    p.setLiked(res.locals.user);
  });
}

const sortedPosts = posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

// 페이지네이션
const paginated = sortedPosts.slice(currentPage * perPage, (currentPage + 1) * perPage);

return res.json(paginated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch popular posts" });
  }
};




// 게시물 목록

const getPosts = async (req: Request, res: Response) => {
  const currentPage = Number(req.query.page || 0);
  const perPage = Number(req.query.count || 8);

  try {
    const posts = await postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.sub', 'sub')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.votes', 'votes')
      .leftJoinAndSelect('post.savedPosts', 'savedPosts')
      .leftJoinAndSelect('savedPosts.user', 'savedUser')
      .leftJoinAndSelect("post.likes", "likes")
      .leftJoinAndSelect("likes.user", "likeUser")

      //  최신 댓글 3개만
      .leftJoinAndSelect(
        'post.comments',
        'comment',
      )
      .leftJoinAndSelect('comment.user', 'commentUser')
      
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('comment.createdAt', 'DESC')
      .skip(currentPage * perPage)
      .take(perPage)
      .getMany();

    //  댓글 3개만 잘라서 recentComments로 옮김
    posts.forEach(p => {
      (p as any).commentCount = p.comments?.length || 0;
      p.recentComments = p.comments
        ?.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 3)
        
        

      // 원본 comments는 버림
      delete (p as any).comments;
    });

    if (res.locals.user) {
      posts.forEach(p => {
        p.setUserVote(res.locals.user);
        p.setSaved(res.locals.user);
        p.setLiked(res.locals.user);
      });
    }


    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '문제가 발생했습니다.' });
  }
};



  //  게시물 단건 조회
const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await postRepo.findOneOrFail({
      where: { identifier, slug },
      relations: [
        "sub",
        "votes",
        "comments",
        "user",
        "savedPosts",
        "savedPosts.user",
        "likes",
        "likes.user"
      ],
    });

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
      post.setSaved(res.locals.user);
      post.setLiked(res.locals.user);
    }

    return res.json(post);
  } catch {
    return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
  }
};

//  Multer 설정
const upload = multer({
    storage: multer.diskStorage({
        destination: "public/images",
        filename: (_, file, cb) => {
            const id = makeId(10);
            cb(null, id + path.extname(file.originalname));
        },
    }),
    fileFilter: (_, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") cb(null, true);
        else cb(new Error("이미지 파일만 업로드 가능합니다."));
    },
});

// 랜덤 게시물
const getRandomPost = async (req: Request, res: Response) => {
  try {
    const count = await postRepo.count();

    if (count === 0) {
      return res.status(404).json({ error: "게시물이 없습니다." });
    }

    const randomIndex = Math.floor(Math.random() * count);

    const posts = await postRepo.find({
      relations: [
        "sub",
        "votes",
        "comments",
        "user",
        "savedPosts",
        "savedPosts.user",
        "likes",
        "likes.user",
      ],
      order: { createdAt: "DESC" },
      skip: randomIndex,
      take: 1,
    });

    const post = posts[0];
    
    if (!post) {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
      post.setSaved(res.locals.user);
      post.setLiked(res.locals.user);
    }

    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "랜덤 게시물 조회 중 오류 발생" });
  }
};


  //  게시물 생성 (이미지 업로드 포함)

const createPost = async (req: Request, res: Response) => {
        const { title, body, sub } = req.body;

        if (!title?.trim()) return res.status(400).json({ title: "제목은 필수입니다." });
        if (!body?.trim()) return res.status(400).json({ body: "내용은 필수입니다." });

        try {
            const subRecord = await subRepo.findOneOrFail({ where: { name: sub } });

            //  이미지 URL 배열
            const imageUrls = req.files
              ? (req.files as Express.Multer.File[]).map(f => f.filename)
              : [];
            const post = postRepo.create({
                title,
                body,
                user: res.locals.user,
                sub: subRecord,
                images: imageUrls,
            });

            await postRepo.save(post);
            return res.json(post);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "게시물 생성 중 문제가 발생했습니다." });
        }
    }



  //  댓글 조회
const getPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await postRepo.findOneOrFail({
      where: { identifier, slug },
    });

    const comments = await commentRepo.find({
      where: { post: { id: post.id } },
      relations: ["votes", "user"],
      order: { createdAt: "DESC" },
    });

    if (res.locals.user) {
      comments.forEach(c => c.setUserVote(res.locals.user));
    }

    return res.json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

  //  댓글 작성
const createPostComment = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const { body } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ body: "댓글 내용은 비워둘 수 없습니다." });
  }

  try {
    const post = await postRepo.findOneOrFail({
      where: { identifier, slug },
    });

    const comment = commentRepo.create({
      body,
      user: res.locals.user,
      post,
    });

    await commentRepo.save(comment);
    return res.json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "댓글 작성 중 문제가 발생했습니다." });
  }
};

  //  게시물 검색
const searchPosts = async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim();
  const currentPage = Number(req.query.page || 0);
  const perPage = Number(req.query.count || 8);

  if (!q) {
    return res.status(400).json({ error: "검색어가 필요합니다." });
  }

  try {
    const posts = await postRepo.find({
      where: [
        { title: ILike(`%${q}%`) },
        { body: ILike(`%${q}%`) },
      ],
      relations: [
        "sub",
        "votes",
        "comments",
        "user",
        "savedPosts",
        "savedPosts.user",
      ],
      order: { createdAt: "DESC" },
      skip: currentPage * perPage,
      take: perPage,
    });

    if (res.locals.user) {
      posts.forEach(p => {
        p.setUserVote(res.locals.user);
        p.setSaved(res.locals.user);
      });
    }

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "검색 중 문제가 발생했습니다." });
  }
};

  //  게시물 저장 / 저장해제 (토글)
const toggleSavePost = async (req: Request, res: Response) => {
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
    return res.status(500).json({ error: "저장 처리 중 오류 발생" });
  }
};

  //  저장된 게시물 전체 목록
const getSavedPosts = async (req: Request, res: Response) => {
  const user = res.locals.user;
  const currentPage = Number(req.query.page || 0);
  const perPage = Number(req.query.count || 8);

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
        "post.likes",
        "post.likes.user",
      ],
      order: {
        createdAt: "DESC",
      },
      skip: currentPage * perPage,
      take: perPage,
    });

    // SavedPost → Post만 추출
    const posts = savedPosts.map(sp => sp.post);

    // 유저 상태 세팅
    posts.forEach(p => {
      p.setUserVote(user);
      p.setSaved(user);
      p.setLiked(user);
    });

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "저장된 게시물 조회 중 오류 발생" });
  }
};


  //  게시물 삭제
const deletePost = async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const user = res.locals.user;

  try {
    const post = await postRepo.findOne({
      where: { identifier},
      relations: ["user"],
    });

    if (!post) {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }

    if (post.user.username !== user.username) {
      return res.status(403).json({ error: "삭제 권한이 없습니다." });
    }

    console.log("FOUND post:", post?.identifier);

    await postRepo.remove(post);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "게시물 삭제 중 오류 발생" });
  }
};


  //  Router
const router = Router();



router.get("/popular", userMiddleware,  getPopularPosts);
router.get("/random", userMiddleware, getRandomPost);
router.get("/search", userMiddleware, searchPosts);
router.get("/", userMiddleware, getPosts);
router.get("/:identifier/:slug", userMiddleware, getPost);
router.get("/:identifier/:slug/comments", userMiddleware, getPostComments);
router.post("/:identifier/:slug/comments", userMiddleware, authMiddleware, createPostComment);
router.post("/:identifier/:slug/save", userMiddleware, authMiddleware, toggleSavePost );
router.delete("/:identifier", userMiddleware, authMiddleware, deletePost);
router.post("/", userMiddleware, authMiddleware, upload.array("images"), createPost)
router.get("/saved", userMiddleware, authMiddleware, getSavedPosts);
export default router;
