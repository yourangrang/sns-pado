import {
  Entity,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from "typeorm";
import User from "./User";
import Post from "./Post";

@Entity("saved_posts")
@Unique(["user", "post"])
export default class SavedPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.savedPosts, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Post, post => post.savedPosts, { onDelete: "CASCADE" })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}
