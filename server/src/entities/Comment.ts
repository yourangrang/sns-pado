import { Exclude, Expose } from "class-transformer";
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { makeId } from "../utils/helpers";
import EntityBase from './Entity';
import Post from "./Post";
import User  from "./User";
import Vote from "./Vote";

@Entity("comments")
export default class Comment extends EntityBase {
    @Index()
    @Column()
    identifier: string;

    @Column()
    body: string;

    @Column()
    username: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "username", referencedColumnName: "username" })
    user: User

    @ManyToOne(() => Post, (post) => post.comments, {
        nullable: false,
        onDelete: "CASCADE"
    })
    post: Post;
    
    @Column()
    postId: number;


    @Exclude()
    @OneToMany(() => Vote, (vote) => vote.comment)
    votes: Vote[]

    

    protected userVote: number;

    setUserVote(user: User) {
        const index = this.votes?.findIndex(v => v.username === user.username);
        this.userVote = index > -1 ? this.votes[index].value : 0;
    }

    @Expose() get voteScore(): number {
        return this.votes?.reduce((memo, v) => memo + (v.value || 0), 0);
    }

    @Expose()
get userInfo() {
  if (!this.user) return null;

  return {
    username: this.user.username,
    imageUrl: this.user.imageUrl,
  };
}


    @BeforeInsert()
    makeId() {
        this.identifier = makeId(8);
    }
}
