import { IsEmail, Length } from "class-validator";
import {
  Entity,
  Column,
  Index,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import bcrypt from "bcryptjs";
import Post from "./Post";
import Vote from "./Vote";
import EntityBase from "./Entity";
import SavedPost from "./SavedPost";
import { Exclude } from "class-transformer";
import Like from "./Like";

@Entity("users")
export default class User extends EntityBase {
   //   Email
  @Index()
  @IsEmail(undefined, { message: "이메일 주소가 잘못되었습니다." })
  @Length(1, 255, { message: "이메일 주소는 비워둘 수 없습니다." })
  @Column({ unique: true })
  email: string;

   //   Username
  @Index()
  @Length(3, 32, { message: "사용자 이름은 3자 이상이어야 합니다." })
  @Column({ unique: true })
  username: string;

     Password
  @Exclude()
  @Column()
  @Length(6, 255, { message: "비밀번호는 6자리 이상이어야 합니다." })
  password: string;

   //   Profile Image
  @Column({ nullable: true })
  imageUrn: string;

   //   Relations
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

   @OneToMany(() => Like, like => like.user)
   likes: Like[];


  // User.ts
  @OneToMany(() => SavedPost, saved => saved.user)
  savedPosts: SavedPost[];




  
   //   Hooks
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }

  
  get imageUrl(): string {
    return this.imageUrn
      ? `${process.env.APP_URL}/images/${this.imageUrn}`
      : "https://www.gravatar.com/avatar?d=mp&f=y";
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      imageUrn: this.imageUrn,
      imageUrl: this.imageUrl, // getter 포함
      createdAt: this.createdAt,
    };
  }
}
