var curYearGen = {
    pageSize: 9,//每页显示条目数
    currentPage: 1, //当前页
    rowCount: 0,//总条目数
    pageCount: 0,//总页数
    dataArr: []//所有电站数据
};

//检查数据是否返回值
function isNotNull(data){
    if(data == 0 || data == "0"){
        return false;
    }
    if(data==null||data==""||data=="null"||data==undefined||data=="undefined"){
        return false;
    }
    return true;
}

function checkGetValue(data){
    return isNotNull(data)?data:"";
}


function currentYearGenCurPage() {
    isPageArrowAvilable();
    $(".loadingDiv").show();
    var startIndex = curYearGen.pageSize * (curYearGen.currentPage - 1);
    var endIndex = curYearGen.currentPage * curYearGen.pageSize;
    var trHtml = "";
    for (var i = startIndex; i < curYearGen.dataArr.length && i < endIndex; i++) {
        var obj = curYearGen.dataArr[i];
        var area_name = checkGetValue(obj.ps_name);
        var yesterdayGen = checkGetValue(obj.as_of_yesterday_total_energy) + checkGetValue(replaceUnit_scrn4Dialog(obj.as_of_yesterday_total_energy_unit));
        var design_capacity = checkGetValue(obj.yestoday_radiation) + checkGetValue(obj.yestoday_radiation_unit);
        trHtml += '<li>' +
            '<div class="show_icon_list_title">' + area_name + '</div>' +
            '<div class="show_icon_list_bottom">' +
            '<div class="Sicon_1">' + yesterdayGen + '</div>' +
            '<div class="Sicon_2">' + design_capacity + '</div>' +
            '</div>' +
            '</li>';
    }
    $("#iconsUl").html(trHtml);
    $(".loadingDiv").hide();
}


//分页点点点
function showPageantion() {
    $("#pagenation").append("");
    var pagenationStr = "";
    if (curYearGen.pageCount == 1) {
        return;
    }
    for (var i = 0; i < curYearGen.pageCount; i++) {
        pagenationStr += "<li onclick='toPage(" + (i + 1) + ")' class='" + (i == 0 ? 'on' : '') + "' style='cursor: pointer'></li>";
    }
    $("#pagenation").html(pagenationStr);
}

//点击 分页li
function toPage(page) {
    curYearGen.currentPage = page;
    currentYearGenCurPage();
    showCurPage();
}

//当前页选中效果
function showCurPage() {
    var lis = $("#pagenation li");
    $("#pagenation li").removeClass("on");
    $(lis[curYearGen.currentPage - 1]).addClass("on");
}

//分页箭头可用
function isPageArrowAvilable() {
    if (curYearGen.pageCount > curYearGen.currentPage) {
        $("#right_max_btn").unbind().bind('click', arrowChangePage);
        $("#right_max_btn").css("opacity", 1);
    } else {
        $("#right_max_btn").unbind('click', arrowChangePage);
        $("#right_max_btn").css("opacity", 0.3);
    }
    if (1 < curYearGen.currentPage) {
        $("#left_max_btn").unbind().bind('click', arrowChangePage);
        $("#left_max_btn").css("opacity", 1);
    } else {
        $("#left_max_btn").unbind('click', arrowChangePage);
        $("#left_max_btn").css("opacity", 0.3);
    }
}

//箭头分页
function arrowChangePage() {
    if (event.target == document.getElementById("left_max_btn") && curYearGen.currentPage > 1) {
        curYearGen.currentPage--;
    } else if (event.target == document.getElementById("right_max_btn")) {
        curYearGen.currentPage++;
    }
    currentYearGenCurPage();
    showCurPage();
    isPageArrowAvilable();
}

new Vue({
    el: '#allPowerDialog',
    data: {},
    mounted: function () {
        $("#left_max_btn").css("opacity", 0.3);
        $("#right_max_btn").css("opacity", 0.3);
        $("#left_max_btn").unbind().bind('click', arrowChangePage);
        $("#right_max_btn").unbind().bind('click', arrowChangePage);

        $(".close").click(function () {
            $(".Monitor_left_c1_highLt", parent.document).removeClass("Monitor_left_c1_highLt");
            window.parent.closeEqualHourFm();
        });
        currentYearGenAll();
        function currentYearGenAll() {
            var Parameters = {
                //"parameters": {
                //
                //},
                //"foreEndType": 2,
                //"code": "20000003"
            };
            //console.log(Parameters);
            vlm.loadJson("../data/dia_allPower.json", JSON.stringify(Parameters), function (res) {
                console.log(res);
                var powerList = res.result_data.powerList;
                if (powerList != null && powerList != undefined) {
                    for (var i = 0; i < powerList.length; i++) {
                        var obj = powerList[i];
                        if (obj.build_status == 2) {//仅显示并网电站
                            curYearGen.dataArr.push(powerList[i]);
                        }
                    }
                    var length = curYearGen.dataArr.length;
                    curYearGen.rowCount = length;
                    curYearGen.pageCount = curYearGen.rowCount / curYearGen.pageSize;
                    var remainder = curYearGen.rowCount % curYearGen.pageSize;
                    if (remainder != 0) {
                        curYearGen.pageCount = parseInt(curYearGen.pageCount) + 1;
                    }
                    showPageantion();
                    currentYearGenCurPage();
                }
            });


        }

        currentYearGenAll();
    }

})