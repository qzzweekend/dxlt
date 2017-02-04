
var dialog_psunit = {
    psType : '',//电站类型：1: 地面式
    psScheme : '',//电站方案
    deviceType : '1',//psScheme==2(组串式),deviceType=17(单元); 其他,deviceType=1(逆变器);
    dateType : 1, //等效小时、发电量 排名  1:日  2:月  3:年
    psId: "",
    deviceArr : [],//所有电站设备数组
    avg : 0,//平均 效率

    pageSize : 15,//每页显示条目数
    currentPage : 1, //当前页
    rowCount : 0,//总条目数
    pageCount : 0,//总页数
    screenVersion : "",
    uuid_index:"", //一个具体设备的uuid，用来查询该设备下面的所有设备
    psTemType:""
};

$(function(){
    $("#left_max_btn").css("opacity", 0.3);
    $("#right_max_btn").css("opacity", 0.3);
    dialog_psunit.psId = $("#psId").val();
    dialog_psunit.psType = $("#psType").val();
    dialog_psunit.psScheme = $("#psScheme").val();
    dialog_psunit.screenVersion = $("#screenVersion").val() ? $("#screenVersion").val(): "";
    dialog_psunit.psTemType = dialog_psunit.psScheme;
    if(dialog_psunit.psScheme == 2){
        $("#dialogTile").html("箱变矩阵");
        dialog_psunit.deviceType = "17";
    } else {
        $("#dialogTile").html("逆变器矩阵");
    }
    $(".close").click(function(){
        toDetailInfo();
    });
    $("#left_min_btn").unbind().bind('click', arrowChangeDate);
    $("#left_max_btn").unbind().bind('click', arrowChangeDate);
    //弹出页面中的点击
    $(".showm_top_left ul li").click(function(){
        $(this).addClass("on");
        $(this).siblings().removeClass("on");
    });

    initTime();
    setDateInputFormat();
    loadPsAllDevice();
});

//关闭时 显示电站详细信息
function toDetailInfo(){
    if(dialog_psunit.psId){
        var url = ctx + "/dialog/dialog_psDetailInfo.jsp?ps_id=" + dialog_psunit.psId + "&ps_scheme=" + dialog_psunit.psScheme + "&scrnvs=" + dialog_psunit.screenVersion;
        $("#equalHourFm", parent.document).attr("src", url);
    }
}

//加载电站设备
function loadPsCurPageDevice(){
    $(".showm_bottom .loadingDiv").show();
    var startIndex = dialog_psunit.pageSize * (dialog_psunit.currentPage - 1);
    var endIndex = dialog_psunit.currentPage * dialog_psunit.pageSize;
    isPageArrowAvilable();
    var lis = "";
    var j = 0;
    for(var i = startIndex; i < dialog_psunit.deviceArr.length && i < endIndex; i ++){
        var obj = dialog_psunit.deviceArr[i];
        var pr = obj.p81022;
        var c = getClassByPr_new(parseFloat(obj.p81022));
        /*c = "deviceNice";//演示写死
         pr = (85-((i%2)==0?(j*1):(j*0.5)));//演示写死
         if(pr<75){
         c = "deviceFine";//演示写死
         }*/
        j++;
        if(dialog_psunit.psTemType == 2){
            lis += '<li onclick="showInveter(' +obj.uuid + ')" class="' + c + '">' +
                '<h3 style="align-self: center">' + pr + '%</h3>' +
                '<h5 style="align-self: center">' + obj.device_name + '</h5>' +
                '</li>';
        } else {
            lis += '<li class="' + c + '">' +
                '<h3 style="align-self: center">' + pr + '%</h3>' +
                '<h5 style="align-self: center">' + obj.device_name + '</h5>' +
                '</li>';
        }
    }
    $(".showm_bottom .loadingDiv").hide();
    $("#deviceUl").html(lis);
    if(dialog_psunit.psTemType == 2){
        $("#dialogTile").html("箱变矩阵");
        $("#deviceUl li").css("cursor", "pointer");
    } else {
        $("#dialogTile").html("逆变器矩阵");
        $("#deviceUl li").css("cursor", "normal");
    }
}

//加载所有电站设备
function loadPsAllDevice(){
    $(".showm_bottom .loadingDiv").show();
    var params = {};
    params["service"] = "stationDeviceHistoryDataList";
    params["req"] = "app";
    params["ps_id"] = dialog_psunit.psId;
    params["device_type"] = dialog_psunit.deviceType;
    params["type"] = dialog_psunit.dateType;
    params["date_id"] = getDate();
    params["uuid_index"] = dialog_psunit.uuid_index;
    $.ajax({
        url: "powerAction_loaddata.action",
        type: "post",
        data: params,
        dataType: "json",
        timeout: 1000 * 10,
        beforeSend: function () {
            $("#deviceUl").html("");
        },
        success: function (data) {
            data = eval("(" + data + ")");
            if(data && data.result_data && data.result_data.deviceList){
                var result = data.result_data;
                dialog_psunit.rowCount = result.rowCount;
                dialog_psunit.pageCount = dialog_psunit.rowCount / dialog_psunit.pageSize;
                var remainder = dialog_psunit.rowCount % dialog_psunit.pageSize;
                if(remainder != 0){
                    dialog_psunit.pageCount = parseInt(dialog_psunit.pageCount) + 1;
                }
                showPageantion();
                result = data.result_data.deviceList;
                isPageArrowAvilable();
                dialog_psunit.deviceArr = result;
                var sum = sumOfDevicePr(dialog_psunit.deviceArr);
                if($.isNumeric(dialog_psunit.rowCount) && dialog_psunit.rowCount > 0){
                    dialog_psunit.avg = sum / dialog_psunit.rowCount;
                }
                dialog_psunit.currentPage = 1;
                $("#curPage").text(dialog_psunit.currentPage);
                $("#totalPage").text(dialog_psunit.pageCount);
                loadPsCurPageDevice();
            }
        },
        error: function () {
        }
    });
}

//分页点点点
function showPageantion(){
    $("#pagenation").append("");
    var pagenationStr = "";
    if(dialog_psunit.pageCount==1){
        return;
    }
    for(var i = 0; i < dialog_psunit.pageCount; i ++){
        pagenationStr += "<li onclick='toPage(" + (i + 1)+ ")' class='"+(i==0?'on':'')+"' style='cursor: pointer'></li>";
    }
    $("#pagenation").html(pagenationStr);
}

//点击 分页li
function toPage(page){
    dialog_psunit.currentPage = page;
    showCurPage();
    loadPsCurPageDevice();
}

//当前页选中效果
function showCurPage(){
    var lis = $("#pagenation li");
    $("#pagenation li").removeClass("on");
    $(lis[dialog_psunit.currentPage - 1]).addClass("on");
}

function sumOfDevicePr(arr){
    var sum = 0;
    for(var i = 0; i < arr.length; i ++){
        var obj = arr[i];
        if($.isNumeric(obj.p81022)){
            sum += parseFloat(obj.p81022);
        }
    }
    return sum;
}

function getClassByPr(val){
    if($.isNumeric(dialog_psunit.avg) && dialog_psunit.avg > 0 && $.isNumeric(val)){
        var temVal = ((val - dialog_psunit.avg) / dialog_psunit.avg) * 100;
        if(temVal > 20){
            return "deviceNice";
        }else if(temVal > 10){
            return "deviceFine";
        }else if(temVal > -10){
            return "deviceCommon";
        }else if(temVal > -20){
            return "deviceWorse";
        }else{
            return "deviceBad";
        }
    }
    return "deviceNoState";
}

function getClassByPr_new(val){
    if($.isNumeric(val)){
        if(dialog_psunit.psType == 3){//分布式电站
            if(val >= 80){
                return "deviceNice";
            }else if(val >= 75){
                return "deviceFine";
            }else if(val >= 70){
                return "deviceCommon";
            }else if(val >= 65){
                return "deviceWorse";
            }else{
                return "deviceBad";
            }
        }else {
            if(val >= 85){
                return "deviceNice";
            }else if(val >= 80){
                return "deviceFine";
            }else if(val >= 75){
                return "deviceCommon";
            }else if(val >= 70){
                return "deviceWorse";
            }else{
                return "deviceBad";
            }
        }
    }
    return "deviceNoState";
}

//箭头分页
function arrowChangePage(){
    if(event.target == document.getElementById("left_max_btn") && dialog_psunit.currentPage > 1){
        dialog_psunit.currentPage --;
    }else if(event.target == document.getElementById("right_max_btn")){
        dialog_psunit.currentPage ++;
    }
    showCurPage();
    loadPsCurPageDevice();
    $("#curPage").text(dialog_psunit.currentPage);
    isPageArrowAvilable();
}

function initTime(){
    var daybegin=new Date();
    var year=daybegin.getFullYear();
    var month=daybegin.getMonth()+1;
    var date = daybegin.getDate();
    var hour = daybegin.getHours();
    var min = daybegin.getMinutes();
    var month1 = month >= 10?month:("0"+month);
    var date1 = date >= 10?date:("0"+date);
    var thisDate = year+"/"+month1+"/"+date1;
    if(dialog_psunit.dateType == "2"){
        thisDate = year+"/"+month1;
    }else if(dialog_psunit.dateType == "3"){
        thisDate = year;
    }
    $("#dateInput").val(thisDate);
    isIncreaseDateAvailable(dialog_psunit.dateType, thisDate, false);
}

//根据时间类型type 刷新数据 1:日  2:月  3:年
function showEqHourData(type){
    dialog_psunit.currentPage = 1;
    dialog_psunit.dateType = type;
    setDateInputFormat();
    initTime();
    loadPsAllDevice();
    isIncreaseDateAvailable(type, $("#dateInput").val() + "", false);
}

//判断能否增长日期 val(eg:2016-01-01)
function isIncreaseDateAvailable(type, val, isInner){
    var showIncreaseDate = false;
    var now = new Date();
    val = val + "";
    if(type == 1){//日
        if(now.Format("yyyyMMdd") > val.substring(0,10).replace(/\//g, "")){
            showIncreaseDate = true;
        }else{
            showIncreaseDate = false;
        }
    }else if(type == 2){//月
        if(now.Format("yyyyMM") > val.substring(0,7).replace(/\//g, "")){
            showIncreaseDate = true;
        }else{
            showIncreaseDate = false;
        }
    }else if(type == 3){//年
        if(now.Format("yyyy") > val.substring(0,4).replace(/\//g, "")){
            showIncreaseDate = true;
        }else{
            showIncreaseDate = false;
        }
    }
    if(showIncreaseDate){
        if(isInner){
            $("#inner_right_min_btn").unbind().bind('click', innerArrowChangeDate);
            $("#inner_right_min_btn").css("opacity", 1);
        }
        $("#right_min_btn").unbind().bind('click', arrowChangeDate);
        $("#right_min_btn").css("opacity", 1);
    }else{
        if(isInner) {
            $("#inner_right_min_btn").unbind('click', innerArrowChangeDate);
            $("#inner_right_min_btn").css("opacity", 0.3);
        }
        $("#right_min_btn").unbind('click', arrowChangeDate);
        $("#right_min_btn").css("opacity", 0.3);
    }
}

//点击日期 箭头
function arrowChangeDate(){
    var temdate = "";
    var val = 0;
    if(event.target == document.getElementById("left_min_btn")){//判断事件对象，左键头时间向前
        val = -1;
    }else if(event.target == document.getElementById("right_min_btn")){
        val = 1;
    }
    var date = $("#dateInput").val();
    date = date.substring(0, 10);
    if (dialog_psunit.dateType == "1") {
        var d1 = new Date(date.replace(/\-/g, "\/"));
        d1.addDays(val);//加、减日 操作
        temdate = d1.Format("yyyy/MM/dd");
        isIncreaseDateAvailable(1, temdate, false);
    } else if (dialog_psunit.dateType == "2") {
        var d1 = new Date(date.replace(/\-/g, "\/"));
        d1.addMonths(val);
        temdate = d1.Format("yyyy/MM");
        isIncreaseDateAvailable(2, temdate, false);
    } else if (dialog_psunit.dateType == "3") {
        var d1 = new Date(date.replace(/\-/g, "\/"));
        d1.addYears(val);
        temdate = d1.Format("yyyy");
        isIncreaseDateAvailable(3, temdate, false);
    }
    $("#dateInput").val(temdate);
    loadPsAllDevice();
}

function getDate(){
    var date = $("#dateInput").val();
    date = date.replace(/\//g,"");
    return date;
}

function setDateInputFormat(){
    if(dialog_psunit.dateType == "1" || !dialog_psunit.dateType){
        $("#dateInput").unbind();
        $("#dateInput").click(function(){
            WdatePicker({dateFmt:'yyyy/MM/dd',maxDate:'%y/%M/%d',isShowClear:false,readOnly:true,onpicking:function(dp){dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());}});
        });
    }else if(dialog_psunit.dateType == "2"){
        $("#dateInput").unbind();
        $("#dateInput").click(function(){
            WdatePicker({dateFmt:'yyyy/MM',maxDate:'%y/%M',isShowClear:false,readOnly:true,onpicking:function(dp){dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());}});
        });
    }else{
        $("#dateInput").unbind();
        $("#dateInput").click(function(){
            WdatePicker({dateFmt:'yyyy',maxDate:'%y',isShowClear:false,readOnly:true,onpicking:function(dp){dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());}});
        });
    }
}

function dateChanged(dStrOld, dStrNew){
    if(true){
        $("#dateInput").val(dStrNew);
        isIncreaseDateAvailable(dialog_psunit.dateType, dStrNew, false);
        loadPsAllDevice();
    }
}

//判断分页箭头可用
function isPageArrowAvilable(){
    if(dialog_psunit.pageCount > dialog_psunit.currentPage){
        $("#right_max_btn").unbind().bind('click', arrowChangePage);
        $("#right_max_btn").css("opacity", 1);
    }else{
        $("#right_max_btn").unbind('click', arrowChangePage);
        $("#right_max_btn").css("opacity", 0.3);
    }
    if(1 < dialog_psunit.currentPage){
        $("#left_max_btn").unbind().bind('click', arrowChangePage);
        $("#left_max_btn").css("opacity", 1);
    }else{
        $("#left_max_btn").unbind('click', arrowChangePage);
        $("#left_max_btn").css("opacity", 0.3);
    }
}

function toUnit(){
    $(".showInverter").hide();
    dialog_psunit.psTemType = "2";
    dialog_psunit.deviceType = "17";
    dialog_psunit.uuid_index = "";
    loadPsAllDevice();
}

function showInveter(uuid){
    //$("#unitName").text(name);
    $(".showInverter").show();
    var eventObj = event.target;
    var li = $(eventObj).closest('li');
    var h5= $(li).find('H5');
    var name = $(h5).text();
    $("#unitName").text(name);
    dialog_psunit.psTemType  = "1";
    dialog_psunit.deviceType = "1";
    dialog_psunit.uuid_index = uuid;
    loadPsAllDevice();
}
