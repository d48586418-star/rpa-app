#!/usr/bin/env python3
"""Recorta clipes curtos do TAKE_010_033 (trecho longo de 'Do meu lado', 113 s) para a atividade de cross-cut.
O trecho original já alterna duas linhas (A: ela ao telefone, ao lado do altar; B: ela à mesa, com o lampião).
Os tempos vêm de detecção de corte (ffmpeg scene) + conferência visual. Uso: FFMPEG=... python3 scripts/import-take010.py <TAKE_010_033.webm>"""
import sys,os,json,subprocess,struct
ROOT=os.path.join(os.path.dirname(__file__),'..');FF=os.environ.get('FFMPEG') or 'ffmpeg';SRC=sys.argv[1]
CLIPS={'TAKE_010_033_A1':(56.8,64.8,'A','ela ao telefone, perto do altar'),'TAKE_010_033_A2':(79.9,85.9,'A','ela ao telefone, de perto'),'TAKE_010_033_A3':(92.0,99.4,'A','ela ao telefone, ouvindo'),
       'TAKE_010_033_B1':(68.6,76.6,'B','ela à mesa, com o lampião'),'TAKE_010_033_B2':(86.4,91.5,'B','ela à mesa, de perto'),'TAKE_010_033_B3':(100.1,108.1,'B','ela à mesa, de lado')}
def run(*a):subprocess.run([FF,'-v','error','-y',*a],check=True)
def peaks(f,n=31):
    p=subprocess.run([FF,'-v','error','-i',f,'-vn','-ac','1','-ar','8000','-f','s16le','-'],capture_output=True).stdout
    a=struct.unpack('<%dh'%(len(p)//2),p);k=max(1,len(a)//n);o=[max([abs(x) for x in a[i*k:(i+1)*k]] or [0]) for i in range(n)];m=max(o) or 1;return [max(4,round(100*x/m)) for x in o]
out=[]
for tid,(s,e,l,d) in CLIPS.items():
    base=f'{ROOT}/assets/takes/{tid}'
    run('-ss',str(s),'-to',str(e),'-i',SRC,'-c:v','libvpx-vp9','-crf','36','-b:v','0','-vf','scale=640:-2','-c:a','libopus','-b:a','48k',base+'.webm')
    run('-ss',str(s),'-to',str(e),'-i',SRC,'-c:v','libx264','-crf','28','-preset','veryfast','-pix_fmt','yuv420p','-vf','scale=640:-2','-c:a','aac','-b:a','64k','-movflags','+faststart',base+'.mp4')
    run('-ss',str(s+1),'-i',SRC,'-frames:v','1','-vf','scale=480:-2,eq=gamma=1.5:brightness=0.04','-q:v','4',base+'.jpg')
    out.append({'id':tid,'f':'DM','d':round(e-s,2),'s':d,'pk':peaks(base+'.webm'),'th':f'assets/takes/{tid}.jpg','vid':f'assets/takes/{tid}.webm','w':640,'h':360,'ar':'16:9','novo':True,'linha':l})
p=f'{ROOT}/data/novos-takes.json';j=json.load(open(p));j['takes']=[t for t in j['takes'] if not t['id'].startswith('TAKE_010')]+out
json.dump(j,open(p,'w'),ensure_ascii=False,indent=1);print(len(out),'clipes')
