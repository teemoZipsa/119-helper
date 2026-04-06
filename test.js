const KEY = '9029KGM7B3OJ838R';
const params = ['ctprvnNm', 'CTPRVN_NM', 'sidoNm', 'locRlgnNm', 'SIDO_NM', 'ctprvn_nm'];

async function testParam(pname) {
  const url = `https://www.safetydata.go.kr/V2/api/DSSP-IF-10166?serviceKey=${KEY}&returnType=JSON&numOfRows=10&pageNo=1&${pname}=부산광역시`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    if(text.includes('부산광역시')) console.log(`SUCCESS with ${pname}`);
    else console.log(`FAIL with ${pname}`);
  } catch(e) {
    console.log(`ERROR with ${pname}`);
  }
}

async function run() {
  for(const p of params) await testParam(p);
}
run();
