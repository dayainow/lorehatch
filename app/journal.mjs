import {expansion} from './expansion.mjs';
import {IDS,habitatOf} from './domain.mjs';
import {pairs,friendship} from './fieldnotes.mjs';
// Original, low-pressure encounters. No currency, timer or penalty for another try.
export const encounters={
 D01:['모루잎이 잎날개를 접고 빈터를 둘러봐요. 어디에 앉을까요?',['햇살 드는 돌','깊은 물웅덩이','바람 센 꼭대기'],0,'햇살 한 조각','햇빛을 받은 잎날개 아래, 당신 몫의 그늘도 생겼어요.'],
 G01:['포루가 샘물을 나르다가 착지할 곳을 찾아요. 무엇을 준비할까요?',['높은 울타리','평평한 착지 자리','흔들리는 가지'],1,'첫 착지','한 방울도 흘리지 않은 포루가 발굽을 톡 부딪쳤어요.'],
 G02:['코코두가 숯빛 귀를 쫑긋하고 다가와요. 어떻게 인사할까요?',['꼬리를 잡아당기기','멀리서 소리치기','손바닥을 조용히 내밀기'],2,'따뜻한 코 인사','작은 코가 손바닥에 톡. 꼬리의 불씨가 반갑게 반짝였어요.'],
 D02:['호롱이 작은 불빛으로 놀고 싶어 해요. 무엇을 해볼까요?',['손으로 그림자 만들기','물을 끼얹기','불씨를 멀리 던지기'],0,'손안의 별','꼬리 불빛에 비친 손그림자가 작은 새처럼 날았어요.'],
 N01:['토리의 잎 편지가 자꾸 펼쳐져요. 어떻게 도울까요?',['물에 적시기','반으로 접어 주기','돌 밑에 숨기기'],1,'한 장의 편지','토리가 접힌 편지를 품고 수신인 쪽으로 달려갔어요.'],
 E01:['여울이 잔잔한 물을 바라봐요. 함께 볼 것은 무엇일까요?',['연기','모래 먼지','조약돌이 만든 물결'],2,'동그란 물길','작은 동그라미가 큰 동그라미를 만나 멀리 번졌어요.'],
 M01:['보리의 귀 사이에 씨앗이 걸렸어요. 어디에서 털어 줄까요?',['빈 둔덕','깊은 동굴','흐르는 급류'],0,'씨앗 자리','보리가 귀를 기울이자 새 갈대밭의 첫 씨앗이 내려앉았어요.'],
 M02:['방울이 짧은 합주를 시작해요. 어떤 소리로 답할까요?',['큰 고함','손끝의 빗소리','돌 깨는 소리'],1,'빗방울 합주','톡, 또독. 방울이 당신의 리듬에 한 음을 얹었어요.'],
 M03:['초롱의 작은 빛을 잘 보고 싶어요. 어떻게 할까요?',['더 밝은 불 켜기','날개 붙잡기','손그늘 만들어 주기'],2,'작은 등불','그늘 속 두 등불이 나란히 켜졌어요.'],
 M04:['마름이 물가로 갈 준비를 해요. 무엇부터 도울까요?',['등의 연잎 닦기','등에 돌 쌓기','물길 막기'],0,'깨끗한 나루','반짝이는 잎 위로 첫 손님을 위한 자리가 생겼어요.'],
 M05:['소라의 구름 껍데기가 가벼워졌어요. 무엇을 건넬까요?',['마른 모래','이슬 한 방울','뜨거운 숯'],1,'구름의 선물','작은 구름이 받은 이슬을 고운 비로 나눠 줬어요.'],
 M06:['노을이 물가에 놓을 돌을 골라요. 어떤 돌이 좋을까요?',['뾰족한 돌','너무 무거운 바위','납작한 돌'],2,'따뜻한 징검돌','노을의 배 아래에서 데워진 돌이 차가운 발을 기다려요.'],
 R01:['두리가 겨울에 쓸 씨앗을 모아요. 무엇을 맡길까요?',['마른 솔씨','녹은 얼음','젖은 진흙'],0,'겨울의 몫','가시 사이 솔씨가 작은 창고처럼 가지런해졌어요.'],
 R02:['아롱의 눈썹에 서리가 앉았어요. 어떻게 할까요?',['깃을 세게 당기기','서리를 살살 털기','눈을 가리기'],1,'맑은 눈','아롱이 눈을 크게 뜨고 멀리 있는 길을 찾았어요.'],
 R03:['단비가 샘 위에서 원을 돌아요. 어떻게 인사할까요?',['물가를 쿵쿵 치기','급히 붙잡기','물 위로 손길 그리기'],2,'물 위의 인사','단비가 손길을 따라 잔잔한 길을 냈어요.'],
 R04:['누리가 뿔의 새잎을 보여 줘요. 어떻게 살펴볼까요?',['가까이서 조심히 보기','잎을 모두 따기','가지를 꺾기'],0,'두 번째 새잎','누리가 고개를 돌리자 숨겨진 작은 잎이 하나 더 보였어요.'],
 R05:['도톨의 굴 입구에 모래가 쌓였어요. 무엇을 할까요?',['입구 막기','모래를 평평하게 고르기','굴에 물 붓기'],1,'돌아오는 길','도톨이 고른 길을 따라 마른 잎을 굴로 가져갔어요.'],
 R06:['해솔이 쉬기 전에 꼬리를 정리해요. 어떻게 도울까요?',['꼬리 잡아당기기','찬 진흙 묻히기','꼬리 끝 빗어 주기'],2,'햇살 담요','해솔이 가지런한 꼬리를 둘러 작은 담요를 만들었어요.']
};
for(const [i,row] of expansion.entries()){
 const choices=['큰 소리로 재촉하기','멀리 치워 두기'];const correct=i%3;choices.splice(correct,0,row[14]);
 encounters[row[0]]=[row[13],choices,correct,row[15],row[16]];
}
export function rememberEncounter(state,id,choice){
 if(!state.pets.some(p=>p.id===id)||encounters[id]?.[2]!==choice||(state.memories??[]).includes(id))return state;
 return {...state,memories:[...(state.memories??[]),id]};
}
export function visitorFor(state,day){
 const ids=IDS.filter(id=>state.pets.some(p=>p.id===id));
 if(!ids.length)return null;
 const n=[...day].reduce((sum,c)=>sum+c.charCodeAt(0),0);
 return ids[n%ids.length];
}
export function milestones(state){
 const adults=state.pets.filter(p=>p.stage==='adult'),stories=pairs.filter(([a])=>friendship(a,state.pets).complete).length;
 const care=state.pets.filter(p=>p.care?.length).length;
 return [
 ['first','첫 만남','알에서 첫 친구 만나기',state.pets.length,1,'01'],
 ['care','다정한 손길','서로 다른 친구 세 종 돌보기',care,3,'02'],
 ['grown','한 뼘 더','첫 친구 성장시키기',adults.length,1,'03'],
 ['memory','작은 추억','추억 카드 세 장 모으기',(state.memories??[]).length,3,'04'],
 ['story','둘이라서','친구 이야기 한 편 완성하기',stories,1,'05'],
 ['forest','숲의 식구','세샘숲 여섯 친구 성장시키기',adults.filter(p=>habitatOf(p.id)===0).length,6,'06'],
 ['marsh','늪의 식구','갈대늪 여섯 친구 성장시키기',adults.filter(p=>habitatOf(p.id)===1).length,6,'07'],
 ['ridge','고개의 식구','별빛고개 여섯 친구 성장시키기',adults.filter(p=>habitatOf(p.id)===2).length,6,'08'],
 ['shore','해변의 식구','조개해변 여섯 친구 성장시키기',adults.filter(p=>habitatOf(p.id)===3).length,6,'11'],
 ['meadow','들판의 식구','꽃바람들판 여섯 친구 성장시키기',adults.filter(p=>habitatOf(p.id)===4).length,6,'12'],
 ['album','추억 한 권','모든 친구의 추억 카드 모으기',(state.memories??[]).length,IDS.length,'09'],
 ['together','함께 사는 정원','모든 친구 이야기 완성하기',stories,pairs.length,'10']
 ].map(([id,title,description,value,target,number])=>({id,title,description,value:Math.min(value,target),target,number,complete:value>=target}));
}
