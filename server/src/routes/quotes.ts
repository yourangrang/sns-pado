import { Router, Request, Response } from "express";

const router = Router();

// 명언 배열
const quotes = [
  { text: "앞서 나가는 비결은 시작하는 것이다.", author: "마크 트웨인" },
  { text: "당신이 가장 많이 생각하는 것이 당신을 만든다.", author: "노먼 빈센트 필" },
  { text: "행동은 두려움을 몰아낸다.", author: "데일 카네기" },
  { text: "생각이 바뀌면 인생이 바뀐다.", author: "윌리엄 제임스" },
  { text: "자신을 믿어라. 이미 절반은 성공했다.", author: "시어도어 루스벨트" },
  { text: "불가능은 시도하지 않는 자의 변명이다.", author: "나폴레옹 보나파르트" },
  { text: "실패는 성공으로 가는 과정이다.", author: "토머스 에디슨" },
  { text: "성공은 작은 노력의 반복이다.", author: "로버트 콜리어" },
  { text: "고통 없이는 성장도 없다.", author: "프레드릭 더글러스" },
  { text: "기회는 준비된 사람에게 온다.", author: "루이 파스퇴르" },
  { text: "두려움은 생각에서 시작된다.", author: "세네카" },
  { text: "위대한 일은 작은 일의 축적이다.", author: "빈센트 반 고흐" },
  { text: "변화하지 않으면 성장도 없다.", author: "존 맥스웰" },
  { text: "인내는 모든 능력의 뿌리다.", author: "랄프 왈도 에머슨" },
  { text: "스스로를 제한하지 마라.", author: "토니 로빈스" },
  { text: "용기는 두려움이 없는 것이 아니라 극복하는 것이다.", author: "넬슨 만델라" },
  { text: "삶은 당신의 태도에 달려 있다.", author: "찰스 스윈돌" },
  { text: "작은 성공이 큰 자신감을 만든다.", author: "브라이언 트레이시" },
  { text: "생각이 행동을 만들고 행동이 습관을 만든다.", author: "아리스토텔레스" },
  { text: "멈추지 않는 한 얼마나 느린지는 중요하지 않다.", author: "공자" },
  { text: "성공의 비밀은 끈기다.", author: "벤저민 디즈레일리" },
  { text: "스스로를 존중하는 것이 모든 시작이다.", author: "미셸 드 몽테뉴" },
  { text: "긍정은 강력한 힘이다.", author: "노먼 빈센트 필" },
  { text: "실패를 두려워하지 말고 정체를 두려워하라.", author: "존 F. 케네디" },
  { text: "시작이 반이다.", author: "아리스토텔레스" },
  { text: "성공은 용기의 또 다른 이름이다.", author: "윈스턴 처칠" },
  { text: "자신에게 솔직해져라.", author: "소크라테스" },
  { text: "배움은 평생의 무기다.", author: "헨리 포드" },
  { text: "집중은 재능을 뛰어넘는다.", author: "스티브 잡스" },
  { text: "스스로에게 기대하라.", author: "마이클 조던" },
  { text: "성공은 우연이 아니다.", author: "펠레" },
  { text: "지금 이 순간이 가장 중요하다.", author: "에크하르트 톨레" },
  { text: "마음을 다스리면 인생이 편해진다.", author: "붓다" },
  { text: "실패는 배움의 다른 이름이다.", author: "존 듀이" },
  { text: "행동이 변화를 만든다.", author: "마하트마 간디" },
  { text: "오늘의 선택이 내일의 삶을 만든다.", author: "스티븐 코비" },
  { text: "목표 없는 노력은 방향 없는 항해다.", author: "피터 드러커" },
  { text: "성공은 준비와 기회의 만남이다.", author: "오프라 윈프리" },
  { text: "자신을 정복하는 것이 가장 큰 승리다.", author: "플라톤" },
  { text: "노력은 재능을 이긴다.", author: "요한 볼프강 폰 괴테" },
  { text: "한계를 넘는 순간 성장이 시작된다.", author: "알버트 아인슈타인" },
  { text: "위기는 기회의 또 다른 이름이다.", author: "존 D. 록펠러" },
  { text: "꿈은 행동할 때 현실이 된다.", author: "파울로 코엘료" },
  { text: "성공은 매일 반복한 작은 습관이다.", author: "제임스 클리어" },
  { text: "자신을 바꾸면 세상이 바뀐다.", author: "레프 톨스토이" },
  { text: "위대한 성취는 위대한 결단에서 시작된다.", author: "알렉산더 그레이엄 벨" },
  { text: "생각하지 말고 행동하라.", author: "리처드 브랜슨" },
  { text: "가장 큰 위험은 아무 위험도 감수하지 않는 것이다.", author: "마크 저커버그" },
  { text: "오늘을 사는 것이 최고의 준비다.", author: "벤저민 프랭클린" }
];


router.get("/today", (_req: Request, res: Response) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  res.json({ quote });
});

export default router;
