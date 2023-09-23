
var mapOptions = {
    zoom: 10 // 지도의 확대 레벨
};

    // 지도를 표시할 div와 지도 옵션으로  지도를 생성
var map = new naver.maps.Map('map', mapOptions);

// 마커 제목, 주소, 위도, 경도 데이터들을 배열로 담음
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
    }
]

// 몇 번째 마커를 클릭했을 때, 몇 번째 인포윈도우가 띄어지고 닫혀야 하는지 알아야 하기 때문에 배열을 2개
let markerList = [];
let infowindowList = [];

// 함수를 리턴을 해서 호출하는 이유 : 함수를 작성했을 때 해당 함수 자체가 실행되어 버리는 문제 방지하기 위함
// return 함수를 쓰지 않으면 페이지가 로드되자 마자 getClickHandler 함수가 실행 처리
const getClickHandler = (i) => () => {
    const marker = markerList[i];
    const infowindow = infowindowList[i];

    // getMap() 메소드 : 현재 오버레이가 추가된 Map 객체를 반환
    // 만약 인포윈도우가 지도 위에 표시되어 있으면,  마커를 클릭했을 때 인포윈도우가 사라짐
    if ( infowindow.getMap() ) {
        infowindow.close();
    } else {
        infowindow.open(map, marker);
    }
}

const getClickMap = (i) => () => {
    const infowindow = infowindowList[i];
    infowindow.close();
}
/*
const getClickHandler = (i) => () => { .... }

function getClickHandler(i) {
    return function() {
        ....
    }
}
*/

// 데이터를 반복문으로 돌려서 마커를 찍음
for (let i in data) {
    const target = data[i];
    const latlng = new naver.maps.LatLng(target.lat, target.lng);

    let marker = new naver.maps.Marker({
        map : map,
        position : latlng,
        // 마커 커스텀
        icon : {
            content : `<div class="marker"></div>`,
            // 중심 좌표 설정 - 마커의 너비와 높이 1/2
            anchor : new naver.maps.Point(7.5, 7.5), 
        }
    })

    // 인포윈도우
    const content = `
        <div class="infowindow-wrap">
            <div class="title">${target.title}</div>
            <div class="address">${target.address}</div>
        </div>
    `

    const infowindow = new naver.maps.InfoWindow({
        content : content,
        backgroundColor : '#00ff0000',
        borderColor : '#00ff0000',
        // 기본적으로 제공하는 것은 말풍선과 같은 꼬리표로 크기를 0으로 줄여서 보여지지 않게
        anchorSize : new naver.maps.Size(0, 0),
    })

    // 생성된 마커와 인포윈도우를 배열에 담음
    markerList.push(marker);
    infowindowList.push(infowindow);
}

// 반복문을 돌며 각각의 i번째 해당하는 마커를 클릭했을 때, getClickHandler함수 실행
for(let i=0, ii=markerList.length ; i < ii ; i++) {
    naver.maps.Event.addListener(markerList[i], 'click', getClickHandler(i))
    // 지도를 클릭했을 때 열려있는 인포윈도우 닫기
    naver.maps.Event.addListener(map, 'click', getClickMap(i))
}


