# 이미지 생성 기록

방식: 내장 `image_gen` (CLI/API 키 사용 없음). 생성 PNG 원본은 `art-source/`, 최종 게임 WebP는 `public/img/`에 보관했습니다. 투명도 유지, 아틀라스 셀 분리, WebP 압축은 배포 패키징 과정입니다. 수정/재패키징: `node scripts/prepare-assets.mjs`.

## 1. 꽃공원 (`park.webp`)

> Use case: illustration-story. Create a premium mobile casual game background, portrait 2:3 aspect ratio. An enchanting Korean storybook flower park, lush oversized pink cosmos, coral peonies, creamy daisies, lavender hydrangeas and yellow blossoms. Soft mint green lawn winding through center, tiny white picket fence in distance, cherry blossom branches framing top corners, warm cream sky. Rich hand-painted gouache with subtle paper texture, soft warm sunlight, rounded charming shapes, exquisite detailed layered flowers. Flowers occupy lower two thirds yet leave nine small green clearings naturally arranged in 3 columns x 3 rows where characters will pop up. No characters, no text, no UI, no watermark. Beautiful polished illustration, inviting romantic spring afternoon. Full bleed.

## 2. 캐릭터 아틀라스 (`eppy.webp`, `dange.webp`, `flower.webp`, `cry.webp`)

참고 이미지: `source/dange.jpg`, `source/eppy.jpg`. 투명 배경 요청.

> Use case: illustration-story. Production game sprite atlas on TRUE TRANSPARENT background. Reference 1 is Dange man black glasses short brown parted hair light gray hoodie brown polo navy trousers. Reference 2 is Eppy woman long wavy dark brown hair pearl earrings rust red cardigan floral blouse beige trousers. Preserve their recognizable chibi identities and thick warm brown outlines, enrich with lovely soft gouache shading. Exactly SIX separate illustrations arranged in perfectly regular 3 columns by 2 rows grid on square canvas; each asset contained within its cell with generous transparent padding, no overlap, NO text. Top left: Eppy's large smiling head and shoulders front view for pop-up target. Top center: Dange full body joyfully running toward right with puckered kissing lips. Top right: a big gorgeous pink cosmos flower with yellow center and green leaves, front view, similar size to Eppy face. Bottom left: couple standing together, Dange on left giving Eppy a sweet cheek kiss, Eppy blushing happily. Bottom center: Eppy on right leaning over kissing delighted Dange on left on cheek, many tiny pink hearts, full body cute romantic celebration. Bottom right: Dange lying on his back with legs up and hands waving, comically whining crying with big blue tears, adorable not distressed. Each cell centered independent sticker. Transparent background essential, no checkerboard.

아틀라스의 커플 두 셀은 일부 가장자리가 잘려 개별 생성본으로 교체했습니다.

## 3. 제목 (`title.webp`)

참고 이미지: `source/letter.jpg`. 투명 배경 요청.

> Use case: logo-brand. Transparent title lettering for a lovely Korean casual mobile flower park game. Match the reference chunky rounded hand-drawn Korean red lettering with thick warm ivory outline and very subtle brown shadow, playful irregular baseline. EXACT Korean text in two centered lines: first smaller line "이삐댕이의", second larger line "뽀뽀공원". Add only two tiny pink hearts and a small cream daisy as accents. Very readable, premium cute hand-painted lettering, coral strawberry red and rosy pink. Wide landscape composition, no background, true transparency. No other text.

## 4. 댕이의 뽀뽀 (`kiss.webp`, 최종)

참고 이미지: 원본 댕이·이삐. 투명 배경 요청.

> Use case: illustration-story. ONE isolated full-body chibi couple sticker with true transparent background. Reference 1 man Dange wears black glasses, parted brown hair, light gray hoodie, brown polo, navy pants. Reference 2 woman Eppy has wavy long brown hair, pearl earrings, rust red cardigan, floral blouse, beige trousers. Preserve their identity. Dange on LEFT leans in to give smiling blushing Eppy on RIGHT a sweet cheek kiss, both full bodies visible. Three little pink hearts above. Beautiful soft gouache shading and thick warm dark brown outlines matching references. All hair, hands, feet and hearts completely contained with wide 12 percent transparent margin around ENTIRE illustration, nothing cropped, no text, no other objects. Premium cute mobile game artwork.

## 5. 이삐의 뽀뽀 세례 (`celebrate.webp`, 최종)

참고 이미지: 원본 댕이·이삐. 투명 배경 요청.

> Use case: illustration-story. ONE isolated full-body chibi couple sticker with true transparent background for a round-clear animation. Reference 1 man Dange wears black glasses, parted brown hair, light gray hoodie, brown polo, navy pants. Reference 2 woman Eppy has wavy long brown hair, pearl earrings, rust red cardigan, floral blouse, beige trousers. Preserve their identity. Eppy on RIGHT enthusiastically leans over and repeatedly kisses delighted Dange on LEFT on his cheek. Dange blushes with eyes closed and little pink lipstick kisses on his face, hands clasped happily. Eppy holds his shoulder, one foot kicked up. Cluster of tiny pink hearts above. Full bodies visible. Beautiful soft gouache shading and thick warm dark brown outlines matching references. All hair, hands, feet and hearts completely contained with wide 12 percent transparent margin around ENTIRE illustration, nothing cropped, no text, no other objects. Premium cute mobile game artwork.

## 연출

Phaser로 달려오기→뽀뽀 전환, 하트 상승, 꽃 흔들림, 꽃잎 낙하를 구성했습니다. 성공 화면은 키스 일러스트의 리듬 모션과 하트 세례, 실패 화면은 누운 댕이의 몸 떨기와 흔들림을 반복합니다. 실제 영상 생성물이 아닌 생성 일러스트 기반의 실시간 모션그래픽입니다.
