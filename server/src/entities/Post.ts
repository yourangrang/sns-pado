import { Exclude, Expose } from 'class-transformer';
import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, RelationCount } from 'typeorm';
import { makeId, slugify } from '../utils/helpers';
import Comment from './Comment';
import EntityBase from './Entity'; 
import Sub from './Sub';
import User  from './User';
import Vote from './Vote';
import SavedPost from './SavedPost';
import Like from './Like';

@Entity("posts")
export default class Post extends EntityBase {
    @Index()
    @Column()
    identifier: string;

    // @Column()
    // title: string;

    @Index()
    @Column()
    slug: string;

    @Column({ nullable: true, type: "text" })
    body: string;

    @Column()
    subName: string;

    @Column()
    username: string;

    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({ name: "username", referencedColumnName: "username" })
    user: User;

    @ManyToOne(() => Sub, (sub) => sub.posts)
    @JoinColumn({ name: "subName", referencedColumnName: "name"})
    sub: Sub;


    @Exclude()
    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @Exclude()
    @OneToMany(() => Vote, (vote) => vote.post)
    votes: Vote[];

    @Exclude()
    @OneToMany(() => Like, like => like.post)
    likes: Like[];

    @RelationCount((post: Post) => post.likes)
    likeScore: number;


    // Post.ts
    @OneToMany(() => SavedPost, saved => saved.post)
    savedPosts: SavedPost[];

    @Column("text", { array: true, nullable: true })
    images: string[];

    

    @Expose()
    recentComments?: Comment[];
    
    @Expose() get url(): string {
        return `/s/${this.subName}/${this.identifier}/${this.slug}`;
    }
    
    // @Expose() get commentCount(): number {
    //     return this.comments?.length;
    // }


    @RelationCount((post: Post) => post.comments)
    commentCount: number;

    @Expose() get voteScore(): number {
        return this.votes?.reduce((memo, curt) => memo + (curt.value || 0), 0);
    }


    liked?: boolean;

    setLiked(user: User) {
    this.liked = !!this.likes?.find(
        l => l.user.username === user.username
    );
    }

    
    protected userVote: number;
    
    setUserVote(user: User) {
        const index = this.votes?.findIndex(v => v.username === user.username);
        this.userVote = index > -1 ? this.votes[index].value : 0;
    }
    
    saved?: boolean;
    
    setSaved(user: User) {
    this.saved = !!this.savedPosts?.find(
        s => s.user.id === user.id
    );
    }


    @BeforeInsert()
    makeIdAndSlug() {
        this.identifier = makeId(7);
         if (this.body) {
        this.slug = slugify(this.body.slice(0, 2)); // body 첫 20글자로 slug 생성
        } else {
            this.slug = makeId(10); 
        }
    }

    @Expose()
        get userImageUrl(): string {
        return this.user?.imageUrl;
    }

    @Expose()
    get imageUrls(): string[] {
    if (!this.images) return [];

    return this.images.map(
        img => `${process.env.APP_URL}/images/${img}`
    );
}

}
