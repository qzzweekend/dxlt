//2016-11-12 ChuD; 等效小时、发电量排名弹出框
var dialog = {
    dateType: 3, //pr  1:日  2:月  3:年
    curtOrgId_refresh: "", //当前组织id，用于 定时刷新
    pageSize: 7,//每页显示条目数
    currentPage: 1, //当前页
    rowCount: 0,//总条目数
    pageCount: 0
}

$(function () {
    $("#left_max_btn").css("opacity", 0.3);
    $("#right_max_btn").css("opacity", 0.3);

    dialog.curtOrgId_refresh = $("#orgId").val();
    $(".close").click(function () {
        $(".M_bottom_b1_clicked", parent.document).removeClass("M_bottom_b1_clicked");
        window.parent.closeEqualHourFm();
    });
    $("#left_min_btn").unbind().bind('click', arrowChangeDate);
    //弹出页面中的点击
    /*$(".showm_top_left ul li").click(function(){
     $(this).addClass("on");
     $(this).siblings().removeClass("on");
     $(".showm_bottom div").hide();
     $(".showm_top_right ul").hide();

     if(this.id=='dxxs_li'){
     $(".showm_bottom .loadingDiv").show();
     $("#dxxsAll").show();
     $("#dxxsUl").show();
     //loadPlanChart(org_id);
     }
     if(this.id=='fdl_li'){
     $(".showm_bottom .loadingDiv").show();
     $("#fdlAllChart").show();
     $("#fdlUl").show();
     //loadFDLAll(org_id);
     }
     if(this.id=='zjrl_li'){
     $("#zjrlChart").show();
     $("#zjrlUl").show();
     //loadZJRLAll(org_id);
     }
     });*/
    $(".time_menunav_my ul li").click(function () {
        $(this).addClass("on");
        $(this).siblings("li").removeClass("on");
    });
    initTime();
    showEqHourData(3);
});

function initTime() {
    var daybegin = new Date();
    var year = daybegin.getFullYear();
    var month = daybegin.getMonth() + 1;
    var date = daybegin.getDate();
    var hour = daybegin.getHours();
    var min = daybegin.getMinutes();
    var month1 = month >= 10 ? month : ("0" + month);
    var date1 = date >= 10 ? date : ("0" + date);
    var thisDate = year + "/" + month1; //+"/"+date1;
    if (dialog.dateType == "2") {
        thisDate = year + "/" + month1;
    } else if (dialog.dateType == "3") {
        thisDate = year;
    }
    $("#dateInput").val(thisDate);
}

//根据时间类型type 刷新等效小时数据 1:日  2:月  3:年
function showEqHourData(type) {
    dialog.dateType = type;
    setDateInputFormat();
    initTime();
    //if(genOrEqHr == 2){
    //    loadFDLAll();
    //}else {
    loadPlanChart();
    //}
    isIncreaseDateAvailable(type, $("#dateInput").val(), false);
}

//加载发电计划 getYearPowerPlan
function loadPlanChart() {
    $(".showm_bottom .loadingDiv").show();
    var param = {};
    var myDate = new Date();
    param["date"] = getDate();
    if (dialog.dateType == 3) {
        param["date_type"] = "1";//年
    } else {
        param["date_type"] = "2";//月
    }
    param["ps_id"] = "";
    param["service"] = "queryBuildProgressing";
    param["curPage"] = dialog.currentPage;
    param["size"] = dialog.pageSize;
    param["org_id"] = dialog.curtOrgId_refresh;
    param["sort_type"] = "1";
    param["sort_column"] = "total_pg";
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_loaddata.action',
        async: true,
        dataType: "json",
        beforeSend: function () {
            //loading(obj);
        },
        success: function (data, s) {
            var object = parseJson(data);
            if (object != null) {
                log("getPowerPlan" + data);
                if ($(object).length > 0 && object.result_code == 1) {
                    var result = object.result_data;
                    result = result.map;
                    var solar_pgArr = [];
                    var booster_pgArr = [];
                    var outside_pgArr = [];
                    var total_pgArr = [];
                    var xData = [];
                    var pageList = result.pageList;
                    dialog.rowCount = result.rowCount;
                    dialog.pageCount = dialog.rowCount / dialog.pageSize;
                    var remainder = dialog.rowCount % dialog.pageSize;
                    if (remainder != 0) {
                        dialog.pageCount = parseInt(dialog.pageCount) + 1;
                    }
                    showPageantion();

                    isPageArrowAvilable();
                    for (var i = 0; i < pageList.length; i++) {
                        solar_pgArr.push(multiply100(pageList[i].solar_pg));
                        booster_pgArr.push(multiply100(pageList[i].booster_pg));
                        outside_pgArr.push(multiply100(pageList[i].outside_pg));
                        total_pgArr.push(multiply100(pageList[i].total_pg));
                        //xData.push(pageList[i].ps_name + "\n" + pageList[i].full_capacity);
                        xData.push(
                            {
                                value: pageList[i].ps_name + "\n" + pageList[i].full_capacity,            //文本内容，如指定间隔名称格式器formatter，则这个值将被作为模板变量值或参数传入
                                textStyle: {             //详见textStyle
                                    //color : 'red'
                                }
                            }
                        );
                    }
                    drawPowerPlanChart(dealEchartBarArr(solar_pgArr), dealEchartBarArr(booster_pgArr), dealEchartBarArr(outside_pgArr), dealEchartBarArr(total_pgArr), xData);
                }
            } else {
                log("获取计划发电数据失败");
            }
        },
        error: function () {
            $(".showm_bottom .loadingDiv").hide();
        }
    })
}

function multiply100(val) {
    if ($.isNumeric(val)) {
        return parseInt(val * 100);
    }
    return val;
}

//等效小时弹出chart
function drawPowerPlanChart(solar_pgArr, booster_pgArr, outside_pgArr, total_pgArr, xData) {
    var myDate = new Date();
    var option = {
        title: {
            show: false,
            text: LANG["yy1.PowerGenerationPalnY"],
            x: 'left',                 // 水平安放位置，默认为左对齐，可选为：
            // 'center' ¦ 'left' ¦ 'right'
            // ¦ {number}（x坐标，单位px）
            y: 'top',
            textStyle: {
                fontFamily: 'Microsoft YaHei',
                fontSize: 26,
                fontWeight: 200,
                color: 'white'
            },
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (data) {
                var str = "<p align='left'>电站：" + data[0].name + "</p>";
                for (var i = 0; i < data.length; i++) {
                    str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + "%";
                }
                return str;
            }
        },
        legend: {
            orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
            // 'horizontal' ¦ 'vertical'
            x: 'right',               // 水平安放位置，默认为全图居中，可选为：
            // 'center' ¦ 'left' ¦ 'right'
            // ¦ {number}（x坐标，单位px）
            y: '10',                  // 垂直安放位置，默认为全图顶端，可选为：
            // 'top' ¦ 'bottom' ¦ 'center'
            // ¦ {number}（y坐标，单位px）
            textStyle: {
                color: '#FFFFFF',
                fontFamily: 'Microsoft YaHei'
            },
            data: [LANG["1_1_actual_solarArea"], LANG["1_1_actual_offsideSpace"], LANG["1_1_actual_boosterStation"], LANG["1_1_actual_totalProgress"]]
        },
        // 网格
        grid: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc'
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                axisLine: {
                    show: true,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#FFFFFF'
                    }
                },
                axisLabel: {
                    show: true,
                    rotate: 0,//逆时针显示标签，不让文字叠加
                    textStyle: {
                        color: '#FFFFFF',
                        fontFamily: 'Microsoft YaHei'
                    }
                },
                splitLine: {
                    show: false
                },
                boundaryGap: [0, 0.01],
                data: xData,
                interval: 1
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: "%",
                axisLine: {
                    show: true,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#FFFFFF'
                    }
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#FFFFFF'
                    }
                },
                splitLine: {
                    show: false
                },
                min: 0,
                max: 100,
                nameTextStyle: {
                    fontSize: 15,
                    fontFamily: 'Microsoft YaHei'
                },
                axisTick: axisTickObj
            }
        ],
        series: [
            {
                name: LANG["1_1_actual_solarArea"],
                type: 'bar',
                yAxisIndex: 0,
                barMaxWidth: 10,
                itemStyle: {
                    normal: {
                        color: '#DFE895'
                    }
                },
                data: solar_pgArr
            },
            {
                name: LANG["1_1_actual_offsideSpace"],
                type: 'bar',
                yAxisIndex: 0,
                barMaxWidth: 10,
                itemStyle: {
                    normal: {
                        color: '#F65D33'
                    }
                },
                data: booster_pgArr
            },
            {
                name: LANG["1_1_actual_boosterStation"],
                type: 'bar',
                yAxisIndex: 0,
                barMaxWidth: 10,
                itemStyle: {
                    normal: {
                        color: '#0196DB'
                    }
                },
                data: outside_pgArr
            },
            {
                name: LANG["1_1_actual_totalProgress"],
                type: 'bar',
                barMaxWidth: 10,
                yAxisIndex: 0,
                itemStyle: {
                    normal: {
                        color: '#2CE9FF'
                    }
                },
                data: total_pgArr
            }
        ]

    };
    var ptChart = echarts.init(document.getElementById('dxxsAll'));
    ptChart.setOption(option);
    $(".showm_bottom .loadingDiv").hide();
    $("#dxxsAll div").show();
}

//判断能否增长日期 val(eg:2016-01-01)
function isIncreaseDateAvailable(type, val, isInner) {
    var showIncreaseDate = false;
    var now = new Date();
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth() + 1;
    var nowDay = now.getDate();
    var temYear = val.substring(0, 4);
    if (type == 1) {//日
        if (now.Format("yyyyMMdd") > val.substring(0, 10).replace(/\//g, "")) {
            showIncreaseDate = true;
        } else {
            showIncreaseDate = false;
        }
    } else if (type == 2) {//月
        if (now.Format("yyyyMM") > val.substring(0, 7).replace(/\//g, "")) {
            showIncreaseDate = true;
        } else {
            showIncreaseDate = false;
        }
    } else if (type == 3) {//年
        if (now.Format("yyyy") > val.substring(0, 4).replace(/\//g, "")) {
            showIncreaseDate = true;
        } else {
            showIncreaseDate = false;
        }
    }
    if (showIncreaseDate) {
        if (isInner) {
            $("#inner_right_min_btn").unbind().bind('click', innerArrowChangeDate);
            $("#inner_right_min_btn").css("opacity", 1);
        }
        $("#right_min_btn").unbind().bind('click', arrowChangeDate);
        $("#right_min_btn").css("opacity", 1);
    } else {
        if (isInner) {
            $("#inner_right_min_btn").unbind('click', innerArrowChangeDate);
            $("#inner_right_min_btn").css("opacity", 0.3);
        }
        $("#right_min_btn").unbind('click', arrowChangeDate);
        $("#right_min_btn").css("opacity", 0.3);
    }
}

//点击日期 箭头
function arrowChangeDate() {
    var temdate = "";
    var val = 0;
    if (event.target == document.getElementById("left_min_btn")) {//判断事件对象，左键头 时间向前
        val = -1;
    } else if (event.target == document.getElementById("right_min_btn")) {
        val = 1;
    }
    var date = $("#dateInput").val();
    date = date.substring(0, 10);
    if (dialog.dateType == "1") {
        var d1 = new Date(date.replace(/\-/g, "\/"));
        d1.addDays(val);//加、减日 操作
        temdate = d1.Format("yyyy/MM/dd");
        isIncreaseDateAvailable(1, temdate, false);
    } else if (dialog.dateType == "2") {
        var d1 = new Date(date.replace(/\-/g, "\/"));
        d1.addMonths(val);
        temdate = d1.Format("yyyy/MM");
        isIncreaseDateAvailable(2, temdate, false);
    } else if (dialog.dateType == "3") {
        var d1 = new Date(date.replace(/\-/g, "\/"));
        d1.addYears(val);
        temdate = d1.Format("yyyy");
        isIncreaseDateAvailable(3, temdate, false);
    }
    $("#dateInput").val(temdate);
    //if(genOrEqHr == 2){
    //    loadFDLAll();
    //}else {
    loadPlanChart();
    //}
}

function getDate() {
    var date = $("#dateInput").val();
    date = date.replace(/\//g, "");
    return date;
}

function setDateInputFormat() {
    if (dialog.dateType == "1" || !dialog.dateType) {
        $("#dateInput").unbind();
        $("#dateInput").click(function () {
            WdatePicker({
                dateFmt: 'yyyy/MM/dd',
                maxDate: '%y/%M/%d',
                isShowClear: false,
                readOnly: true,
                onpicking: function (dp) {
                    dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());
                }
            });
        });
    } else if (dialog.dateType == "2") {
        $("#dateInput").unbind();
        $("#dateInput").click(function () {
            WdatePicker({
                dateFmt: 'yyyy/MM',
                maxDate: '%y/%M',
                isShowClear: false,
                readOnly: true,
                onpicking: function (dp) {
                    dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());
                }
            });
        });
    } else {
        $("#dateInput").unbind();
        $("#dateInput").click(function () {
            WdatePicker({
                dateFmt: 'yyyy', maxDate: '%y', isShowClear: false, readOnly: true, onpicking: function (dp) {
                    dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());
                }
            });
        });
    }
}

function dateChanged(dStrOld, dStrNew) {
    if (true) {
        isIncreaseDateAvailable(dialog.dateType, dStrNew, false);
        //if(genOrEqHr == 2){
        //    loadFDLAll();
        //}else {
        loadPlanChart();
        //}
    }
}

//箭头分页
function arrowChangePage() {
    if (event.target == document.getElementById("left_max_btn") && dialog.currentPage > 1) {
        dialog.currentPage--;
    } else if (event.target == document.getElementById("right_max_btn")) {
        dialog.currentPage++;
    }
    loadPlanChart();
    showCurPage();
    isPageArrowAvilable();
}

//分页箭头可用
function isPageArrowAvilable() {
    if (dialog.pageCount > dialog.currentPage) {
        $("#right_max_btn").unbind().bind('click', arrowChangePage);
        $("#right_max_btn").css("opacity", 1);
        $("#right_max_btn").css("cursor", 'pointer');
    } else {
        $("#right_max_btn").unbind('click', arrowChangePage);
        $("#right_max_btn").css("opacity", 0.3);
        $("#right_max_btn").css("cursor", 'default');
    }
    if (1 < dialog.currentPage) {
        $("#left_max_btn").unbind().bind('click', arrowChangePage);
        $("#left_max_btn").css("opacity", 1);
        $("#left_max_btn").css("cursor", 'pointer');
    } else {
        $("#left_max_btn").unbind('click', arrowChangePage);
        $("#left_max_btn").css("opacity", 0.3);
        $("#left_max_btn").css("cursor", 'default');
    }
}


//分页点点点
function showPageantion() {
    $("#pagenation").append("");
    var pagenationStr = "";
    if (dialog.pageCount == 1) {
        return;
    }
    for (var i = 0; i < dialog.pageCount; i++) {
        pagenationStr += "<li onclick='toPage(" + (i + 1) + ")' class='" + (i == 0 ? 'on' : '') + "' style='cursor: pointer'></li>";
    }
    $("#pagenation").html(pagenationStr);
    showCurPage();
}

//点击 分页li
function toPage(page) {
    dialog.currentPage = page;
    loadPlanChart();
}

//当前页选中效果
function showCurPage() {
    var lis = $("#pagenation li");
    $("#pagenation li").removeClass("on");
    $(lis[dialog.currentPage - 1]).addClass("on");
}
