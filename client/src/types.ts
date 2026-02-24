export interface User {
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Sub {
  createdAt: string;
  updatedAt: string;
  name: string;
  title: string;
  description: string;
  imageUrn: string;
  bannerUrn: string;
  username: string;
  posts: Post[];
  postCount?: string;

  imageUrl: string;
  bannerUrl: string;
}



export interface Post {
  identifier: string;
  slug: string;
  title: string;
  body: string;
  subName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  sub?: Sub;

  url: string;
  userImageUrl?: string;
  userVote?: number;
  voteScore?: number;
  commentCount?: number;
  saved?: boolean;
  images?: string[];
  imageUrls: string[];
  recentComments: RecentComment[];
  likeScore: number;
  liked?: boolean;
  likeCount?: number;
  likesCount?: number;

}

export interface Comment {
  identifier: string;
  body: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  post?: Post;

  userVote: number;
  voteScore: number;
  userInfo: PublicUser;
  imageUrl: any;
}

type PublicUser = {
  username: string;
  imageUrl: string;
};

type RecentComment = {
  id: number;
  body: string;
  createdAt: string;
  userInfo: PublicUser;
  identifier: string;
};
