const url = 'https://api.data.go.kr/openapi/tn_pubr_public_ffus_wtrcns_api?serviceKey=189a16b141d49948bf119eeb2cb8f583b70e5be4b3d407f4cf8a5901b9283b1e&pageNo=1&numOfRows=1&type=json';
fetch(url)
  .then(res => res.text())
  .then(text => console.log(text.slice(0, 1500)))
  .catch(console.error);
