# 김평심 여사 칠순 기념 사진 아카이브

행사 사진 47장과 영상 7개를 모바일·데스크톱에서 볼 수 있도록 만든 정적 웹사이트입니다. 원본 폴더의 완전 중복 사진 2장은 사이트에서 한 번씩만 노출했습니다.

## 로컬에서 보기

```bash
python3 -m http.server 8080 --directory public
```

브라우저에서 `http://localhost:8080`을 엽니다.

## 사진·영상 다시 반영하기

원본 폴더의 파일이 변경되면 아래 명령을 실행합니다.

```bash
./build-assets.sh
```

## GitHub Pages 배포

기본 브랜치에 push하면 `.github/workflows/pages.yml`이 `public` 폴더를 GitHub Pages로 배포합니다.

사이트에는 가족 공유용 간이 접근 잠금이 포함되어 있습니다. 정적 사이트의 잠금이므로 서버 인증 수준의 보안을 제공하지는 않습니다.

## GitLab Pages 배포

이 폴더를 GitLab 저장소에 올리고 기본 브랜치에 push하면 `.gitlab-ci.yml`이 `public` 폴더를 Pages로 배포합니다.

```bash
git init
git add .
git commit -m "Create seventieth birthday photo archive"
git branch -M main
git remote add origin <GitLab 저장소 URL>
git push -u origin main
```
