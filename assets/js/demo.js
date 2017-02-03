
var psObj = {
    psIdArr: [],
    psSchemeArr: [],
    powerChart: null,
    planChart: null,
    capacity: null
};

//加载发电趋势图表
function loadPowerChart_day(val) {
    var param = {};
    param["type"] = (val ? val : "1");//1:日; 3:年
    param["service"] = "energyTrend";
    param["req"] = "app";
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
            if(val == 1){
                dealPowerData_day(data);
            }else{
                dealPowerData_year(data);
            }
        }
    })
}

var actualData = null;//历史发电数据缓存
var myDate = new Date();

//加载发电趋势图表
function loadPowerChart() {
    var param = {};
    var month = myDate.getMonth();
    if(month>8){
        month = month+1;
    } else {
        month = "0"+(month+1);
    }
    param["date"] = myDate.getFullYear() + "" + month;
    //param["ps_id"] = screen3.ps_id;
    param["date_type"] = "2";//月
    //if (actualData != null) {
    //    dealPowerData(actualData);
    //} else {
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_getPowerPlan.action',
        async: true,

        dataType: "json",
        beforeSend: function () {
            //loading(obj);
        },
        success: function (data, s) {
            actualData = data;
            dealPowerData(data);
        }
    });
    //}

}

function dealPowerData(data) {//解析发电趋势数据
    var object = parseJson(data);
    if (data != null) {
        if ($(object).length > 0 && object.result_code == 1) {
            var result = object.result_data;
            var todayPower = parseFloat($("#currentPowerValue").val()).toFixed(2);
            //if(ps_id){
            //    todayPower = todayPsGenPower;
            //}
            var todayPower_unit = $("#currentPowerUnit").val();
            var unit = result.actual_energy_unit;
            var actualData = result.actual_energy;
            var date = myDate.getDate();
            var dateCount = getDays();
            var dateDate = [];
            var totalPower = 0;
            var istrue = false;
            if(!actualData || actualData.length==0){//每月1号的时候无数据
                unit = todayPower_unit;
                if (todayPower_unit==LANG["degree"]&&parseInt(todayPower / 10000) > 0) {
                    todayPower_unit = LANG["tenThousandDegree"];
                    unit = LANG["tenThousandDegree"];
                    todayPower = parseFloat(todayPower / 10000).toFixed(2);
                }
            } else {
                var maxPower = actualData.max();//当月最大电量
                if(isNotNull(maxPower)){
                    if(parseInt(maxPower / 10000) > 0){
                        for (var i = 0; i < actualData.length; i++) {
                            if($.isNumeric(actualData[i])){
                                actualData[i] = parseFloat(actualData[i] / 10000).toFixed(2);
                            }
                        }
                        if (todayPower_unit == LANG["degree"]) {
                            todayPower = parseFloat(todayPower / 10000).toFixed(2);
                        }
                        unit = LANG["tenThousandDegree"]
                    }else if(todayPower_unit == LANG["tenThousandDegree"]){
                        for (var i = 0; i < actualData.length; i++) {
                            if($.isNumeric(actualData[i])){
                                if(lang=="zh_CN" || lang=="" || null == lang){
                                    actualData[i] = parseFloat(actualData[i] / 10000).toFixed(2);
                                }else{
                                    actualData[i] = parseFloat(actualData[i] / 1000).toFixed(2);
                                }
                            }
                        }
                        unit = LANG["tenThousandDegree"];
                    }
                } else {
                    if (todayPower_unit == LANG["tenThousandDegree"]) {
                        for (var i = 0; i < actualData.length; i++) {
                            if($.isNumeric(actualData[i])){
                                actualData[i] = parseFloat(actualData[i] / 10000).toFixed(2);
                            }
                        }
                    } else if (parseInt(todayPower / 10000) > 0) {
                        todayPower_unit = LANG["tenThousandDegree"];
                        todayPower = parseFloat(todayPower / 10000).toFixed(2);
                        for (var i = 0; i < actualData.length; i++) {
                            if($.isNumeric(actualData[i])){
                                actualData[i] = parseFloat(actualData[i] / 10000).toFixed(2);
                            }
                        }
                    }
                    unit = todayPower_unit;
                }
            }
            unit = replaceUnit(unit);
            totalPower = sumArrayData(actualData);
            totalPower = parseFloat(totalPower) + parseFloat(todayPower);
            $("#zfdl").html(LANG["yy1.MonthlyPowerGeneration"] + '<span>' + totalPower.toFixed(2) + '</span>' + unit);
            var actualData_today = [];
            for (var i = 0; i < dateCount; i++) {
                if(i>=actualData.length){
                    actualData.push(0);
                }
                if (date - 1 == i) {//今日数据
                    var object = {
                        value: todayPower,
                        itemStyle: {
                            normal: {
                                label: {

                                    show: false,
                                    position: 'top',
                                    formatter: function (data) {
                                        return data.value;
                                    }
                                }
                            }
                        }
                    };

                    actualData_today.push(object);
                } else {
                    actualData_today.push(0);
                }
                dateDate.push(i + 1);
            }

            drawPowerChart(actualData, actualData_today, dateDate, unit);
        }
    } else {
        log("获取计划发电数据失败");
    }
}

function drawPowerChart(actualData, actualData_today, dateDate, unit) {
    var option = {
        title: {
            show: false,
            text: LANG["yy1.PowerGenerationTrendsM"],
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
                var year=myDate.getFullYear();
                var month = myDate.getMonth()+1;
                var date = parseInt(myDate.getDate());
                if (date == data[1].name) {//今日
                    return year+"/"+month+"/" + data[1].name + "<br>" +data[1].seriesName + "：" + data[1].value + unit;
                }
                return year+"/"+month+"/" + data[1].name + "<br>" + data[0].seriesName + "：" + data[0].value + unit;
            }
        },
        legend: {
            orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
            // 'horizontal' ¦ 'vertical'
            x: '100px',               // 水平安放位置，默认为全图居中，可选为：
            // 'center' ¦ 'left' ¦ 'right'
            // ¦ {number}（x坐标，单位px）
            y: '10',                  // 垂直安放位置，默认为全图顶端，可选为：
            // 'top' ¦ 'bottom' ¦ 'center'
            // ¦ {number}（y坐标，单位px）
            textStyle: {
                color: '#FFFFFF',
                fontFamily : 'Microsoft YaHei'
            },
            data: [LANG["yy1.PowerGeneration"], LANG["todayGeneration"]]
        },
        // 网格
        grid: {
            x: 45,
            y: 35,
            x2: 30,
            y2: 20,
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
                        color: '#ffffff'
                    }
                },
                axisLabel: {
                    show: true,
                    //interval:0,// 是否显示全部标签，0显示
                    rotate: 0,//逆时针显示标签，不让文字叠加
                    textStyle: {
                        color: '#ffffff'
                    }
                },
                splitLine: {
                    show: false
                },

                data: dateDate
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: unit,
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
                nameTextStyle:{
                    fontFamily : 'Microsoft YaHei'
                }
            }
        ],
        series: [
            {
                name: LANG["yy1.PowerGeneration"],
                type: 'bar',
                stack: 'sum',
                barMaxWidth: 6,
                itemStyle: {
                    normal: {
                        color: '#3EB5FF'
                    }
                },
                data: actualData
            },
            {
                name: LANG["todayGeneration"],
                type: 'bar',
                stack: 'sum',
                itemStyle: {
                    normal: {
                        color: '#9DED7C'
                    }
                },
                data: actualData_today
            }
        ]
    };
    if(psObj.powerChart != undefined && psObj.powerChart!=null){
        psObj.powerChart.clear();
    }else{
        psObj.powerChart = echarts.init(document.getElementById('power'));
    }
    psObj.powerChart.setOption(option);
    $(".Mc4_con .loadingDiv").hide();
}

/*性能排名*/
function loadCapacityChart() {
    $(".capacity_btn").removeClass("on");
    if(order) {
        $(".capacity_btn:eq(0)").addClass("on");
    }else{
        $(".capacity_btn:eq(1)").addClass("on");
    }
    var param = {};
    param["date_type"] = "2";
    param["req"] = "app";
    param["service"] = "queryPsPrByDate";
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_loaddata.action',
        async: true,
        dataType: "json",
        beforeSend: function () {
            psObj.psIdArr = [];
            psObj.psSchemeArr = [];
        },
        success: function (data) {
            var object = parseJson(data);
            if (object != null) {
                log("getPowerCapacity:" + data);
                if ($(object).length > 0 && object.result_code == 1) {
                    var result = object.result_data;
                    var listData = result.list;
                    if (listData == null || listData == "" || listData.length == 0) {
                        log("获取性能排名数据为空");
                        return;
                    }
                    var xdata = [];
                    var ydata1 = [];
                    var ydata2 = [];
                    var length = listData.length;
                    if (length > 7) {
                        length = 7;
                    }
                    listData = sortCapacityArr(listData);
                    for (var i = 0; i < length; i++) {
                        var ps_name = listData[i].ps_name;
                        xdata.push(ps_name);
                        var ps_id = listData[i].ps_id;
                        psObj.psIdArr.push(ps_id);
                        psObj.psSchemeArr.push(listData[i].sys_scheme);
                        var cap_value = (listData[i].pr);
                        if(cap_value==null||cap_value==undefined||!$.isNumeric(cap_value)){
                            ydata1.push(0);
                            ydata2.push(100);
                        } else {
                            cap_value = parseInt(cap_value);
                            ydata1.push(cap_value);
                            ydata2.push(100 - cap_value);
                        }
                    }
                    drawCapacityChart(xdata, ydata1, ydata2);
                }
            } else {
                log("获取性能排名数据失败");
            }
        }
    });
}

function sortCapacityArr(arr){
    if(arr && arr.length > 0) {
        if(order){
            for (var i = 0; i < arr.length - 1; i++) {
                var index = i;
                for (var j = i + 1; j < arr.length; j++) {
                    var temVal = arr[index].pr;
                    var curVal = arr[j].pr;
                    if (($.isNumeric(temVal) && $.isNumeric(curVal) && curVal > temVal) || (!$.isNumeric(temVal)) && $.isNumeric(curVal)) {
                        index = j;
                    }
                }
                var tem = arr[index];
                arr[index] = arr[i];
                arr[i] = tem;
            }
        }else{
            for(var i = 0; i < arr.length - 1; i ++){
                var index = i;
                for(var j = i + 1; j < arr.length; j ++){
                    var temVal = arr[index].pr;
                    var curVal = arr[j].pr;
                    if(($.isNumeric(temVal) && $.isNumeric(curVal) && curVal < temVal) || (($.isNumeric(temVal)) && !$.isNumeric(curVal))){
                        index = j;
                    }
                }
                var tem = arr[index];
                arr[index] = arr[i];
                arr[i] = tem;
            }
        }
    }
    return arr;
}


//加载性能排名图表
function drawCapacityChart(xdata, ydata1, ydata2) {
    var option = {
        title: {
            show: false,
            text: LANG["yy1.PerformanceRankingM"],
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
            formatter: function (param) {
                return param[0].name + ":" + param[0].value + "%";
            }
        },
        legend: {
            show: false,
            orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
            // 'horizontal' ¦ 'vertical'
            x: '290',               // 水平安放位置，默认为全图居中，可选为：
            // 'center' ¦ 'left' ¦ 'right'
            // ¦ {number}（x坐标，单位px）
            y: '20',                  // 垂直安放位置，默认为全图顶端，可选为：
            // 'top' ¦ 'bottom' ¦ 'center'
            // ¦ {number}（y坐标，单位px）
            textStyle: {
                color: '#FFFFFF',
                fontFamily : 'Microsoft YaHei'
            },
            data: ['PR']
        },
        // 网格
        grid: {
            x: 30,
            y: 10,
            x2: 0,
            y2: 40,
            width: 340,
            height: 170,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc'
        },

        calculable: true,
        xAxis: [
            {
                type: 'category',
                axisLine: {
                    show: false,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#ffffff'
                    }
                },
                axisLabel: {
                    show: true,
                    rotate: 0,//逆时针显示标签，不让文字叠加
                    interval: 0,
                    textStyle: {
                        color: '#ffffff',
                        fontFamily : 'Microsoft YaHei'
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                boundaryGap: [0, 0.01],

                data: xdata//['荣威\n地面', '大众\n一厂', '大众\n总办', '荣威\n屋顶', '大众\n三厂', '荣威\n车棚', '设计\n中心']
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLine: {
                    show: false,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#ffffff'
                    }
                },
                axisLabel: {
                    show: false,
                    textStyle: {
                        color: '#ffffff'
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                boundaryGap: [0, 0.01]
            }
        ],
        series: [
            {
                name: 'PR',
                type: 'bar',
                stack: 'a',
                itemStyle: {
                    normal: {
                        color: "#139FF6"
                    }
                },
                barMaxWidth:30,
                data: ydata1
            },
            {
                name: '',
                type: 'bar',
                stack: 'a',
                itemStyle: {
                    normal: {
                        color: "#123249",//柱状图颜色随机
                        label: {
                            show: true,
                            position: 'top',
                            formatter: function (params) {
                                return (100 - params.value) + "%";
                            },
                            textStyle: {
                                color: '#00F3FF'
                            }
                        }
                    },

                },
                barMaxWidth:30,
                data: ydata2
            }
        ]
    };

    if(psObj.capacity != undefined && psObj.capacity!=null){
        psObj.capacity.clear();
        psObj.capacity = echarts.init(document.getElementById('capacity'));
    }else{
        psObj.capacity = echarts.init(document.getElementById('capacity'));
    }
    psObj.capacity.setOption(option);
    psObj.capacity.on('click', function(params){
        var index = params.dataIndex;
        event.stopPropagation();
        screen3.ps_id = psObj.psIdArr[index];
        screen3.psScheme = psObj.psSchemeArr[index];
        $("#grayLayer").addClass("grayLayer");
        detailInfo = true;
        psDetailInfo();
    });
}


//加载发电计划 getYearPowerPlan
function loadPlanChart() {
    var param = {};
    var myDate = new Date();
    param["date"] = myDate.getFullYear();
    param["date_type"] = "1";//年份
    //param["ps_id"] = screen3.ps_id;
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_getPowerPlan.action',
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
                    var actualData = result.actual_energy;
                    var newActualData = [];
                    var planData = result.plan_energy;
                    if (actualData.length == 0 && planData.length == 0) {
                        return;
                    }
                    var unit = result.plan_energy_unit;
                    var maxPower = planData.max();//当月最大电量
                    if (actualData.length > 0 && $.isNumeric(maxPower) && parseFloat(maxPower) > 10000 && unit == LANG["degree"]) {
                        unit = LANG["tenThousandDegree"];
                        for (var i = 0; i < actualData.length; i++) {
                            if($.isNumeric(actualData[i])){
                                actualData[i] = (actualData[i] / 10000).toFixed(2);
                                newActualData.push(actualData[i]);
                            }else{
                                newActualData.push("--");
                            }
                        }
                        for (var i = 0; i < planData.length; i++) {
                            planData[i] = (planData[i] / 10000).toFixed(2);
                        }
                    }
                    var bl = Math.round(sumArrayData(actualData) / sumArrayData(planData) * 100);
                    //newActualData = newActualData.slice(0,myDate.getMonth()+1);
                    $("#nwcl").html(LANG["yearFinish"] + "  " + ($.isNumeric(bl)?bl:'--') + "%");
                    unit = replaceUnit(unit);
                    drawPowerPlanChart(dealEchartBarArr(newActualData), dealEchartBarArr(planData), unit);
                }
            } else {
                log("获取计划发电数据失败");
            }
        }
    })
}

function drawPowerPlanChart(actualData, planData, unit) {
    //完成率
    var completionRt = [];
    var temArr = addUpArr(actualData);
    var temSum = addUpArr_curMonth(planData);
    var allActual = sumArrayData(actualData);
    var allPlan = 0;
    var now = new Date();
    var month = now.getMonth() + 1;
    for(var i = 0; i < planData.length && i < month; i ++){
        var plan = isNotNull(planData[i])? planData[i] : 0;
        allPlan = allPlan + parseFloat(plan);
        completionRt.push(CalculatedCompletionRate(temArr[i], temSum[i]));
    }
    /*
     for(var i = 0; i < planData.length; i ++){
     var plan = isNotNull(planData[i])? planData[i] : 0;
     allPlan = allPlan + parseFloat(plan);
     completionRt.push(CalculatedCompletionRate(temArr[i], temSum[i]));
     }*/
    completionRt = dealEchartLineArr(completionRt);

    var yearRat = isNotNull(allPlan)? (toFix(allActual*100/allPlan,2)+"%") : "--";//年完成率
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
                var year=myDate.getFullYear();
                var dataName = data[0].name;
                if(typeof dataName == 'undefined' || dataName == null || dataName == ""){
                    for(var i = 0; i < data.length; i ++) {
                        var temDname = data[i].name;
                        if(typeof temDname !== 'undefined' && temDname !== null && temDname !== ""){
                            dataName = temDname;
                            break;
                        }
                    }
                }
                var str = year+"/"+ dataName;
                for(var i = 0; i < data.length; i ++) {
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
            y: '-3',                  // 垂直安放位置，默认为全图顶端，可选为：
            // 'top' ¦ 'bottom' ¦ 'center'
            // ¦ {number}（y坐标，单位px）
            textStyle: {
                color: '#FFFFFF',
                fontFamily : 'Microsoft YaHei'
            },
            data: [LANG["planGeneration"], LANG["actualGeneration"],LANG["1_1_planned_completion_rate"]]
        },
        // 网格
        grid: {
            x: 40,
            y: 45,
            x2: 35,
            y2: 30,
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
                boundaryGap: [0,0.01],
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
                nameTextStyle:{
                    fontFamily : 'Microsoft YaHei'
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
                        color: '#ffffff'
                    }
                },
                axisLine: {
                    show: true,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#ffffff'
                    }
                },
                min: 0,
                max: 120,
                splitNumber: 6,
                nameTextStyle:{
                    fontFamily : 'Microsoft YaHei'
                },
                axisTick: axisTickObj
            }
        ],
        series: [
            {
                name: LANG["planGeneration"],
                type: 'bar',
                barMaxWidth: 6,
                smooth: true,
                itemStyle: { normal: {
                    color: '#0096ff',
                }},
                data: planData
            },
            {
                name: LANG["actualGeneration"],
                type: 'bar',
                barMaxWidth: 6,
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
                itemStyle: { normal: {
                    color: '#fdd600',
                    lineStyle: {        // 系列级个性化折线样式
                        width: 2
                    }
                }},
                data: completionRt
            }
        ]

    };
    if(psObj.planChart != undefined && psObj.planChart!=null){
        psObj.planChart.clear();
    }else{
        psObj.planChart = echarts.init(document.getElementById('plan'));
    }
    psObj.planChart.setOption(option);
}

function dealPowerData_day(data) {//解析发电趋势数据(日)
    var object = parseJson(data);
    if (data != null  && object.result_code != -1) {
        if ($(object).length > 0 && object.result_code == 1) {
            var result = object.result_data;
            var unit = replaceUnit(result.powerMap.units);
            var actualData = result.powerMap.valStr.split(",");
            var glData = result.energyMap.valStr.split(",");//功率
            var glUnit = replaceUnit(result.energyunit);//功率单位
            var dateDate = result.powerMap.dates;

            var maxGen = actualData.max();//当月最大电量
            if((maxGen - 10000) > 0 && (LANG["degree"] == unit || 'kWh' == unit)){
                for (var i = 0; i < actualData.length; i++) {
                    if($.isNumeric(actualData[i])){
                        actualData[i] = parseFloat(actualData[i] / 10000).toFixed(2);
                    }
                }
                unit = LANG["tenThousandDegree"]
            }

            drawDayChart(actualData, glData, dateDate, unit,glUnit);
        }
    } else {
        drawDayChart(['--'], ['--'], ['--'], '','');
        log("获取计划发电数据失败");
    }
}

function dealPowerData_year(data) {//解析发电趋势数据(日)
    var object = parseJson(data);
    if (data != null && object.result_code != -1) {
        if ($(object).length > 0 && object.result_code == 1) {
            var result = object.result_data;
            var unit = replaceUnit(result.echartunit);
            var actualData = result.powerMap.valStr.split(",");
            var glData = [];//功率
            var glUnit = replaceUnit(result.energyunit);//功率单位
            var dateDate = result.powerMap.dates;
            //for(var i = 0; i < dateDate.length; i ++){
            //    dateDate[i] = dateDate[i].replace("-", "/")
            //}
            drawYearChart(actualData, glData, dateDate, unit,glUnit);
        }
    } else {
        drawDayChart(['--'], ['--'], ['--'], '','');
        log("获取计划发电数据失败");
    }
}

//日发电趋势
function drawDayChart(actualDataDay, glData, dateDate, punit,glUnit){
    glData = dealArray(glData);
    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (data) {
                var restStr = "";
                for(var i = 0; i < data.length; i ++){
                    var obj = data[i];
                    if(i == 0){
                        restStr += obj.name + "<br>";
                    }
                    restStr += obj.seriesName + ":" + dealEchartToolTip(obj.data) + (LANG["yy1.PowerGeneration"] == obj.seriesName ? punit: glUnit)  + "<br>";
                }
                return restStr;
            }
        },
        legend: {
            orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
            // 'horizontal' ¦ 'vertical'
            x: '100px',               // 水平安放位置，默认为全图居中，可选为：
            // 'center' ¦ 'left' ¦ 'right'
            // ¦ {number}（x坐标，单位px）
            y: '10',                  // 垂直安放位置，默认为全图顶端，可选为：
            // 'top' ¦ 'bottom' ¦ 'center'
            // ¦ {number}（y坐标，单位px）
            textStyle: {
                color: '#FFFFFF',
                fontFamily : 'Microsoft YaHei'
            },
            data: [LANG["yy1.powerful"], LANG["yy1.PowerGeneration"]]
        },
        // 网格
        grid: {
            x: 45,
            y: 45,
            x2: 40,
            y2: 25,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc'
        },
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
                boundaryGap: [0,0.01],
                data: dateDate
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: punit,
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
                nameTextStyle:{
                    fontFamily : 'Microsoft YaHei'
                }
            },
            {
                type: 'value',
                name: glUnit,
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
                nameTextStyle:{
                    fontFamily : 'Microsoft YaHei'
                }
            }
        ],
        series: [
            {
                name: LANG["yy1.PowerGeneration"],
                type: 'bar',
                smooth: true,
                yAxisIndex: 0,
                barWidth: 3,
                barMaxWidth: 6,
                itemStyle: {
                    normal: {
                        color: '#00f4fe',
                        lineStyle: {        // 系列级个性化折线样式
                            width: 1
                        }
                    }
                },
                symbol: 'none',
                yAxisIndex: 0,
                data: actualDataDay
            },
            {
                name: LANG["yy1.powerful"],
                type: 'line',
                smooth: false,
                itemStyle: { normal: {
                    color: 'yellow',//'#0096ff',
                    lineStyle: {        // 系列级个性化折线样式
                        width: 3
                    }
                }},
                yAxisIndex: 1,
                data: glData
            }
        ]

    };
    if(psObj.powerChart != undefined && psObj.powerChart!=null){
        psObj.powerChart.clear();
    }else{
        psObj.powerChart = echarts.init(document.getElementById('power'));
    }
    psObj.powerChart.setOption(option);
    $(".Mc4_con .loadingDiv").hide();
}


//日发电趋势
function drawYearChart(actualDataDay, glData, dateDate, punit,glUnit){
    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (data) {
                var restStr = "";
                for(var i = 0; i < data.length; i ++){
                    var obj = data[i];
                    restStr += obj.name + "<br>";
                    restStr += LANG["yy1.PowerGeneration"] + ":" + obj.data + punit  + "<br>";
                }
                return restStr;
            }
        },
        legend: {
            orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
            // 'horizontal' ¦ 'vertical'
            x: '100px',               // 水平安放位置，默认为全图居中，可选为：
            // 'center' ¦ 'left' ¦ 'right'
            // ¦ {number}（x坐标，单位px）
            y: '10',                  // 垂直安放位置，默认为全图顶端，可选为：
            // 'top' ¦ 'bottom' ¦ 'center'
            // ¦ {number}（y坐标，单位px）
            textStyle: {
                color: '#FFFFFF',
                fontFamily : 'Microsoft YaHei'
            },
            data: [LANG["yy1.PowerGeneration"]]
        },
        // 网格
        grid: {
            x: 45,
            y: 35,
            x2: 10,
            y2: 20,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc'
        },
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
                boundaryGap: [0,0.01],
                data: dateDate
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: punit,
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
                nameTextStyle:{
                    fontFamily : 'Microsoft YaHei'
                }
            }
        ],
        series: [
            {
                name: LANG["yy1.PowerGeneration"],
                type: 'bar',
                smooth: true,
                yAxisIndex: 0,
                barWidth: 12,
                barMaxWidth: 30,
                itemStyle: {
                    normal: {
                        color: '#00f4fe',
                        lineStyle: {        // 系列级个性化折线样式
                            width: 1
                        }
                    }	},
                symbol: 'none',
                data: actualDataDay
            }
        ]

    };
    if(psObj.powerChart != undefined && psObj.powerChart!=null){
        psObj.powerChart.clear();
    }else{
        psObj.powerChart = echarts.init(document.getElementById('power'));
    }
    psObj.powerChart.setOption(option);
    $(".Mc4_con .loadingDiv").hide();
}

//获取本月天数
function getDays() {
//构造当前日期对象
    var date = new Date();

//获取年份
    var year = date.getFullYear();

//获取当前月份
    var mouth = date.getMonth() + 1;

//定义当月的天数；
    var days;

//当月份为二月时，根据闰年还是非闰年判断天数
    if (mouth == 2) {
        days = year % 4 == 0 ? 29 : 28;

    }
    else if (mouth == 1 || mouth == 3 || mouth == 5 || mouth == 7 || mouth == 8 || mouth == 10 || mouth == 12) {
        //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
        days = 31;
    }
    else {
        //其他月份，天数为：30.
        days = 30;

    }
    return days;
}

//合计数组的值
function sumArrayData(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        if($.isNumeric(array[i])){
            sum += parseFloat(array[i]);
        }
    }
    return sum;
}

Array.prototype.max = function() {
    var max = parseInt($.isNumeric(this[0])?this[0]:0);
    var len = this.length;
    for (var i = 1; i < len; i++){
        var v = parseInt($.isNumeric(this[i])?this[i]:0);
        if (v > max) {
            max = this[i];
        }
    }
    return max;
};

