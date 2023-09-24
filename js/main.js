

// 데이터를 가져오는 ajax
/*
$.ajax({
    url : '/location',
    type : "GET",
}).done((response)=>{
    if( response.message !== 'success') return;
    console.log("데이터 요청 성공");
    const data = response.data;

    // 데이터를 불러와서 메인 페이지에 지도를 만드는 코드 작성
    // ....
}).fail((error)=>{
    console.log("데이터 요청 실패");
})
*/

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

var mapOptions = {
    zoom: 10 // 지도의 확대 레벨
};

    // 지도를 표시할 div와 지도 옵션으로  지도를 생성
var map = new naver.maps.Map('map', mapOptions);

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

// 마커 클러스터링
// 클러스터가 모이는 숫자에 맞게, 클러스터의 크기를 정해줌
// 10개 미만 - cluster1, 10개 이상 ~ 100개 미만 - cluster2, 100개 이상 - cluster3
const cluster1 = {
    content :  `<div class="cluster cluster1"></div>`
}

const cluster2 = {
    content :  `<div class="cluster cluster2"></div>`
}

const cluster3 = {
    content :  `<div class="cluster cluster3"></div>`
}

const markerClustering = new MarkerClustering({
    minClusterSize: 2,
    maxZoom: 17, // 줌의 최대 레벨
    map: map,
    markers: markerList, // 모든 마커들을 전달
    disableClickZoom: false, // 클러스터를 클릭했을 때 줌 여부
    gridSize: 10, // 지도에서 클러스터의 영역을 결정, gridSize가 작으면 작을수록 좀 더 세분화된 클러스터를 만들 수 있고 키우면 더 넓은 영역의 클러스터를 만듬
    icons: [cluster1, cluster2, cluster3],
    indexGenerator: [1, 3, 10], // 2개 이상 4개 이하 - cluster1, 5개 이상 9개 이하 - cluster2, 10개 이상 - cluster3
    stylingFunction: function(clusterMarker, count) {
        // 단순하게 클러스터만 보여주는 것이 아니라, 클러스터 안에 몇 개의 마커가 들어가 있는지를 시각적으로 확인 가능
        $(clusterMarker.getElement()).find('div:first-child').text(count);
    }
});

// 행정구역 GeoJSON 데이터 레이어 표시
// GeoJSON : 지리 공간 데이터의 형상 정보(feature)

// 17개 도를 구획별로 나눠서 지도 위에 시각화하고, 해당 구역에 이벤트를 추가
// 도별 정보를 받아올 서버의 주소
const urlPrefix = "https://navermaps.github.io/maps.js.ncp/docs/data/region"
const urlSuffix = ".json";

let regionGeoJson = [];
let loadCount = 0;

const tooltip = $(
    `<div class="tooltip"></div>`
)

// 툴팁을 지도 안에 넣어줌
tooltip.appendTo(map.getPanes().floatPane);

// 구역별로 나누고, 이벤트 추가
naver.maps.Event.once(map, 'init', function () {
    for (let i = 1; i < 18; i++) {
        let keyword = i.toString();

        // 한자리를 두자리로 대체
        if (keyword.length === 1) {
            keyword = '0'+ keyword;
        }

        $.ajax({
            url: urlPrefix + keyword + urlSuffix,
        }).done((geojson)=>{
            regionGeoJson.push(geojson);
            loadCount++;
            if (loadCount === 17) {
                // 키워드가 01~17까지 생성이 되고, 정보를 바탕으로 해당 지도에 결과값을 띄움
                startDataLayer();
            }
        });        
    }
});

function startDataLayer() {
    // setStyle 메서드 : GeoJSON 지리 공산 데이터의 형상 정보의 스타일을 지정
    map.data.setStyle((feature)=>{
        const styleOptions = {
            fillColor: '#ff0000',
            fillOpacity: 0.0001,
            strokeColor: '#ff0000',
            strokeWeight: 2,
            strokeOpacity: 0.4
        };

        // 클릭했을때 스타일
        if (feature.getProperty('focus')) {
            styleOptions.fillOpacity = 0.6;
            styleOptions.fillColor = '#0f0';
            styleOptions.strokeColor = '#0f0';
            styleOptions.strokeWeight = 4;
            styleOptions.strokeOpacity = 1;
        }

        return styleOptions;
    })

    // 받아온 결과값을 바탕으로 지도 위에 도의 경계선을 표시
    regionGeoJson.forEach((geojson) => {
        // addGeoJson 메서드 : GeoJSON 형식의 데이터를 로드
        map.data.addGeoJson(geojson);
    });

    map.data.addListener('click', function(e) {
        let feature = e.feature;

        // 클릭이 되어지있지 않다면
        if (feature.getProperty('focus') !== true) {
            feature.setProperty('focus', true);
        } else {
            feature.setProperty('focus', false);
        }
    });

    map.data.addListener('mouseover', function(e) {
        let feature = e.feature;
        // 해당 도의 이름이 regionName에 저장
        let regionName = feature.getProperty('area1');

        // 이를 바탕으로 tooltip 스타일 및 텍스트 
        tooltip.css({
            display: 'block',
            left: e.offset.x,
            top: e.offset.y
        }).text(regionName);

        // overrideStyle 메서드 : 특정 Feature 객체에 특별한 스타일을 재정의
        map.data.overrideStyle(feature, {
            fillOpacity: 0.6,
            strokeWeight: 4,
            strokeOpacity: 1
        });
    });

    map.data.addListener('mouseout', function(e) {
        tooltip.hide().empty();
        //  revertStyle 메서드 : 재정의한 스타일을 이전 스타일로 다시 복원
        map.data.revertStyle();
    });
    
}

let currentUse = true;

function current() {
    // navigator 안에 'geolocation'를 통해서 현재 위치 받아옴
    // 현재 위치를 알 수 있는 코드 같은 경우에는 크롬 부라우저 혹은 다른 브라우저에서 내장
    if('geolocation' in navigator) { 
        /**
         * navigator.geolocation 은 Chrome 50 버젼 이후로 HTTP 환경에서 사용이 Deprecate 되어 HTTPS 환경에서만 사용 가능
         * http://localhost 에서는 사용이 가능하며, 테스트 목적으로, Chrome 의 바로가기를 만들어서 아래와 같이 설정하면 접속은 가능
         * chrome.exe --unsafely-treat-insecure-origin-as-secure="http://example.com"
        **/
        navigator.geolocation.getCurrentPosition(function(position){
            // position : 현재 위치에 대한 정보 
            const lat = position.coords.latitude;
            const lng = position.coords.longitude; 
            const latlng = new naver.maps.LatLng(lat, lng);

            if(currentUse) {
                marker = new naver.maps.Marker({
                    map : map,
                    position : latlng,
                    icon : {
                        content : `<div class="current"><img draggable="false" unselectable="on" src="/img/marker.png" width="40px"></div>`,
                        anchor : new naver.maps.Point(20, 20), 
                    }
                });
                currentUse = false;
            }
            // 지도의 줌 레벨을 변경, 이동하는 애니메이션 막음
            map.setZoom(14, false); 
            // 얻은 좌표를 지도의 중심으로 설정
            // map.setCenter(latlng); 
            map.panTo(latlng);
        });
    } else {
        alert('위치 정보 사용 불가능');
    }
}

// services 라이브러리 Places() 함수 - 장소 검색 객체를 생성
let ps = new kakao.maps.services.Places();
let searchList = [];

$(document).on("keydown", "#keyword", function(e){
    if( e.keyCode == 13 ) {
        let keyword = $('#keyword').val();

        // 장소검색 객체(ps)의 keywordSearch 함수를 통해 키워드로 장소검색을 요청
        // 키워드를 통해서 검색을 하고, 검색 결과를 placesSearchCB 함수를 통해서 콜백
        ps.keywordSearch(keyword, placesSearchCB); 
    }
});

$(document).on("click", ".ser-bth", function(e){
    let keyword = $('#keyword').val();
    ps.keywordSearch(keyword, placesSearchCB); 
})

// 장소검색이 완료됐을 때 호출되는 콜백함수
// data, status라는 매개변수를 받게 되고, status 값에 따라서 결과값이 다양하게 바뀜
// 결과값이 data로 전달되고 status는 결과값을 반환하기 위한 서버에 대한 상태가 담김
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면, 첫번째 데이터만 사용
        let target = data[0];
        console.log(target);
        const lat = data[0].y // 위도
        const lng = data[0].x // 경도        
        const latlng = new naver.maps.LatLng(lat, lng);

        // 마커를 생성하고 지도에 표시
        marker = new naver.maps.Marker({
            map : map,
            position : latlng,            
        })
        
        // 새로운 키워드 검색 시 이전 마커는 보이지 않도록
        if( searchList.length == 0) {
            searchList.push(marker);
        } else {
            searchList.push(marker);
            let preMarker = searchList.splice(0, 1);
            preMarker[0].setMap(null);
        }

        map.setZoom(14, false);
        map.panTo(latlng);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}