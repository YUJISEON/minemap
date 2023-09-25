


const data = [
    {
        title : "용산역",
        address : "서울 용산구 한강대로23길 55",
        lat : '37.529902',
        lng : '126.964774'
    },
    {
        title : "서울역",
        address : "서울 용산구 한강대로 405",
        lat : '37.556133',
        lng : '126.972317'
    },
    {
        title : "강남역",
        address : "서울특별시 강남구 강남대로 396",
        lat : '37.497981',
        lng : '127.027650'
    },
    {
        title : "임학역",
        address : "인천광역시 계양구 장제로 875",
        lat : '37.545056',
        lng : '126.783643'
    }
]

let markerList = [];
let infowindowList = [];

let mapContainer = document.getElementById('map'), // 지도를 표시할 div 
mapOptions = { 
    level: 3 // 지도의 확대 레벨
};

// 지도를 표시할 div와  지도 옵션으로  지도를 생성
let map = new kakao.maps.Map(mapContainer, mapOptions); 

// 마커 이미지의 이미지 주소입니다
var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 

// 데이터를 반복문으로 돌려서 마커를 찍음
for (let i in data) {
    let target = data[i];
    let latlng = new kakao.maps.LatLng(target.lat, target.lng);

   // 마커 이미지의 이미지 크기 입니다
   let imageSize = new kakao.maps.Size(24, 35); 
    
   // 마커 이미지를 생성합니다    
   let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); 
   
   // 마커를 생성합니다
   let marker = new kakao.maps.Marker({
       map: map, // 마커를 표시할 지도
       position: latlng, // 마커를 표시할 위치
       image : markerImage // 마커 이미지 
   });

    // 생성된 마커와 인포윈도우를 배열에 담음
    markerList.push(marker);
    infowindowList.push(infowindow);
}

