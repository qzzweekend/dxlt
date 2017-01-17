//2016-11-12 ChuD; 等效小时、发电量排名弹出框

var dialog = {
    dateType: 3, //pr  1:日  2:月  3:年
    curtOrgId_refresh: "" //当前组织id，用于 定时刷新
};

$(function () {
    dialog.curtOrgId_refresh = $("#orgId").val();
    $(".close").click(function () {
        $(".Monitor_left_c3_highLt", parent.document).removeClass("Monitor_left_c3_highLt");
        window.parent.closeEqualHourFm();
    });
    $("#left_min_btn").unbind().bind('click', arrowChangeDate);
    $("#left_max_btn").unbind().bind('click', arrowChangeDate);
    //弹出页面中的点击
    /*$(".showm_top_left ul li").click(function(){
     $(this).addClass("on");
     $(this).siblings().removeClass("on");
     $(".showm_bottom div").hide();
     $(".showm_top_right ul").hide();

     if(this.id=='dxxs_li'){
     $(".showm_bottom .loadingDiv").show();
     $("#powerPlanAll").show();
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
    //$.ajax({
    //    type: "post",
    //    data: param,
    //    url: '../data/powerAction_getPowerPlan.action',
    //    async: true,
    //    dataType: "json",
    //    beforeSend: function () {
    //        //loading(obj);
    //    },
    //    success: function (data, s) {
    //        var object = parseJson(data);
    //        if (object != null) {
    //            log("getPowerPlan" + data);
    //            if ($(object).length > 0 && object.result_code == 1) {
    //                var result = object.result_data;
    //                var actualData = result.actual_energy;
    //                var newActualData = [];
    //                var xData = [];
    //                var completionRt = [];
    //                var planData = result.plan_energy;
    //                if (actualData.length == 0 && planData.length == 0) {
    //                    return;
    //                }
    //                var monthTotalPlan = result.month_plan;//月发电计划
    //                var averageDayPlan = getAvgDayPlan(monthTotalPlan, planData.length);//日发电计划：月发电计划除以本月天数
    //                var unit = result.actual_energy_unit;
    //                if (dialog.dateType == 2) {//日发电计划数组赋值
    //                    if (isNaN(averageDayPlan)) {
    //                        for (var i = 0; i < planData.length; i++) {
    //                            planData[i] = '--';
    //                        }
    //                    } else {
    //                        for (var i = 0; i < planData.length; i++) {
    //                            planData[i] = (averageDayPlan).toFixed(2);
    //                        }
    //                    }
    //                    var selectDate = $("#dateInput").val();
    //                    var date = new Date();
    //                    var year = date.getFullYear();
    //                    var month = date.getMonth() + 1;
    //                    if (month >= 1 && month <= 9) {
    //                        month = "0" + month;
    //                    }
    //                    if ((year + "/" + month) == selectDate) {//选择的时间是当前月份，截取数据到前一天
    //                        var strDate = date.getDate();
    //                        var today_power = $("#currentPowerValue_virgin", parent.document).val();//今日发电
    //                        actualData[strDate - 1] = today_power;//补当前实际发电量
    //                        actualData = actualData.slice(0, strDate);
    //                        planData = planData.slice(0, strDate);
    //                    }
    //
    //                    actualData = addUpArr(actualData);
    //                    planData = addUpArr(planData);
    //                }
    //                var maxPower = planData.max();//当月最大电量
    //                newActualData = actualData;
    //                if (actualData.length > 0 && $.isNumeric(maxPower) && (parseFloat(maxPower) > 10000 || parseFloat(averageDayPlan) > 10000) && unit == LANG["degree"]) {//单位转换
    //                    newActualData = [];
    //                    unit = LANG["tenThousandDegree"];
    //                    for (var i = 0; i < actualData.length; i++) {
    //                        if ($.isNumeric(actualData[i])) {
    //                            actualData[i] = (actualData[i] / 10000).toFixed(2);
    //                            newActualData.push(actualData[i]);
    //                        } else {
    //                            newActualData.push("--");
    //                        }
    //                    }
    //                    for (var i = 0; i < planData.length; i++) {
    //                        //if(dialog.dateType == 2){
    //                        //    planData[i] = (averageDayPlan / 10000).toFixed(2);
    //                        //}else{
    //                        planData[i] = (planData[i] / 10000).toFixed(2);
    //                        //}
    //                    }
    //                    monthTotalPlan = monthTotalPlan / 10000;
    //                }
    //                //完成率
    //                if (dialog.dateType == 2) {//月完成率
    //                    for (var i = 0; i < planData.length; i++) {
    //                        xData.push(i + 1);
    //                        completionRt.push(CalculatedCompletionRate(newActualData[i], planData[i]));
    //                    }
    //                } else {
    //                    var temAddedArr = addUpArr(newActualData);
    //                    var temSum = addUpArr(planData);
    //                    for (var i = 0; i < planData.length; i++) {
    //                        xData.push(i + 1);
    //                        //completionRt.push(CalculatedCompletionRate(newActualData[i], planData[i]));
    //                        completionRt.push(CalculatedCompletionRate(temAddedArr[i], temSum[i]));
    //                    }
    //                }
    //                var bl = Math.round(sumArrayData(actualData) / sumArrayData(planData) * 100);
    //                $("#nwcl").html(LANG["yearFinish"] + "  " + ($.isNumeric(bl) ? bl : '--') + "%");
    //                unit = replaceUnit_scrn4Dialog(unit);
    //
    //                drawPowerPlanChart(dealEchartBarArr(newActualData), dealEchartBarArr(planData), unit, xData, dealEchartLineArr(completionRt));
    //            }
    //        } else {
    //            log("获取计划发电数据失败");
    //        }
    //    },
    //    error: function () {
    //        $(".showm_bottom .loadingDiv").hide();
    //    }
    //})
}

function getAvgDayPlan(total, days) {
    if ($.isNumeric(total) && $.isNumeric(days)) {
        return parseFloat((total / days).toFixed(2));
    }
    return "--"
}

//等效小时弹出chart
function drawPowerPlanChart(actualData, planData, unit, xData, completionRt) {
    var lengendName1 = LANG["1_1_planned_genarate"];
    var lengendName2 = LANG["1_1_actual_genarate"];
    if (dialog.dateType == 2) {
        lengendName1 = LANG["1_1_total_planned_genarate"];
        lengendName2 = LANG["1_1_total_actual_genarate"];
    }
    var myDate = new Date();
    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (data) {
                var str = "<p align='left'>" + LANG["TIME"] + "：" + myDate.getFullYear() + "/" + (dialog.dateType == 3 ? "" : ($("#dateInput").val().substring(5, 7) + "/")) + dealDate(data[0].name) + "</p>";
                for (var i = 0; i < data.length; i++) {
                    if (lengendName1 == data[i].seriesName || lengendName2 == data[i].seriesName) {
                        str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + unit;
                    } else {
                        str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + "%";
                    }
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
            data: [lengendName1, lengendName2, LANG["1_1_planned_completion_rate"]]
        },
        // 网格
        grid: {
            y: '65',
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
                        color: '#FFFFFF'
                    }
                },
                splitLine: {
                    show: false
                },
                boundaryGap: [0, 0.01],
                data: xData
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: unit,
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
                nameTextStyle: {
                    fontFamily: 'Microsoft YaHei'
                },
                min: 0,
                axisTick: axisTickObj
            },
            {
                type: 'value',
                name: "（%）",
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#ffffff'
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#ffffff'
                    }
                },
                nameTextStyle: {
                    fontFamily: 'Microsoft YaHei'
                },
                min: 0,
                splitNumber: 6,
                axisTick: axisTickObj
            }
        ],
        series: [
            {
                name: lengendName1,
                type: 'bar',
                yAxisIndex: 0,
                barMaxWidth: 20,
                itemStyle: {
                    normal: {
                        color: '#0096ff',
                    }
                },
                data: planData
            },
            {
                name: lengendName2,
                type: 'bar',
                yAxisIndex: 0,
                barMaxWidth: 20,
                itemStyle: {
                    normal: {
                        color: '#00f4fe',
                    }
                },
                data: actualData
            },
            {
                name: LANG["1_1_planned_completion_rate"],
                type: 'line',
                yAxisIndex: 1,
                itemStyle: {
                    normal: {
                        color: '#fdd600'
                    }
                },
                data: completionRt
            }
        ]

    };
    var ptChart = echarts.init(document.getElementById('powerPlanAll'));
    ptChart.setOption(option);
    $(".showm_bottom .loadingDiv").hide();
    $("#powerPlanAll div").show();
}

function dealDate(val) {
    var resVal = val >= 10 ? val : ("0" + val);
    return resVal;
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
        $("#right_max_btn").unbind().bind('click', arrowChangeDate);
        $("#right_max_btn").css("opacity", 1);
    } else {
        if (isInner) {
            $("#inner_right_min_btn").unbind('click', innerArrowChangeDate);
            $("#inner_right_min_btn").css("opacity", 0.3);
        }
        $("#right_min_btn").unbind('click', arrowChangeDate);
        $("#right_min_btn").css("opacity", 0.3);
        $("#right_max_btn").unbind('click', arrowChangeDate);
        $("#right_max_btn").css("opacity", 0.3);
    }
}

//点击日期 箭头
function arrowChangeDate() {
    var temdate = "";
    var val = 0;
    if (event.target == document.getElementById("left_min_btn") || event.target == document.getElementById("left_max_btn")) {//判断事件对象，左键头时间向前
        val = -1;
    } else if (event.target == document.getElementById("right_min_btn") || event.target == document.getElementById("right_max_btn")) {
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


new Vue({
    el:'#powerPlan',
    data:{
        myDate: new Date()
    },
    methods:{
        //当年发电计划发送请求 getYearPowerPlan
        loadPlanChart: function () {
            var _this = this;
            //var param = {};
            //param["date"] = myDate.getFullYear();
            //param["date_type"] = "1";//年份
            //param["ps_id"] = screen3.ps_id;
            var endDateStr = vlm.Utils.nextYear();
            var startDateStr = vlm.Utils.currentYear();
            var Parameters = {
                "parameters": {
                    "datatype": "year",
                    "sorttype": "1",
                    "sort": "1",
                    "starttime": startDateStr,
                    "endtime": endDateStr,
                    "topn": "7",
                    "stationid": ""
                },
                "foreEndType": 2,
                "code": "20000004"
            };
            vlm.loadJson("", JSON.stringify(Parameters), function (res) {
                //动态plan
                if (res.success) {
                    var result = res.data;
                    var newActualData = [], planData = [], unit = result.fd_unit,
                        planArray = result.datas, actualArray = result.datayears;
                    _this.fd_scheduledata = actualArray[0].fd_scheduledata+'%';
                    for (var i = 0; i < planArray.length; i++) {
                        planData.push(planArray[i].fd_sched_power_mon);
                        newActualData.push(planArray[i].datapower);
                    }
                    _this.drawPowerPlanChart(dealEchartBarArr(newActualData), dealEchartBarArr(planData), unit);

                } else {
                    alert(res.message);
                }
            });
        },
        //绘制当年发电计划chart
        drawPowerPlanChart: function (actualData, planData, unit) {
            //完成率
            var completionRt = [], _this = this;
            var temArr = addUpArr(actualData);
            var temSum = addUpArr(planData);
            var allActual = sumArrayData(actualData);
            var allPlan = 0;
            for (var i = 0; i < planData.length; i++) {
                var plan = isNotNull(planData[i]) ? planData[i] : 0;
                allPlan = allPlan + parseFloat(plan);
                completionRt.push(CalculatedCompletionRate(temArr[i], temSum[i]));
            }
            completionRt = dealEchartLineArr(completionRt);

            var yearRat = isNotNull(allPlan) ? (toFix(allActual * 100 / allPlan, 2) + "%") : "--";//年完成率
            $("#yearCompleteRate").html(yearRat);
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
                        var year = _this.myDate.getFullYear();
                        var str = year + "/" + data[1].name;
                        for (var i = 0; i < data.length; i++) {
                            if (LANG["actualGeneration"] == data[i].seriesName || LANG["planGeneration"] == data[i].seriesName) {
                                str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + unit;
                            } else {
                                str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + "%";
                            }
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
                    y: '0',                  // 垂直安放位置，默认为全图顶端，可选为：
                    // 'top' ¦ 'bottom' ¦ 'center'
                    // ¦ {number}（y坐标，单位px）
                    textStyle: {
                        color: '#fff',
                        fontFamily: 'Microsoft YaHei'
                    },
                    data: [LANG["planGeneration"], LANG["actualGeneration"], LANG["1_1_planned_completion_rate"]]
                },
                // 网格
                grid: {
                    y: '65',
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
                                color: '#fff'
                            }
                        },
                        axisLabel: {
                            show: true,
                            rotate: 0,//逆时针显示标签，不让文字叠加
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        splitLine: {
                            show: false
                        },
                        boundaryGap: [0, 0.01],
                        data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: unit,
                        axisLine: {
                            show: true,
                            lineStyle: { // 属性lineStyle控制线条样式
                                color: '#fff'
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        splitLine: {
                            show: false
                        },
                        nameTextStyle: {
                            fontFamily: 'Microsoft YaHei'
                        },
                        axisTick: axisTickObj
                    },
                    {
                        type: 'value',
                        name: "（%）",
                        splitLine: {
                            show: false
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        axisLine: {
                            show: true,
                            lineStyle: { // 属性lineStyle控制线条样式
                                color: '#fff'
                            }
                        },
                        min: 0,
                        max: 120,
                        splitNumber: 6,
                        nameTextStyle: {
                            fontFamily: 'Microsoft YaHei'
                        },
                        axisTick: axisTickObj
                    }
                ],
                series: [
                    {
                        name: LANG["planGeneration"],
                        type: 'bar',
                        barMaxWidth: 20,
                        smooth: true,
                        itemStyle: {
                            normal: {
                                color: '#0096ff',
                            }
                        },
                        data: planData
                    },
                    {
                        name: LANG["actualGeneration"],
                        type: 'bar',
                        barMaxWidth: 20,
                        smooth: true,
                        itemStyle: {
                            normal: {
                                color: '#00f4fe',
                            }
                        },
                        symbol: 'none',
                        data: actualData
                    },
                    {
                        name: LANG["1_1_planned_completion_rate"],
                        type: 'line',
                        yAxisIndex: 1,
                        smooth: true,
                        itemStyle: {
                            normal: {
                                color: '#fdd600',
                                lineStyle: {        // 系列级个性化折线样式
                                    width: 2
                                }
                            }
                        },
                        data: completionRt
                    }
                ]

            };
            require.config({
                paths: {
                    'echarts': '../js/plugin/echarts/build/dist'
                }
            });
            require([
                    'echarts',
                    'echarts/chart/line',
                    'echarts/chart/bar'
                ],
                function (ec) {
                    $('.loadingDiv').hide();
                    ptChart = ec.init(document.getElementById('powerPlanAll'));
                    ptChart.setOption(option);
                });
        }
    },
    mounted:function(){
        this.loadPlanChart();
    }
});
