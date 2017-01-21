//2016-11-12 ChuD; 等效小时、发电量排名弹出框
var dialog = {
    genOrEqHr: 2, //1:等效小时; 2.发电量; 3:发电趋势
    dateType: 1, //等效小时、发电量 排名  1:日  2:月  3:年
    curtOrgId_refresh: "", //当前组织id，用于 定时刷新
    dxxChart: "",
    fdlChart: "",
    trendsChart: "",
    pageSize: 10,//每页显示条目数
    currentPage: 1, //当前页
    rowCount: 0,//总条目数
    pageCount: 0,//总页数

    //scrnvs: scrnvs,
    scrnvs: 3,
    psName: "",
    psId: "",
    psIdArr: []
};

new Vue({
    el: '#powerTrend',
    data: {
        myDate: new Date(),
        showIncreaseDate: false
    },
    methods: {
        power_hourTab: function (e) {
            var tabType = $(e.target).attr('data-powerType');
            $(".showm_bottom .loadingDiv").show();
            if (tabType == 'power') {
                //点击发电量btn
                $("#dxxs_li").show();
                $(".max_btn").show();
                $("#fdlAllChart").show();
                $("#dxxsAll").hide();
                $("#genTrends").hide();
                $("#psName").hide();
            } else {
                //点击等效小时btn
                $("#dxxsAll").show();
                $("#fdlAllChart").hide();
            }

            //this.loadDXXOrFDL();
        },
        initTime: function () {
            var daybegin = new Date();
            var year = daybegin.getFullYear();
            var month = daybegin.getMonth() + 1;
            var date = daybegin.getDate();
            var hour = daybegin.getHours();
            var min = daybegin.getMinutes();
            var month1 = month >= 10 ? month : ("0" + month);
            var date1 = date >= 10 ? date : ("0" + date);
            var thisDate = year + "/" + month1 + "/" + date1;
            if (dialog.dateType == "2") {
                thisDate = year + "/" + month1;
            } else if (dialog.dateType == "3") {
                thisDate = year;
            }
            $("#dateInput").val(thisDate);
        },

        addActive: function () {
            $('#right_min_btn').removeClass('active');
            $('#right_max_btn').removeClass('active');
        },

        //根据时间类型type 刷新等效小时数据 1:日  2:月  3:年
        showEqHourData: function (type) {
            dialog.currentPage = 1;
            dialog.dateType = type;
            this.setDateInputFormat();
            this.initTime();
            if (dialog.genOrEqHr == 2) {
                this.loadFDLAll();
            } else if (dialog.genOrEqHr == 3) {
                this.loadGenTrendsData();
            } else {
                loadDXXSAll();
            }
            this.isIncreaseDateAvailable(type, $("#dateInput").val(), false);
        },

        loadDXXOrFDL: function (val) {
            dialog.currentPage = 1;
            if (val == 1) {
                this.loadFDLAll();
            } else if (val == 3) {
                this.loadGenTrendsData();
            } else {
                loadDXXSAll();
            }
        },

        //加载所有县区的等效小时排名;
        loadDXXSAll: function () {
            dialog.genOrEqHr = 1;
            var url = 'powerAction_loaddata.action';
            var param = {};
            param["service"] = "stationsPointReport";
            param["type"] = dialog.dateType;
            param["req"] = "app";
            param["date_id"] = getDate();
            param["org_id"] = dialog.curtOrgId_refresh;
            param["curPage"] = dialog.currentPage;
            param["size"] = dialog.pageSize;
            param["sort_column"] = "p83025";
            param["sort_type"] = "0";
            $.ajax({
                type: "post",
                data: param,
                url: url,
                dataType: "json",
                beforeSend: function () {
                    dialog.dxxChart = echarts.init(document.getElementById('dxxsAll'));
                    $(".showm_bottom .loadingDiv").show();
                },
                success: function (data, s) {
                    if (isNotNull(data)) {
                        var dxxsData = [];//等效小时
                        var areaData = [];//地区
                        var unit = "小时";
                        var obj = parseJson(data);
                        //var maxData ;
                        if (obj != null && obj.result_code != -1) {
                            var result_data = obj.result_data;
                            dialog.rowCount = result_data.rowCount;
                            dialog.pageCount = dialog.rowCount / dialog.pageSize;
                            isPageArrowAvilable();
                            var resultArray = result_data.list;
                            //maxData = resultArray[0].p83025;
                            for (var i = 0; i < resultArray.length; i++) {
                                var obj = resultArray[i];
                                dxxsData.push(toFix(obj.p83025, 2));
                                areaData.push(obj.ps_name);
                            }
                            var maxPower = dxxsData.max();
                            if (isNotNull(maxPower)) {

                                if (parseInt(maxPower / 10000) > 0) {
                                    for (var i = 0; i < dxxsData.length; i++) {
                                        if ($.isNumeric(dxxsData[i])) {
                                            dxxsData[i] = parseFloat(dxxsData[i] / 10000).toFixed(2);
                                        }
                                    }
                                    unit = "万小时"
                                }
                                else if (parseInt(maxPower / 1000) > 0) {
                                    for (var i = 0; i < dxxsData.length; i++) {
                                        if ($.isNumeric(dxxsData[i])) {
                                            dxxsData[i] = parseFloat(dxxsData[i] / 1000).toFixed(2);
                                        }
                                    }
                                    unit = "千小时"
                                }
                            }
                        }
                        showDXXSAll(dxxsData, areaData, unit);
                    }
                },
                error: function () {

                }
            });
        },


        //等效小时弹出chart
        showDXXSAll: function (valueAxis, areaData, unit) {
            var option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (data) {
                        //"<p align='left' >排名：" + (data[0].dataIndex + 1) + "</p>" +
                        return "<p align='left'>" + LANG["powerStation"] + "：" + data[0].name + "</p>" +
                            "<p align='left'>" + data[0].seriesName + "：" + data[0].value + unit;
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
                    data: [LANG["1_1_equalHour"]]
                },
                // 网格
                grid: {
                    //x: 30,
                    //y: 35,
                    //x2: 0,
                    //y2: 0,
                    //width: 320,
                    //height: 160,
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
                            interval: 0,// 是否显示全部标签，0显示
                            rotate: 25,//逆时针显示标签，不让文字叠加
                            textStyle: {
                                color: '#ffffff'
                            }
                        },
                        splitLine: {
                            show: false
                        },

                        data: areaData
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
                        nameTextStyle: {
                            fontSize: 15,
                            fontFamily: 'Microsoft YaHei'
                        },
                        axisTick: axisTickObj
                    }
                ],
                series: [
                    {
                        name: LANG["1_1_equalHour"],
                        type: 'bar',
                        barMaxWidth: 50,
                        stack: 'sum',
                        itemStyle: {
                            normal: {
                                color: '#3EB5FF'
                            }
                        },
                        data: valueAxis
                    }
                ]
            };
            dialog.dxxChart.setOption(option);
            $(".showm_bottom .loadingDiv").hide();
            $("#dxxsAll div").show();
        },

        //日发电量83022  月发电量83037  年发电量83038
        getSortColumn: function () {

            switch (dialog.dateType) {
                case 1:
                    return 'p83022';
                    break;
                case 2:
                    return 'p83037';
                    break;
                default:
                    return 'p83038';
            }
        },
        //加载所有县区的发电量排名
        loadFDLAll: function () {
            dialog.genOrEqHr = 2;
            var url = 'powerAction_loaddata.action';
            var param = {};
            param["service"] = "stationsPointReport";
            //param["limit"] = 31;
            param["req"] = "app";
            param["curPage"] = dialog.currentPage;
            param["size"] = dialog.pageSize;
            param["sort_column"] = this.getSortColumn();
            param["sort_type"] = "0";
            param["type"] = dialog.dateType;
            param["date_id"] = this.getInputDate();
            param["org_id"] = dialog.curtOrgId_refresh;

            $.ajax({
                type: "post",
                data: param,
                url: url,
                dataType: "json",
                beforeSend: function () {
                    dialog.psIdArr = [];
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
                            dialog.fdlChart = ec.init(document.getElementById('fdlAllChart'));
                        });
                    $(".showm_bottom .loadingDiv").show();
                },
                success: function (data, s) {
                    if (isNotNull(data)) {
                        var generationData = [];//发电量
                        var areaData = [];//地区
                        var unit = "度";
                        var obj = parseJson(data);
                        //var maxData ;
                        if (obj != null && obj.result_code != -1) {
                            var result_data = obj.result_data;
                            dialog.rowCount = result_data.rowCount;
                            dialog.pageCount = dialog.rowCount / dialog.pageSize;
                            isPageArrowAvilable();
                            var resultArray = result_data.list;
                            //maxData = resultArray[0].p83025;
                            for (var i = 0; i < resultArray.length; i++) {
                                var obj = resultArray[i];
                                generationData.push(toFix(obj.p83022, 2));
                                areaData.push(obj.ps_name);
                                dialog.psIdArr.push(obj.ps_id);
                            }
                            var maxPower = generationData.max();
                            if (isNotNull(maxPower)) {
                                if (parseInt(maxPower / 10000) > 0) {
                                    for (var i = 0; i < generationData.length; i++) {
                                        if ($.isNumeric(generationData[i])) {
                                            generationData[i] = parseFloat(generationData[i] / 10000).toFixed(2);
                                        }
                                    }
                                    unit = "万度"
                                }
                            }
                            unit = replaceUnit_scrn4Dialog(unit);
                        }
                        showFDLAll(generationData, areaData, unit);
                    }
                },
                error: function () {

                }
            });
        },

        //发电量弹出chart
        showFDLAll: function (valueAxis, areaData, unit) {
            $("#fdlAllChart div").show();
            var option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (data) {
                        //return data[0].name + "<br>" + data[0].seriesName + "：" + data[0].value + unit;
                        return "<p align='left'>" + LANG["powerStation"] + "：" + data[0].name + "</p>" +
                            "<p align='left'>" + data[0].seriesName + "：" + data[0].value + unit;
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
                    data: [LANG["yy1.PowerGeneration"]]
                },
                // 网格
                grid: {
                    //x: 30,
                    //y: 35,
                    //x2: 0,
                    //y2: 0,
                    //width: 320,
                    //height: 160,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderWidth: 0,
                    borderColor: '#ccc'
                },

                calculable: false,
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
                            interval: 0,// 是否显示全部标签，0显示
                            rotate: 25,//逆时针显示标签，不让文字叠加
                            textStyle: {
                                color: '#ffffff'
                            }
                        },
                        splitLine: {
                            show: false
                        },

                        data: areaData
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
                        nameTextStyle: {
                            fontSize: 15,
                            fontFamily: 'Microsoft YaHei'
                        },
                        axisTick: axisTickObj
                    }
                ],
                series: [
                    {
                        name: LANG["yy1.PowerGeneration"],
                        type: 'bar',
                        barMaxWidth: 50,
                        stack: 'sum',
                        itemStyle: {
                            normal: {
                                color: '#3EB5FF'
                            }
                        },
                        data: valueAxis
                    }
                ]
            };

            $(".showm_bottom .loadingDiv").hide();
            dialog.fdlChart.setOption(option);


            dialog.fdlChart.on('click', function (params) {
                var index = params.dataIndex;
                event.stopPropagation();
                if (dialog.scrnvs == 3) {
                    dialog.psName = params.name;
                    dialog.psId = dialog.psIdArr[index];
                    showPsGenTrends();
                }
            });

        },


        //判断能否增长日期 val(eg:2016-01-01)
        isIncreaseDateAvailable: function (type, val, isInner) {
            var now = new Date();
            if (type == 1) {//日
                if (now.Format("yyyyMMdd") > val.substring(0, 10).replace(/\//g, "")) {
                    showIncreaseDate = true;
                } else {
                    showIncreaseDate = false;
                }
            } else if (type == 2) {//月
                if (now.Format("yyyyMM") >= val.substring(0, 7).replace(/\//g, "")) {
                    this.showIncreaseDate = true;
                } else {
                    this.showIncreaseDate = false;
                }
            } else if (type == 3) {//年
                if (now.Format("yyyy") >= val.substring(0, 4).replace(/\//g, "")) {
                    this.showIncreaseDate = true;
                } else {
                    this.showIncreaseDate = false;
                }
            }

            if (this.showIncreaseDate) {  //可以增加
                if (now.Format("yyyy") == val.substring(0, 4).replace(/\//g, "")) {
                    this.addActive();
                } else {
                    $('#right_min_btn').addClass('active');
                    $('#right_max_btn').addClass('active');
                }
                $("#dateInput").val(val);
                this.loadDXXOrFDL();
            } else {
                this.addActive();
            }
        },

        //点击日期 箭头
        arrowChangeDate: function () {
            var temdate = "";
            var val = 0;
            if (event.target == document.getElementById("left_min_btn")) {//判断事件对象，左键头时间向前
                val = -1;
            } else if (event.target == document.getElementById("right_min_btn")) {
                val = 1;
            }
            var date = $("#dateInput").val();
            date = date.substring(0, 10);
            if (dialog.dateType == 1) {
                var d1 = new Date(date.replace(/\-/g, "\/"));
                d1.addDays(val);//加、减日 操作
                temdate = d1.Format("yyyy/MM/dd");
                this.isIncreaseDateAvailable(1, temdate, false);
            } else if (dialog.dateType == 2) {
                var d1 = new Date(date.replace(/\-/g, "\/"));
                d1.addMonths(val);
                temdate = d1.Format("yyyy/MM");
                this.isIncreaseDateAvailable(2, temdate, false);
            } else if (dialog.dateType == 3) {
                var d1 = new Date(date.replace(/\-/g, "\/"));
                d1.addYears(val);
                temdate = d1.Format("yyyy");
                this.isIncreaseDateAvailable(3, temdate, false);
            }
            $("#dateInput").val(temdate);
            if (dialog.genOrEqHr == 2) {
                this.loadFDLAll();
            } else if (dialog.genOrEqHr == 3) {
                this.loadGenTrendsData();
            } else {
                loadDXXSAll();
            }
        },

        getInputDate: function () {
            var date = $("#dateInput").val();
            date = date.replace(/\//g, "");
            return date;
        },

        setDateInputFormat: function () {
            if (dialog.dateType == 1 || !dialog.dateType) {
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
            } else if (dialog.dateType == 2) {
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
                        dateFmt: 'yyyy',
                        maxDate: '%y',
                        isShowClear: false,
                        readOnly: true,
                        onpicking: function (dp) {
                            dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());
                        }
                    });
                });
            }
        },

        dateChanged: function (dStrOld, dStrNew) {
            if (true) {
                this.isIncreaseDateAvailable(dialog.dateType, dStrNew, false);
                if (dialog.genOrEqHr == 2) {
                    loadFDLAll();
                } else if (dialog.genOrEqHr == 3) {
                    loadGenTrendsData();
                } else {
                    loadDXXSAll();
                }
            }
        },

        //箭头分页
        arrowChangePage: function () {
            if (event.target == document.getElementById("left_max_btn") && dialog.currentPage > 1) {
                dialog.currentPage--;
            } else if (event.target == document.getElementById("right_max_btn")) {
                dialog.currentPage++;
            }
            if (dialog.genOrEqHr == 2) {
                this.loadFDLAll();
            } else {
                loadDXXSAll();
            }
            isPageArrowAvilable();
        },

        //判断分页箭头可用
        isPageArrowAvilable: function () {
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
        },

        showPsGenTrends: function () {
            $("#fdlAllChart").hide();
            $("#genTrends").show();
            $("#dxxs_li").hide();
            $(".max_btn").hide();
            $("#psName").show();
            $("#psNameA").text(dialog.psName + "-" + LANG["generationTrend"]);
            dialog.genOrEqHr = 3;
            loadGenTrendsData();
        },

        loadGenTrendsData: function () {
            var param = {};
            param["date"] = getDate();
            param["ps_id"] = dialog.psId;
            param["date_type"] = (4 - dialog.dateType);//1 -> 3; 2 -> 2; 3 -> 1
            $.ajax({
                type: "post",
                data: param,
                url: 'powerAction_getPowerPlan.action',
                async: true,

                dataType: "json",
                beforeSend: function () {
                    dialog.trendsChart = echarts.init(document.getElementById('genTrends'));
                    $(".showm_bottom .loadingDiv").show();
                },
                success: function (data) {
                    var object = parseJson(data);
                    if (data != null && object.result_code == 1) {
                        var result = object.result_data;
                        var unit = result.actual_energy_unit;
                        var actualData = result.actual_energy;
                        var dateDate = [];
                        var maxPower = actualData.max();
                        for (var i = 0; i < actualData.length; i++) {
                            dateDate.push(i + 1);
                        }
                        if (isNotNull(maxPower)) {
                            if (parseInt(maxPower / 10000) > 0) {
                                for (var i = 0; i < actualData.length; i++) {
                                    if ($.isNumeric(actualData[i])) {
                                        actualData[i] = parseFloat(actualData[i] / 10000).toFixed(2);
                                    }
                                }
                                unit = "万度"
                            }
                        }
                        unit = replaceUnit_scrn4Dialog(unit);
                        drawTrendsChart(actualData, unit, dateDate);
                    }
                }
            })
        },

        getFmTime: function (time) {
            var resTime = "";
            var temVal = dealTimeNum(time);
            var date = $("#dateInput").val();
            if (dialog.dateType == 1) {
                resTime = date + " " + temVal + ":00";
            } else {
                resTime = date + "/" + temVal;
            }
            return resTime;
        },

        drawTrendsChart: function (actualData, actualData_unit, dateDate) {
            var option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (data) {
                        var str = "<p align='left'>" + LANG["TIME"] + "：" + getFmTime(data[0].name) + "</p>";
                        str += "<p align='left'>" + LANG["yy1.PowerGeneration"] + "：" + dealEchartToolTip(data[0].value) + actualData_unit;
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
                    data: [LANG["yy1.PowerGeneration"]]
                },
                // 网格
                grid: {
                    //x: 30,
                    //y: 35,
                    //x2: 0,
                    //y2: 0,
                    //width: 320,
                    //height: 160,
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
                                color: '#ffffff'
                            }
                        },
                        axisLabel: {
                            show: true,
                            interval: 0,// 是否显示全部标签，0显示
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
                        name: actualData_unit,
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
                            fontSize: 15,
                            fontFamily: 'Microsoft YaHei'
                        },
                        axisTick: axisTickObj
                    }
                ],
                series: [
                    {
                        name: LANG["yy1.PowerGeneration"],
                        type: 'bar',
                        barMaxWidth: 50,
                        stack: 'sum',
                        itemStyle: {
                            normal: {
                                color: '#3EB5FF'
                            }
                        },
                        data: actualData
                    }
                ]
            };

            $(".showm_bottom .loadingDiv").hide();
            dialog.trendsChart.setOption(option);
        },
        closeWindow: function () {
            $(".Mc4_bg_highLt", parent.document).removeClass("Mc4_bg_highLt");
            window.parent.closeEqualHourFm();
        }
    },
    mounted: function () {
        this.showEqHourData(1);
    }
});






