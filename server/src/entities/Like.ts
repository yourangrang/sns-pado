import { Entity, ManyToOne, JoinColumn, Unique, Column } from "typeorm";
import EntityBase from "./Entity";
import User from "./User";
import Post from "./Post";

@Entity("likes")
@Unique(["username", "postId"]) 
export default class Like extends EntityBase {

  @Column()
  username: string;

  @Column()
  postId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Post, post => post.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" }) 
  post: Post;
}