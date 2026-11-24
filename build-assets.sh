#!/bin/zsh
set -euo pipefail

SOURCE_DIR="/Users/katemyeong/Desktop/김평심여사_칠순기념/행사사진"
PROJECT_DIR="/Users/katemyeong/Desktop/김평심여사_칠순기념/행사사진_아카이브_웹사이트"
PUBLIC_DIR="$PROJECT_DIR/public"

mkdir -p "$PUBLIC_DIR/assets/photos" "$PUBLIC_DIR/assets/thumbs" "$PUBLIC_DIR/assets/videos" "$PUBLIC_DIR/assets/posters" "$PUBLIC_DIR/assets/downloads"

rm -f "$PUBLIC_DIR/assets/photos/"*.jpg(N) "$PUBLIC_DIR/assets/thumbs/"*.jpg(N) "$PUBLIC_DIR/assets/videos/"*.mp4(N) "$PUBLIC_DIR/assets/posters/"*.jpg(N)
rm -f "$PUBLIC_DIR/assets/downloads/"*.zip(N)

typeset -A seen_hashes
photo_index=0

for source_file in "$SOURCE_DIR"/*.JPG; do
  file_hash=$(shasum -a 256 "$source_file" | awk '{print $1}')
  if [[ -n "${seen_hashes[$file_hash]:-}" ]]; then
    continue
  fi

  seen_hashes[$file_hash]=1
  photo_index=$((photo_index + 1))
  photo_name=$(printf "photo-%02d.jpg" "$photo_index")
  cp "$source_file" "$PUBLIC_DIR/assets/photos/$photo_name"
  cp "$source_file" "$PUBLIC_DIR/assets/thumbs/$photo_name"
  sips -Z 720 "$PUBLIC_DIR/assets/thumbs/$photo_name" >/dev/null
done

video_index=0
for source_file in "$SOURCE_DIR"/*.MP4; do
  video_index=$((video_index + 1))
  video_name=$(printf "video-%02d.mp4" "$video_index")
  poster_name=$(printf "video-%02d.jpg" "$video_index")
  cp "$source_file" "$PUBLIC_DIR/assets/videos/$video_name"
  ffmpeg -hide_banner -loglevel error -ss 2 -i "$source_file" -frames:v 1 -vf "scale=1280:-2" -q:v 3 -y "$PUBLIC_DIR/assets/posters/$poster_name"
done

ffmpeg -hide_banner -loglevel error -i "$PUBLIC_DIR/assets/videos/video-05.mp4" \
  -filter_complex "[0:v]trim=start=0:end=20,setpts=PTS-STARTPTS[v0];[0:a]atrim=start=0:end=20,asetpts=PTS-STARTPTS[a0];[0:v]trim=start=31:end=81,setpts=PTS-STARTPTS[v1];[0:a]atrim=start=31:end=81,asetpts=PTS-STARTPTS[a1];[0:v]trim=start=108:end=144.7,setpts=PTS-STARTPTS[v2];[0:a]atrim=start=108:end=144.7,asetpts=PTS-STARTPTS[a2];[v0][v1]xfade=transition=fade:duration=0.4:offset=19.6[v01];[a0][a1]acrossfade=d=0.4[a01];[v01][v2]xfade=transition=fade:duration=0.6:offset=69.0[v];[a01][a2]acrossfade=d=0.6[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -b:v 2100k -maxrate 2600k -bufsize 5200k \
  -c:a aac -b:a 128k -movflags +faststart -y "$PUBLIC_DIR/assets/videos/moneybox-cake-highlight.mp4"

ffmpeg -hide_banner -loglevel error -ss 58 -i "$PUBLIC_DIR/assets/videos/moneybox-cake-highlight.mp4" \
  -frames:v 1 -q:v 3 -y "$PUBLIC_DIR/assets/posters/moneybox-cake-highlight.jpg"

ditto -c -k --keepParent "$PUBLIC_DIR/assets/photos" "$PUBLIC_DIR/assets/downloads/kim-pyeongsim-70th-photos.zip"

echo "사진 ${photo_index}장, 영상 ${video_index}개 준비 완료"
