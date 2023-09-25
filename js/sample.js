/******************************************************/
/*                     기본 지도                       */
/******************************************************/

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
    },
    {
        title : "인천공항1터미널역 공항철도",
        address : "인천광역시 중구 공항로 271 인천국제공항역",
        lat : '37.484712',
        lng : '126.439660'
    },
    {
        title : "인천공항2터미널역 공항철도",
        address : "인천광역시 중구 제2터미널대로 444",
        lat : '37.447474',
        lng : '126.452372'
    }
]

let markerList = [];
let infowindowList = [];

let mapContainer = document.getElementById('map'), // 지도를 표시할 div 
mapOptions = { 
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 3 // 지도의 확대 레벨
};


// 지도를 표시할 div와  지도 옵션으로  지도를 생성
let map = new kakao.maps.Map(mapContainer, mapOptions); 

// 지도를 재설정할 범위정보를 가지고 있을 LatLngBounds 객체를 생성
var bounds = new kakao.maps.LatLngBounds();    

// 데이터를 반복문으로 돌려서 마커를 찍음
for (let i in data) {    

    let target = data[i];
    let latlng = new kakao.maps.LatLng(target.lat, target.lng);

    
    // 마커를 생성합니다
    let marker = new kakao.maps.Marker({
        map: map, // 마커를 표시할 지도
        position: latlng, // 마커를 표시할 위치
    });

     // 인포윈도우를 생성합니다
    const content = `
        <div class="infowindow">
            <div class="title">${target.title}</div>
            <div class="address">${target.address}</div>
        </div>
    `

    const infowindow = new kakao.maps.InfoWindow({
        content : content,
    })
    

    // 생성된 마커와 인포윈도우를 배열에 담음
    markerList.push(marker);
    infowindowList.push(infowindow);

    // LatLngBounds 객체에 좌표를 추가
    bounds.extend(latlng);


}


map.setBounds(bounds);

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

// 반복문을 돌며 각각의 i번째 해당하는 마커를 클릭했을 때, getClickHandler함수 실행
for(let i=0, ii=markerList.length ; i < ii ; i++) {
    kakao.maps.event.addListener(markerList[i], 'click', getClickHandler(i))
    // 지도를 클릭했을 때 열려있는 인포윈도우 닫기
    kakao.maps.event.addListener(map, 'click', getClickMap(i))
}


/******************************************************/
/*                     장소 검색                       */
/******************************************************/

// 장소 검색 객체를 생성
var ps = new kakao.maps.services.Places();  

// 인포윈도우 객체를 생성
let infowindow2 = new kakao.maps.InfoWindow({
    zIndex : 1
})

// 키워드 검색을 요청하는 함수
function searchPlaces() {

    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청
    ps.keywordSearch( keyword, placesSearchCB); 
}


// 장소검색이 완료됐을 때 호출되는 콜백함수
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 정상적으로 검색이 완료됐으면, 검색 목록과 마커를 표출
        displayPlaces(data);

        // 페이지 번호를 표출
        displayPagination(pagination);

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

let markerList2 = [];

// 검색 결과 목록과 마커를 표출하는 함수
function displayPlaces(data) {

    let listEl = document.getElementById('placesList');
    bounds = new kakao.maps.LatLngBounds(), 
    listStr = '';
    
    // 검색 결과 목록에 추가된 항목들을 제거
    removeAllChildNods(listEl);

    // 지도에 표시되고 있는 마커를 제거
    removeMarker();
    
    for ( var i=0; i<data.length; i++ ) {
        let lat = data[i].y // 위도
        let lng = data[i].x // 경도
        let address = data[i]["address_name"];
        let place = data[i]["place_name"];
        const placePosition = new kakao.maps.LatLng(lat, lng);

        // LatLngBounds 객체에 좌표를 추가
        bounds.extend(placePosition);

        // 마커를 생성하고 지도에 표시
        let marker = new kakao.maps.Marker({
            position : placePosition
        })

        marker.setMap(map);
        markerList2.push(marker);

        let el = document.createElement("div");
        let itemStr = `
            <div class="info">
                <div class="info-title">${place}</div>
                <span>${address}</span>
            </div>
        `;
        el.innerHTML = itemStr;
        el.className = "item";

        kakao.maps.event.addListener(marker, "click", function(){
            displayInfowindow(marker, place, address);
        })
    
        kakao.maps.event.addListener(map, "click", function(){
            infowindow2.close();
        })
    
        el.onclick = function() {
            displayInfowindow(marker, place, address);
        }

        // 검색결과 항목들을 검색결과 목록 Element에 추가
        listEl.appendChild(el);
        
    }

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정
    map.setBounds(bounds);
}

function displayInfowindow(marker, title, adress) {
    let content = `
    <div id="upload-box" class="infowindow">
        ${title} <br>
        ${adress} <br>
    </div>
    `;

    // 인포윈도우를 보여줄 때 마커의 좌표를 반환해서 해당 위치로 이동
    map.panTo(marker.getPosition());

    // 인포윈도우의 내용을 지정 후 오픈 (엘리먼트 또는 HTML 문자열을 지정)
    infowindow2.setContent(content);
    infowindow2.open(map, marker);
    console.log(infowindow2);
}

// 검색결과 목록의 자식 Element를 제거하는 함수
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

// 지도 위에 표시되고 있는 마커를 모두 제거
function removeMarker() {
    for ( var i = 0; i < markerList.length; i++ ) {
        markerList[i].setMap(null);
    }   
    markerList = [];
}

// 검색결과 목록 하단에 페이지번호를 표시는 함수
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i; 

    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild (paginationEl.lastChild);
    }

    for (i=1; i<=pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i===pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

/******************************************************/
/*                  마커 클러스터링                   */
/******************************************************/

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

// 마커 클러스터러를 생성합니다 
var clusterer = new kakao.maps.MarkerClusterer({
    map: map, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
    averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
    minLevel: 10, // 클러스터 할 최소 지도 레벨 
    calculator: [2, 4, 6], // 클러스터의 크기 구분 값, 각 사이값마다 설정된 text나 style이 적용
    styles: [{ // calculator 각 사이 값 마다 적용될 스타일을 지정한다
            width : '30px', height : '30px',
            background: 'rgba(51, 204, 255, .8)',
            borderRadius: '15px',
            color: 'pink',
            textAlign: 'center',
            fontWeight: 'bold',
            lineHeight: '31px'
        },
        {
            width : '40px', height : '40px',
            background: 'rgba(255, 153, 0, .8)',
            borderRadius: '20px',
            color: 'blue',
            textAlign: 'center',
            fontWeight: 'bold',
            lineHeight: '41px'
        },
        {
            width : '50px', height : '50px',
            background: 'rgba(255, 51, 204, .8)',
            borderRadius: '25px',
            color: 'red',
            textAlign: 'center',
            fontWeight: 'bold',
            lineHeight: '51px'
        },
        {
            width : '60px', height : '60px',
            background: 'rgba(255, 80, 80, .8)',
            borderRadius: '30px',
            color: 'green',
            textAlign: 'center',
            fontWeight: 'bold',
            lineHeight: '61px'
        }
    ]
});

// 클러스터러에 마커들을 추가합니다
clusterer.addMarkers(markerList);
