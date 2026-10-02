import { personaByKey } from '../constants/personas';
import { SEED_POSTS } from '../constants/feedSeed';
import { PHOTOS } from '../constants/photos';
import { DemoStore } from './demoStore';

const id = (k: string) => personaByKey(k)!.profile.id;
const fresh = () => new DemoStore('2026-10-02');

describe('rede de trabalhos', () => {
  it('começa com os posts de exemplo, do mais novo para o mais antigo, e todas as fotos existem', () => {
    const s = fresh();
    const posts = s.feed.list(id('f1'));
    expect(posts).toHaveLength(SEED_POSTS.length);
    const dates = posts.map((p) => p.created_at);
    expect(dates).toEqual([...dates].sort().reverse());
    for (const p of posts) expect(PHOTOS[p.photo]).toBeTruthy();
  });

  it('curtir e salvar alternam por pessoa', () => {
    const s = fresh();
    const post = s.feed.list(id('f1'))[0];
    const before = post.likeCount;
    s.feed.toggleLike(post.id, id('f1'));
    let now = s.feed.list(id('f1')).find((p) => p.id === post.id)!;
    expect(now.liked).toBe(!post.liked);
    expect(Math.abs(now.likeCount - before)).toBe(1);
    s.feed.toggleLike(post.id, id('f1'));
    now = s.feed.list(id('f1')).find((p) => p.id === post.id)!;
    expect(now.likeCount).toBe(before);
    s.feed.toggleSave(post.id, id('f1'));
    expect(s.feed.list(id('f1'), { savedOnly: true }).map((p) => p.id)).toEqual([post.id]);
    expect(s.feed.list(id('f2'), { savedOnly: true })).toHaveLength(0);
  });

  it('comentar valida o texto e aparece na lista', () => {
    const s = fresh();
    const post = s.feed.list(id('f1'))[0];
    expect(() => s.feed.comment(post.id, id('f1'), '   ')).toThrow(/comentário/);
    expect(() => s.feed.comment(post.id, id('f1'), 'x'.repeat(201))).toThrow(/200/);
    s.feed.comment(post.id, id('f1'), 'Ficou ótimo!');
    const views = s.feed.commentViews(post.id);
    expect(views[views.length - 1]).toMatchObject({ body: 'Ficou ótimo!', authorName: 'Marina Duarte' });
  });

  it('cria post com foto e legenda e mostra primeiro; recusa post vazio', () => {
    const s = fresh();
    expect(() => s.feed.create(id('f1'), { photo: '', caption: 'oi lá' })).toThrow(/foto/);
    expect(() => s.feed.create(id('f1'), { photo: 'steadicam', caption: 'a' })).toThrow(/legenda/);
    s.feed.create(id('f1'), { photo: 'steadicam', caption: 'Novo trabalho', role: 'Diretor(a) de Fotografia', credit: ' Curta X ' });
    const top = s.feed.list(id('f1'))[0];
    expect(top).toMatchObject({ caption: 'Novo trabalho', credit: 'Curta X', mine: true });
    expect(s.feed.list(id('f2'), { authorId: id('f1') }).every((p) => p.author_id === id('f1'))).toBe(true);
  });

  it('o reset da demo devolve os posts de exemplo', () => {
    const s = fresh();
    s.feed.create(id('f1'), { photo: 'steadicam', caption: 'Novo trabalho' });
    s.reset();
    expect(s.feed.list(id('f1'))).toHaveLength(SEED_POSTS.length);
  });
});
