#!/usr/bin/env python3
"""Recorta os 8 takes CD_BH_01–08 (atividade "Sem efeito nenhum", corte direto) do curta "The Black Hole" (Phil & Olly).
Os tempos vêm de detecção de corte (ffmpeg scene > 0,18) + conferência visual de uma folha de contatos; as durações são as de data/novos-takes.json.
Gera .webm (VP9+Opus, 640 px), .mp4 (H.264+AAC, fallback Safari/iOS) e .jpg (quadro de capa) em assets/takes/.
Uso: FFMPEG=ffmpeg python3 scripts/import-cd-bh.py <filme.mp4>"""
import sys,os,subprocess
ROOT=os.path.join(os.path.dirname(__file__),'..');FF=os.environ.get('FFMPEG') or 'ffmpeg';SRC=sys.argv[1]
CLIPS={'CD_BH_01':(19.60,2.05),'CD_BH_02':(41.90,3.80),'CD_BH_03':(50.20,4.60),'CD_BH_04':(61.30,3.70),
       'CD_BH_05':(70.10,3.30),'CD_BH_06':(76.70,2.70),'CD_BH_07':(46.70,2.55),'CD_BH_08':(104.10,1.50)}
def run(*a):subprocess.run([FF,'-v','error','-y',*a],check=True)
for tid,(s,d) in CLIPS.items():
    base=f'{ROOT}/assets/takes/{tid}'
    run('-ss',str(s),'-t',str(d),'-i',SRC,'-c:v','libvpx-vp9','-crf','36','-b:v','0','-vf','scale=640:-2','-c:a','libopus','-b:a','48k',base+'.webm')
    run('-ss',str(s),'-t',str(d),'-i',SRC,'-c:v','libx264','-crf','28','-preset','veryfast','-pix_fmt','yuv420p','-vf','scale=640:-2','-c:a','aac','-b:a','64k','-movflags','+faststart',base+'.mp4')
    run('-ss',str(s+min(1.0,d/2)),'-i',SRC,'-frames:v','1','-vf','scale=480:-2,eq=gamma=1.4:brightness=0.03','-q:v','4',base+'.jpg')
    print(tid,'ok')
