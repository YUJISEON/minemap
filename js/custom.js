// 가상의 목록 데이터
var myPlaceList = [
    {
        place_name: "카페 아무거나",
        address_name: "서울시 강남구",
        lat: 37.12345,
        lng: 127.67890
    },
    {
        place_name: "맛있는 레스토랑",
        address_name: "서울시 강북구",
        lat: 37.54321,
        lng: 126.98765
    },
    // 다른 장소 데이터들...
];

// 사용자 정의 장소 검색 함수
function customKeywordSearch(keyword, callback, options) {
    // 검색 결과를 담을 배열
    var searchResults = [];

    // 키워드를 소문자로 변환하여 대소문자를 무시하도록 함
    var lowerCaseKeyword = keyword.toLowerCase();

    // 목록 데이터를 순회하면서 키워드와 일치하는 장소를 검색
    for (var i = 0; i < myPlaceList.length; i++) {
        var place = myPlaceList[i];
        var placeName = place.place_name.toLowerCase();
        var address = place.address_name.toLowerCase();

        if (placeName.includes(lowerCaseKeyword) || address.includes(lowerCaseKeyword)) {
            searchResults.push(place);
        }
    }

    // 콜백 함수 호출
    if (typeof callback === 'function') {
        callback(searchResults);
    }
}

// 사용자 정의 함수로 키워드 검색 실행
var keyword = "카페"; // 검색할 키워드

var options = {
    size: 10 // 검색 결과 개수 옵션
};

customKeywordSearch(keyword, function(results) {
    console.log("검색 결과:");
    console.log(results);
}, options);