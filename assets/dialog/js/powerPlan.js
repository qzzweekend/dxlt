var dialog = {
    dateType: '3', //pr  1:日  2:月  3:年
    curtOrgId_refresh: "" //当前组织id，用于 定时刷新
};

new Vue({
    el: '#powerPlan',
    data: {
        myDate: new Date(),
        showIncreaseDate: false
    },
    methods: {
        //当年发电计划发送请求
        loadPlanChart: function () {
            var dateType = dialog.dateType;
            var _this = this,
                dateStr = '',
                startDateStr = '',
                dates = new Date(),
                endDate = dates.getFullYear() + '-' + (dates.getMonth() + 1) + '-' + dates.getDate() + 'T' + dates.getHours() + ':' + dates.getMinutes() + ':' + dates.getSeconds(),
                endDateStr = vlm.Utils.format_date(endDate, 'YmdHis');

            switch (dateType) {
                case '2':
                    dateStr = 'day';
                    var dateNum = this.getInputDate($('#dateInput').val());
                    var date = new Date();
                    var year = dateNum.substring(0, 4);
                    var month = dateNum.substring(4);
                    if (month < 10) {
                        month = month.substring(1);
                    }
                    ;
                    date.setFullYear(year, month, 0);
                    var day = date.getDate();
                    startDateStr = dateNum + '01000000';
                    endDateStr = dateNum.substring(0, 6) + day + '000000';
                    break;
                //case '2':
                //    dateStr = 'month';
                //    sort = '1';
                //    startDateStr = vlm.Utils.currentMonth();
                //    break;
                case '3':
                    dateStr = 'year';
                    startDateStr = $('#dateInput').val() + '0101000000';
                    endDateStr = (Number($('#dateInput').val()) + 1) + '0101000000';
                    break;
                default :
                    ;
            }

            var Parameters = {
                "parameters": {
                    "datatype": dateStr,
                    "sorttype": "1",
                    "sort": '1',
                    "starttime": startDateStr,
                    "endtime": endDateStr,
                    "topn": "7",
                    "stationid": ""
                },
                "foreEndType": 2,
                "code": "20000004"
            };
            vlm.loadJson("", JSON.stringify(Parameters), function (res) {
                //console.log(res);
                if (res.success) {
                    var result = res.data;
                    if (result.datas.length) {
                        var actualData = planArray = result.datas,
                            planData = [],
                            newActualData = [],   //实际
                            xData = [],  //x轴数据
                            completionRt = [],  //完成率
                            unit = result.fd_unit;
                        for (var i = 0; i < planArray.length; i++) {
                            planData.push(planArray[i].fd_sched_power_mon); //每个月发电计划
                            newActualData.push(planArray[i].datapower);    //当月实际发电
                        }

                        if (dialog.dateType == 2) {//日发电计划数组赋值
                            var selectDate = $("#dateInput").val();
                            var date = new Date();
                            var year = date.getFullYear();
                            var month = date.getMonth() + 1;
                            if (month >= 1 && month <= 9) {
                                month = "0" + month;
                            }

                            if ((year + "/" + month) == selectDate) {//选择的时间是当前月份，截取数据到前一天
                                var strDate = date.getDate();
                                var today_power = $("#currentPowerValue_virgin", parent.document).val();//今日发电
                                actualData[strDate - 1] = today_power;//补当前实际发电量
                                actualData = actualData.slice(0, strDate);
                                planData = planData.slice(0, strDate);
                            }

                            //actualData = addUpArr(actualData);
                            planData = addUpArr(planData);
                        }
                        //完成率
                        if (dialog.dateType == 2) {//月完成率
                            for (var i = 0; i < planData.length; i++) {
                                xData.push(i + 1);
                                completionRt.push(CalculatedCompletionRate(newActualData[i], planData[i]));
                            }
                        } else {
                            var temAddedArr = addUpArr(newActualData);
                            var temSum = addUpArr(planData);
                            var now = new Date();
                            var month = now.getMonth() + 1;
                            for (var i = 0; i < planData.length; i++) {
                                xData.push(i + 1);
                                if(i<month){
                                    completionRt.push(CalculatedCompletionRate(temAddedArr[i], temSum[i]));
                                }else{
                                    completionRt.push('--');
                                }
                            }
                        }
                        _this.drawPowerPlanChart(dealEchartBarArr(newActualData), dealEchartBarArr(planData), unit, xData, dealEchartLineArr(completionRt));

                    }else{
                        $(".showm_bottom .loadingDiv").hide();
                        $("#powerPlanAll").hide();
                    }
                } else {
                    alert(res.message);
                }
            });
        },
        //绘制发电计划chart
        drawPowerPlanChart: function (actualData, planData, unit, xData, completionRt) {
            $("#powerPlanAll").show();
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
            $('.loadingDiv').hide();
            var ptChart = echarts.init(document.getElementById('powerPlanAll'));
            ptChart.setOption(option);
            $(".showm_bottom .loadingDiv").hide();
            $("#dxxsAll div").show();
        },
        //初始化input时间
        initTime: function () {
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
        },

        addActive:function(){
            $('#right_min_btn').removeClass('active');
            $('#right_max_btn').removeClass('active');
        },

        //根据时间类型type 刷新等效小时数据 1:日  2:月  3:年
        showEqHourData: function (e) {
            var type = '';
            $('.time_menunav_my ul li').removeClass("on");
            if ($(e.target).attr('dateTabType') == 3 || $(e.target).attr('dateTabType') == undefined) {
                $('.time_menunav_my ul li').eq(1).addClass("on");
                type = '3';
            } else {
                $('.time_menunav_my ul li').eq(0).addClass("on");
                type = $(e.target).attr('dateTabType');

            }
            dialog.dateType = type;
            this.initTime();
            this.setDateInputFormat();  //时间input绑定WdatePicker
            this.loadPlanChart();
            this.addActive();
        },

        //判断能否增长日期 val(eg:2016-01-01)
        isIncreaseDateAvailable: function (type, val, isInner) {
            var now = new Date();
            if (type == 2) {//月
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
                }else{
                    $('#right_min_btn').addClass('active');
                    $('#right_max_btn').addClass('active');
                }
                $("#dateInput").val(val);
                this.loadPlanChart();
            } else {
                this.addActive();
            }
        },

        //点击日期 箭头
        arrowChangeDate: function () {
            var temdate = "";
            var val = 0;
            if (event.target == document.getElementById("left_min_btn") || event.target == document.getElementById("left_max_btn")) {//判断事件对象，左键头时间向前
                val = -1;
            } else if (event.target == document.getElementById("right_min_btn") || event.target == document.getElementById("right_max_btn")) {
                val = 1;
            }
            var date = $("#dateInput").val();
            date = date.substring(0, 10);
            //if (dialog.dateType == "1") {
            //    var d1 = new Date(date.replace(/\-/g, "\/"));
            //    d1.addDays(val);//加、减日 操作
            //    temdate = d1.Format("yyyy/MM/dd");
            //    this.isIncreaseDateAvailable(1, temdate, false);
            //} else
            if (dialog.dateType == "2") {
                var d1 = new Date(date.replace(/\-/g, "\/"));
                d1.addMonths(val);
                temdate = d1.Format("yyyy/MM");
                this.isIncreaseDateAvailable(2, temdate, false);
            } else if (dialog.dateType == "3") {
                var d1 = new Date(date.replace(/\-/g, "\/"));
                d1.addYears(val);
                temdate = d1.Format("yyyy");
                this.isIncreaseDateAvailable(3, temdate, false);
            }
        },

        getInputDate: function () {
            var date = $("#dateInput").val();
            date = date.replace(/\//g, "");
            return date;
        },

        setDateInputFormat: function () {
            var _this = this;
            if (dialog.dateType == "2") {
                $("#dateInput").unbind();
                $("#dateInput").click(function () {
                    WdatePicker({
                        dateFmt: 'yyyy/MM',
                        maxDate: '%y/%M',
                        isShowClear: false,
                        readOnly: true,
                        onpicking: function (dp) {
                            _this.dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());
                        }
                    });
                });
            } else {
                $("#dateInput").unbind();
                $("#dateInput").click(function () {
                    WdatePicker({
                        dateFmt: 'yyyy', maxDate: '%y', isShowClear: false, readOnly: true, onpicking: function (dp) {
                            _this.dateChanged(dp.cal.getDateStr(), dp.cal.getNewDateStr());
                        }
                    });
                });
            }
        },

        dateChanged: function (dStrOld, dStrNew) {
            if (true) {
                this.isIncreaseDateAvailable(dialog.dateType, dStrNew, false);
            }
        },

        closeWindow: function () {
            $(".Monitor_left_c3_highLt", parent.document).removeClass("Monitor_left_c3_highLt");
            window.parent.closeEqualHourFm();
        }
    },
    mounted: function () {
        $('#left_max_btn').css('opacity',1);
        this.showEqHourData(3);

    }
});
