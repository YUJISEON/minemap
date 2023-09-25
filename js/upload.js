


let mapContainer = document.getElementById('map'), // 지도를 표시할 div 
mapOptions = { 
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 3 // 지도의 확대 레벨
};

// 지도를 표시할 div와  지도 옵션으로  지도를 생성
let map = new kakao.maps.Map(mapContainer, mapOptions); 

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성
// zIndex : 지도보다 위에 띄어지도록 미리 설정
let infowindow = new kakao.maps.InfoWindow({
    zIndex : 1
})

let markerList = [];

// services 라이브러리 Places() 함수 - 장소 검색 객체를 생성
let ps = new kakao.maps.services.Places();


// 키워드로 장소를 검색
// searchPlaces();

// 키워드를 받고, 이를 검색하는 함수
// 화살표 함수로 만들 경우, 먼저 함수를 정의하고 함수를 호출 필요 - 번거로움
function searchPlaces() {
    let keyword = $('#keyword').val();
    console.log("키워드 : " + keyword);

    // 장소검색 객체(ps)의 keywordSearch 함수를 통해 키워드로 장소검색을 요청
    // 키워드를 통해서 검색을 하고, 검색 결과를 placesSearchCB 함수를 통해서 콜백
    // option : size 한 페이지에 보여질 목록 개수. 기본값은 15, 1~15까지 가능
    ps.keywordSearch(keyword, placesSearchCB, { size: 15 }); 

}


// 장소검색이 완료됐을 때 호출되는 콜백함수
// data, status라는 매개변수를 받게 되고, status 값에 따라서 결과값이 다양하게 바뀜
// 결과값이 data로 전달되고 status는 결과값을 반환하기 위한 서버에 대한 상태가 담김
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면, 검색 목록과 마커를 표출
        displayPlaces(data);

        // 페이징 기능 - 페이지 번호를 표출
        displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

// 검색 결과 목록과 마커를 표출하는 함수
function displayPlaces(data) {
    console.log("검색결과 : ");
    console.log(data);

    let listEl = document.getElementById('placesList');
    // 좌표계에서 사각영역 정보를 표현하는 객체를 생성(초기화) - 지도 범위 재설정
    // LatLngBounds 함수 : 지도에서 검색했을 때, 해당 지점으로 이동하면서 그 영역을 보여주는 기능이 있는데 마커들에 대한 영역들을 계산해서 그 영역을 보여주게됨
    // 마커의 좌표를 저장하고 이를 바탕으로 이동을 시키게 되면 영역들이 모두 표시되는 지도를 만들 수 있음
    let bounds = new kakao.maps.LatLngBounds();

    // 검색 결과 목록에 추가된 항목들을 제거
    removeAllChildNods(listEl);
    // 지도에 표시되고 있는 마커를 제거
    removeMarker();    

    // 반복문을 통해 안에 있는 데이터들을 리스트 형태로 만들어주고 마커로 표시하는 기능
    for (let i=0 ; i<data.length ; i++ ) {
        let lat = data[i].y // 위도
        let lng = data[i].x // 경도
        let address = data[i]["address_name"];
        let place = data[i]["place_name"];

        const placePosition = new kakao.maps.LatLng(lat, lng);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기 위해
        // LatLngBounds 객체에 좌표를 추가
        bounds.extend(placePosition);

        // 마커를 생성하고 지도에 표시
        let marker = new kakao.maps.Marker({
            position : placePosition
        })

        marker.setMap(map);
        markerList.push(marker);

        let el = document.createElement("div");
        let itemStr = `
            <div class="info">
                <div class="info-title">${place}</div>
                <span>${address}</span>
            </div>
        `
        el.innerHTML = itemStr;
        el.className = "item";

        kakao.maps.event.addListener(marker, "click", function(){
            displayInfowindow(marker, place, address, lat, lng);
        })

        kakao.maps.event.addListener(map, "click", function(){
            infowindow.close();
        })

        el.onclick = function() {
            displayInfowindow(marker, place, address, lat, lng);
        }

        listEl.appendChild(el);
    }

    // bounds - 결과값을 바탕으로 bounds 영역 위치로 이동
    map.setBounds(bounds);
}

function displayInfowindow(marker, title, adress, lat, lng) {
    let content = `
    <div id="upload-box" class="infowindow">
        ${title} <br>
        ${adress} <br>
        <button class="insert-btn" onclick="onSubmit('${title}', '${adress}', '${lat}', ${lng})">등록</button>
    </div>
    `;

    //인포윈도우를 보여줄 때 해당 위치로 이동
    // panTo() 메소드 : 중심 좌표를 지정한 좌표 또는 영역으로 이동
    // getPosition() 메소드 : 마커의 좌표를 반환
    map.panTo(marker.getPosition());

    // 인포윈도우의 내용을 지정(엘리먼트 또는 HTML 문자열을 지정)
    infowindow.setContent(content);
    // 지도에 인포윈도우를 올림
    // marker가 주어지면, 해당 마커에서 열린 효과를 냄
    infowindow.open(map, marker)
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

function onSubmit(title, adress, lat, lng) {
    // 데이터 저장
    /*
    $.ajax({
        url : "/location",
        data : {title, adress, lat, lng},
        type : "POST",
    }).done((response)=>{
        console.log("데이터 요청 성공");
    }).fail((error)=>{
        console.log("데이터 요청 실패");
    })
    */
}

/**************************************************************/
// 검색결과 목록 하단에 페이지번호를 표시하는 함수입니다
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