import {expansion} from './expansion.mjs';
import {newSpecies} from './new-species.mjs';
export const content = {
 D01:{ name:'모루잎', kind:'숲용', color:'sage', description:'씨앗처럼 둥근 얼굴, 접힌 잎귀와 짧은 덩굴 꼬리의 낮잠꾸러기.',  adult:'작은 잎날개가 넓게 자랐어요. 이제 정원 그늘에서 다른 친구들을 기다려요.' },
 G01:{ name:'포루', kind:'페가수스', color:'sky', description:'물방울 앞머리와 작은 물결 날개를 가진 호기심 많은 아기 말.',  adult:'날개를 활짝 펼칠 수 있게 됐어요. 그래도 착지할 땐 조금 서툴러요.' },
 G02:{ name:'코코두', kind:'불씨 강아지', color:'clay', description:'숯빛 귀와 작은 불씨 꼬리를 가진, 사람을 잘 따르는 아기 강아지.',  adult:'불꽃처럼 포근한 목털이 자랐어요. 작은 꼬리 불빛으로 친구의 귀갓길을 밝혀요.' }
};
content.D02 = { name:'호롱', kind:'불꽃용', color:'clay', description:'두 볼을 부풀려 꼬리 끝의 불씨를 데우는 작은 용.', adult:'등에 돋은 불꽃 갈기로 길 잃은 친구에게 길을 밝혀줘요.' };
export const starters = ['G02','G01','D01'];
export const elements = { G02:'불', G01:'물', D01:'풀', D02:'불' };
export const affinity = { 불:'풀', 물:'불', 풀:'물' };
export const profiles = {
  "D01": {
    "personality": "느긋한 낮잠꾸러기",
    "likes": [
      "햇살 드는 자리",
      "바스락거리는 잎"
    ],
    "reaction": "잎날개를 살짝 펴고 손길에 기대요.",
    "adaptation": "잎날개와 가지뿔을 가진 오리지널 숲용이에요. 알에서 태어나 정원에서 자라는 설정도 창작이에요.",
    "tradition": "특정 전승의 생물을 재현한 종이 아닌 오리지널 캐릭터예요."
  },
  "G01": {
    "personality": "호기심 많은 연습생",
    "likes": [
      "부드러운 바람",
      "넓은 풀밭"
    ],
    "reaction": "작은 날갯짓으로 인사를 돌려줘요.",
    "adaptation": "푸른 갈기, 서툰 착지, 알에서 태어나 성장하는 모습은 이 정원의 창작 설정이에요.",
    "tradition": "그리스 전승의 날개 달린 말 페가수스를 모티프로 삼았어요. 아래 자료에서 원전 인용과 해설을 확인할 수 있어요."
  },
  "G02": {
    "personality": "뒤를 졸졸 따르는 햇살둥이",
    "likes": [
      "따뜻한 담요",
      "정원 입구 구경"
    ],
    "reaction": "숯빛 귀를 접고 손바닥에 코를 톡 대요.",
    "adaptation": "숯빛 귀, 불씨 꼬리, 성장하며 생기는 불꽃 목털은 이 정원의 창작 설정이에요.",
    "tradition": "특정 전승의 생물을 재현하지 않은 오리지널 불씨 강아지예요."
  }
};
profiles.D02 = {personality:'밤길을 좋아하는 호기심쟁이', likes:['따뜻한 돌','반딧불'], reaction:'볼이 발그레해지고 꼬리 불이 반짝여요.', adaptation:'세샘숲의 밤길을 밝히는 창작 캐릭터예요.', tradition:'특정 전승의 생물이 아닌 오리지널 불꽃용이에요.'};
export const sourceLinks = {G01: {id:"S08", title:"Theoi · Pegasus", url:"https://www.theoi.com/Ther/HipposPegasos.html"}};
content.N01 = {"name": "토리", "kind": "전령 다람쥐", "color": "sage", "description": "몸보다 큰 꼬리에 얼굴을 반쯤 가린다.", "adult": "꼬리의 말림이 넓어지고 볼주머니가 또렷해진다."};
profiles.N01 = {"personality": "바쁘게 준비하지만 자주 딴생각하는 친구", "likes": ["도토리", "바스락거리는 소리"], "reaction": "주머니에서 도토리를 꺼내려다 다시 넣는다.", "adaptation": "세샘숲에서 잎 편지를 나르는 설정은 창작이에요.", "tradition": "북유럽 라타토스크를 모티프로 삼았어요."};
elements.N01 = "풀";
sourceLinks.N01 = {"id": "S01", "title": "전승 참고 자료", "url": "https://www.historiskmuseum.no/english/exhibitions/midgardr/"};
content.E01 = {"name": "여울", "kind": "새벽새", "color": "sky", "description": "짧은 목과 작은 머리깃, 몸 아래 붙인 두 발.", "adult": "목이 길어지고 머리깃이 두 갈래로 드러난다."};
profiles.E01 = {"personality": "물에 비친 자신에게 매번 인사하는 친구", "likes": ["잔잔한 물", "반사된 빛"], "reaction": "머리깃을 세우고 작게 인사한다.", "adaptation": "아침마다 물결 위에 발자국을 그리는 설정은 창작이에요.", "tradition": "이집트 베누를 모티프로 삼았어요."};
elements.E01 = "물";
sourceLinks.E01 = {"id": "S02", "title": "전승 참고 자료", "url": "https://rammuseum.org.uk/wp-content/uploads/2022/05/GCUC-Ancient-Worlds-Ancient-Egypt.pdf"};

const dispositions={
 M01:'새로운 곳에서는 귀부터 내미는 호기심쟁이', M02:'누가 먼저 박자를 쳐 주길 기다리는 수줍은 악사',
 M03:'뒤처진 친구가 있으면 불을 끄지 않는 성격', M04:'누가 올라타도 속도를 맞춰 주는 느긋한 친구',
 M05:'비를 나눠 주고 나면 한동안 꾸벅꾸벅 졸아요', M06:'자기가 쉴 자리보다 남의 자리를 먼저 데워요',
 R01:'도토리를 크기순으로 놓아야 안심해요', R02:'작은 발소리도 놓치지 않는 밤의 관찰자',
 R03:'낯선 물살을 만나면 한 바퀴 돌아 살펴봐요', R04:'새잎이 돋으면 제일 먼저 친구에게 보여줘요',
 R05:'떠들썩한 날에는 조용한 굴로 손님을 초대해요', R06:'모두 집에 갈 때까지 고개를 지키는 길잡이'
};
for(const [id,name,kind,element,description,adult,like] of newSpecies){
 content[id]={name,kind,color:({불:'clay',물:'sky',풀:'sage'})[element],description,adult};
 profiles[id]={personality:dispositions[id]??expansion.find(row=>row[0]===id)?.[8],likes:[like],reaction:description,adaptation:adult,tradition:'모아몬의 오리지널 캐릭터예요.'};
 elements[id]=element;
}
