import { personaByKey } from '../constants/personas';
import { SEED_POSTS } from '../constants/feedSeed';
import { addDays } from './dates';
import type { Comment, Post, Profile } from './types';

type Ctx = { profiles: Map<string, Profile>; today: () => string };

export type PostView = Post & {
  authorName: string; authorRole: string | null; authorPhoto: string | null;
  liked: boolean; saved: boolean; likeCount: number; mine: boolean;
};
export type NewPost = { photo: string; caption: string; role?: string | null; credit?: string | null };

const fail = (msg: string): never => { throw new Error(msg); };
const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

/** Rede de trabalhos da demo: posts com foto, curtir, salvar e comentar. */
export class FeedModule {
  private posts: Post[] = [];
  private seq = 0;
  /** Ordem de criação: desempata posts do mesmo dia (o mais novo vem primeiro). */
  private order = new Map<string, number>();

  constructor(private ctx: Ctx) {}

  reset() {
    this.posts = [];
    this.order.clear();
    this.seq = 0;
    const today = this.ctx.today();
    for (const [i, sp] of SEED_POSTS.entries()) {
      const author = personaByKey(sp.author)!;
      this.posts.push({
        id: `post-${++this.seq}`, author_id: author.profile.id, photo: sp.photo, caption: sp.caption,
        role: sp.role, credit: sp.credit, created_at: addDays(today, -sp.daysAgo),
        likes: sp.likedBy.map((k) => personaByKey(k)!.profile.id), saves: [],
        comments: sp.comments.map((c, ci) => ({
          id: `c-${this.seq}-${ci}`, author_id: personaByKey(c.author)!.profile.id, body: c.body, created_at: addDays(today, -sp.daysAgo),
        })),
      });
      this.order.set(`post-${this.seq}`, SEED_POSTS.length - i);
    }
  }

  resetUser(id: string) {
    this.posts = this.posts.filter((p) => p.author_id !== id);
    for (const p of this.posts) {
      p.likes = p.likes.filter((x) => x !== id);
      p.saves = p.saves.filter((x) => x !== id);
      p.comments = p.comments.filter((c) => c.author_id !== id);
    }
  }

  private post(id: string): Post {
    return this.posts.find((p) => p.id === id) ?? fail('Post não encontrado.');
  }

  private view(p: Post, me: string): PostView {
    const a = this.ctx.profiles.get(p.author_id);
    return {
      ...p, authorName: a?.name ?? 'Alguém', authorRole: a?.roles[0] ?? (a?.account_type === 'empresa' ? 'Empresa' : null),
      authorPhoto: a?.avatar_url ?? null,
      liked: p.likes.includes(me), saved: p.saves.includes(me), likeCount: p.likes.length, mine: p.author_id === me,
    };
  }

  /** Mais novos primeiro; no mesmo dia, o criado por último vem antes. */
  list(me: string, opts: { authorId?: string; savedOnly?: boolean } = {}): PostView[] {
    return this.posts
      .filter((p) => (!opts.authorId || p.author_id === opts.authorId) && (!opts.savedOnly || p.saves.includes(me)))
      .map((p) => this.view(p, me))
      .sort((a, b) => b.created_at.localeCompare(a.created_at) || (this.order.get(b.id) ?? 0) - (this.order.get(a.id) ?? 0));
  }

  create(me: string, input: NewPost): Post {
    const caption = input.caption.trim();
    if (!input.photo) fail('Escolha uma foto do trabalho.');
    if (caption.length < 3) fail('Escreva uma legenda curta.');
    if (caption.length > 280) fail('A legenda pode ter até 280 caracteres.');
    const post: Post = {
      id: `post-${++this.seq}-${this.posts.length}`, author_id: me, photo: input.photo, caption,
      role: input.role ?? null, credit: input.credit?.trim() || null, created_at: this.ctx.today(), likes: [], saves: [], comments: [],
    };
    this.posts.unshift(post);
    this.order.set(post.id, ++this.seq + 1000);
    return post;
  }

  toggleLike(id: string, me: string) {
    const p = this.post(id);
    p.likes = toggle(p.likes, me);
  }

  toggleSave(id: string, me: string) {
    const p = this.post(id);
    p.saves = toggle(p.saves, me);
  }

  comment(id: string, me: string, body: string): Comment {
    const text = body.trim();
    if (!text) fail('Escreva um comentário.');
    if (text.length > 200) fail('O comentário pode ter até 200 caracteres.');
    const p = this.post(id);
    const c: Comment = { id: `c-${p.id}-${p.comments.length + 1}`, author_id: me, body: text, created_at: this.ctx.today() };
    p.comments.push(c);
    return c;
  }

  commentViews(id: string): (Comment & { authorName: string })[] {
    return this.post(id).comments.map((c) => ({ ...c, authorName: this.ctx.profiles.get(c.author_id)?.name ?? 'Alguém' }));
  }
}
