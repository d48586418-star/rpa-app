#!/usr/bin/env python3
"""Importa o pacote JORNADA_EDITOR_MEDIA (zips) para assets/takes + assets/audio e gera data/novos-takes.json.
Uso: python3 scripts/import-pack.py <pasta_com_zips_extraidos>   (originais NÃO são alterados; só copiados)"""
import sys,os,glob,json,shutil,subprocess,struct
ROOT=os.path.join(os.path.dirname(__file__),'..')
SRC=sys.argv[1]
FF=os.environ.get('FFMPEG') or 'ffmpeg'
USE={'TAKE_009':'BH','TAKE_002':'NZ','TAKE_006':'DF','TAKE_008':'LA'}
DESC={ # descrições curtas, em português, escritas a partir do que se vê nos quadros
'TAKE_009_008':'escritório, plano aberto: ele na copiadora','TAKE_009_017':'close no rosto, folha com o buraco','TAKE_009_018':'reação, atrás da copiadora','TAKE_009_019':'a mão entra no buraco','TAKE_009_021':'corredor, ele com a folha','TAKE_009_022':'máquina de venda, de costas','TAKE_009_025':'close, ele sorri','TAKE_009_027':'sombra atrás do vidro','TAKE_009_028':'ele diante do cofre','TAKE_009_040':'cofre aberto, final',
'TAKE_002_023':'menino, close','TAKE_002_024':'pipa no céu','TAKE_002_025':'rua, crianças na escada','TAKE_002_026':'campo aberto, dois meninos','TAKE_002_027':'menino pula o muro','TAKE_002_028':'terreno, três meninos','TAKE_002_029':'sacola em primeiro plano',
'TAKE_006_059':'plano aberto dos dois no carro','TAKE_006_060':'ele, com ela à direita','TAKE_006_061':'ela, com ele à esquerda','TAKE_006_063':'plano longo dos dois','TAKE_006_064':'ele e ela, sobre o ombro','TAKE_006_065':'plano dos dois, reação','TAKE_006_067':'plano médio dos dois','TAKE_006_068':'ele, close','TAKE_006_069':'plano dos dois','TAKE_006_070':'ele e ela, reação curta',
'TAKE_008_001':'um homem acende e sopra o fósforo','TAKE_008_002':'deserto ao amanhecer'}
def run(*a):return subprocess.run([FF,'-v','error','-y',*a],check=True)
def dur(f):
    o=subprocess.run([FF,'-hide_banner','-i',f],capture_output=True,text=True).stderr
    t=[l for l in o.splitlines() if 'Duration' in l][0].split('Duration:')[1].split(',')[0].strip();h,m,s=t.split(':');return round(int(h)*3600+int(m)*60+float(s),2)
def peaks(f,n=31):
    p=subprocess.run([FF,'-v','error','-i',f,'-vn','-ac','1','-ar','8000','-f','s16le','-'],capture_output=True).stdout
    if not p:return []
    a=struct.unpack('<%dh'%(len(p)//2),p);k=max(1,len(a)//n);out=[]
    for i in range(n):
        seg=a[i*k:(i+1)*k] or [0];out.append(max(abs(x) for x in seg))
    m=max(out) or 1;return [max(4,round(100*x/m)) for x in out]
takes=[]
for tk,film in USE.items():
    for mp4 in sorted(glob.glob(f'{SRC}/**/TAKES/{tk}/*.mp4',recursive=True)):
        tid=os.path.basename(mp4)[:-4];base=os.path.dirname(mp4)
        for ext in('webm','mp4'):shutil.copy(f'{base}/{tid}.{ext}',f'{ROOT}/assets/takes/{tid}.{ext}')
        shutil.copy(f'{base}/{tid}_thumb.jpg',f'{ROOT}/assets/takes/{tid}.jpg')
        from_w=subprocess.run([FF,'-hide_banner','-i',mp4],capture_output=True,text=True).stderr
        import re;m=re.search(r'(\d{3,4})x(\d{3,4})',from_w);w,h=int(m.group(1)),int(m.group(2))
        takes.append({'id':tid,'f':film,'d':dur(mp4),'s':DESC.get(tid,''),'pk':peaks(mp4),'th':f'assets/takes/{tid}.jpg','vid':f'assets/takes/{tid}.webm','w':w,'h':h,'ar':'16:9','novo':True})
audios=[]
for ogg in sorted(glob.glob(f'{SRC}/**/AUDIO/*.ogg',recursive=True)):
    n=os.path.basename(ogg)[:-4];shutil.copy(ogg,f'{ROOT}/assets/audio/{n}.ogg')
    run('-i',ogg,'-c:a','aac','-b:a','96k',f'{ROOT}/assets/audio/{n}.m4a')   # fallback Safari
    audios.append({'id':n,'d':dur(ogg),'pk':peaks(ogg),'ogg':f'assets/audio/{n}.ogg','m4a':f'assets/audio/{n}.m4a'})
json.dump({'takes':takes,'audios':audios},open(f'{ROOT}/data/novos-takes.json','w'),ensure_ascii=False,indent=1)
print(len(takes),'takes',len(audios),'áudios')
