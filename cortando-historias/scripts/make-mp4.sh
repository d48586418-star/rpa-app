#!/usr/bin/env bash
# Gera .mp4 (H.264, yuv420p, sem áudio) ao lado de cada .webm — fallback para Safari/iOS. Uso: FFMPEG=ffmpeg scripts/make-mp4.sh
set -e
FF="${FFMPEG:-ffmpeg}"; cd "$(dirname "$0")/../assets/video"
for f in *.webm; do
  o="${f%.webm}.mp4"; [ -f "$o" ] && [ "$o" -nt "$f" ] && continue
  "$FF" -v error -y -i "$f" -an -c:v libx264 -profile:v main -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -g 12 -crf 23 -movflags +faststart "$o"
done
echo "mp4: $(ls *.mp4 | wc -l) arquivos"
