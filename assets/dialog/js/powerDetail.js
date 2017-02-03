var iFrameSearch = window.location.search.substring(1),
    stationid = iFrameSearch.split('=')[1].toLowerCase();
var dialog = {
    ps_id: stationid,
    //screenVersion: "",
    //ps_scheme: "",
    daysArr: [LANG["common_date_day7"], LANG["common_date_day1"], LANG["common_date_day2"], LANG["common_date_day3"], LANG["common_date_day4"], LANG["common_date_day5"], LANG["common_date_day6"]]
};

function dealTimeNum(val) {
    var rest = "--";
    if ($.isNumeric(val)) {
        rest = val > 9 ? val : ("0" + val);
    }
    return rest;
};

new Vue({
    el: '#powerDetail',
    data: {
        ctx: '',
        fd_station_name: '',  //项目名称
        fd_all_pw: '--',   //当前功率
        fd_all_pw_unit: '',  //功率单位

        fd_all_power_day: '', //今日发电
        fd_all_power_day_unit: '',

        fd_all_power: '--', //累计发电
        fd_all_power_unit: '',

        fd_co2_reduce: '--', //二氧化碳
        fd_co2_reduce_unit: '',

        fd_station_desc: '', //电站介绍

        fd_city: '',
        fd_pr: '--',

        fdboardtemperature: '--',  //环境温度
        fdtemperature: '--', //电池板温度

        wertherName: '--',
        temprature_low: '--',
        temprature_high: '--',
        windToday: '--'

    },
    methods: {
        getPsDetailInfo1: function () {
            var _this = this,
                iFrameSearch = window.location.search.substring(1),
                stationid = iFrameSearch.split('=')[1].toLowerCase(),
                Parameters = {
                    "parameters": {
                        "stationid": stationid
                    },
                    "foreEndType": 2,
                    "code": "20000010"
                };
            vlm.loadJson("", JSON.stringify(Parameters), function (result) {
                //console.log(result);
                if (result.success) {
                    var result = result.data;
                    _this.fd_station_name = result.fd_station_name;
                    _this.fd_all_pw = result.fd_all_pw + result.fd_all_pw_unit;  //当前功率
                    _this.fd_all_power_day = result.fd_all_power_day + result.fd_all_power_day_unit; //今日发电
                    _this.fd_all_power = result.fd_all_power + result.fd_all_power_unit; //累计发电
                    _this.fd_co2_reduce = result.fd_co2_reduce + result.fd_co2_reduce_unit; //二氧化碳
                    _this.fd_station_desc = result.fd_station_desc; //电站介绍
                    _this.fd_pr = result.pr; //pr
                    _this.fdboardtemperature = result.fdboardtemperature.toFixed(1);
                    _this.fdtemperature = result.fdtemperature.toFixed(1);
                    _this.loadWeather(result.fd_city); //天气调用

                    _this.drawTotalPR(result.pr);//累计PR
                    //superSlide
                    if (result.fd_station_pic && result.fd_station_pic.length) {
                        var images = result.fd_station_pic;
                        var htmlStr = "";
                        for (var i = 0; i < images.length; i++) {
                            images[i] = images[i].replace(/\\/g, '/').replace(/:\//g, '://'); //匹配反斜杠
                            htmlStr += '<li><a><img src="' + images[i] + '" alt=""></a></li>'
                        }
                        $("#smPicture").html(htmlStr);
                        $("#bigPicture").html(htmlStr);
                    }
                    jQuery(".siteMore_con_ri_tog").slide({
                        mainCell: ".bd ul",
                        titCell: ".hd li",
                        effect: "topLoop",
                        autoPlay: true
                    });
                    jQuery(".siteMore_con_ri_tog .hd").slide({
                        mainCell: "ul",
                        prevCell: ".siteMore_con_ri_togprev",
                        nextCell: ".siteMore_con_ri_tognext",
                        vis: 3,
                        effect: "topLoop",
                        scroll: 1
                    });
                    jQuery(".siteMore_con_ri").slide({
                        titCell: ".siteMore_con_ri_tit li",
                        mainCell: ".siteMore_con_ri_wrap",
                        effect: "fold",
                        trigger: "click"
                    })
                } else {
                    alert(result.message);
                }
            });
        },

        drawTotalPR: function (pr) {
            option = {
                color: ['#0086DB', '#62C5FC'],
                series: [
                    {
                        hoverAnimation: false,
                        type: 'pie',
                        radius: ['50%', '80%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
                            }
                        },
                        data: [
                            {
                                value: pr,
                                itemStyle: {
                                    normal: {
                                        color: "#0086DB"
                                    }
                                }
                            },
                            {
                                value: 100 - pr,
                                itemStyle: {
                                    normal: {
                                        color: "#62C5FC"
                                    }
                                }
                            }
                        ]
                    }
                ]
            };

            var prChart = echarts.init(document.getElementById('totalPr'));
            prChart.setOption(option);

        },

        loadDataForRealTimePower: function () {
            var dates = new Date(),
                endDate = dates.getFullYear() + '-' + (dates.getMonth() + 1) + '-' + dates.getDate() + 'T' + dates.getHours() + ':' + dates.getMinutes() + ':' + dates.getSeconds(),
                endDateStr = vlm.Utils.format_date(endDate, 'YmdHis'),
                startDateStr = vlm.Utils.currentDay(),
                pwArr = [],
                powerArr = [],
                radiaArr = [],
                dclist = [],
                aclist = [],
                powerUnit = 'kW',
                radiaUnit = 'W/㎡',
                dc_unit = 'kW',
                ac_unit = 'kW';

            powerArr=[
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "0",
                "723.83",
                "5755.3",
                "3689.75",
                "4095.8",
                "5278.64",
                "10627.89",
                "18766.52",
                "5596.41",
                "8226.9",
                "1094.57",
                "0",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--"
            ];
            radiaArr=[
                "0",
                "0",
                "0",
                "0",
                "0.1",
                "0.3",
                "0.5",
                "27.7",
                "162.5",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--"
            ];
            dclist=[
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--"
            ];
            aclist=[
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--",
                "--"
            ]

            //接口2
            var Parameters = {
                "parameters": {
                    "stationtype": "",
                    "timetype": '1',
                    "sorttype": "1",
                    "sort": '2',
                    "starttime": startDateStr,
                    "endtime": endDateStr,
                    "topn": "300",
                    "stationid": "gs"
                },
                "foreEndType": 2,
                "code": "20000005"
            }
            //console.log(Parameters);
            vlm.loadJson("", JSON.stringify(Parameters), function (res) {
                console.log(res);
                //if (res.success) {
                //    var result = res.data.fd_datas;
                //    if (result.length) {
                //        for (var i = 0; i < result.length; i++) {
                //            pwArr.push(result[i].fd_pw_curr);
                //        }
                //        console.log(pwArr);
                //    }
                //} else {
                //    alert(res.message);
                //}

                    var date = new Date();
                    var hours = date.getHours();
                    var min = date.getMinutes();
                    if(min<5){
                        hours = hours-1;
                    }
                    var result = res.result_data;
                    var powerArr = result.p83033List.slice(0,hours);
                    var radiaArr = result.p83012List.slice(0,hours);
                    var dclist = result.p83039List.slice(0,hours);
                    var aclist = result.p83002List.slice(0,hours);
                    var powerUnit = result.p83033_unit;
                    var radiaUnit = result.p83012_unit;
                    var dc_unit = result.p83039_unit;
                    var ac_unit = result.p83002_unit;

                    console.log(dealEchartLineArr(powerArr));
                    console.log(dealEchartLineArr(radiaArr));
                    console.log(dealEchartLineArr(dclist));
                    console.log(dealEchartLineArr(aclist));
                   });
            this.drawRealTimeEchart(dealEchartLineArr(powerArr), dealEchartLineArr(radiaArr),dealEchartLineArr(dclist), dealEchartLineArr(aclist), powerUnit, radiaUnit, dc_unit, ac_unit);

            //console.log(dealEchartLineArr(powerArr));
            //console.log(dealEchartLineArr(radiaArr));
            //console.log(dealEchartLineArr(dclist));
            //console.log(dealEchartLineArr(aclist));
            //this.drawRealTimeEchart(dealEchartLineArr(powerArr), dealEchartLineArr(radiaArr), dealEchartLineArr(dclist), dealEchartLineArr(aclist), powerUnit, radiaUnit, dc_unit, ac_unit);


            //接口1
            //Parameters = {
            //    "parameters": {
            //        "ctype": "2",
            //        "timetype": "1",
            //        "sorttype": "1",
            //        "sort": "1",
            //        "starttime": startDateStr,
            //        "endtime": endDateStr,
            //        "topn": "8000",
            //        "stationid": "gs",
            //        "devid": "",
            //        "ischild": ""
            //    },
            //    "foreEndType": 2,
            //    "code": "30000002"
            //};
            //
            //console.log(Parameters);
            //vlm.loadJson("", JSON.stringify(Parameters), function (result) {
            //    console.log(result);
            //    if (result.success) {
            //        var result = result.data;
            //        if (result.data.length) {
            //
            //        }
            //    } else {
            //        alert(result.message);
            //    }
            //});

        },


        //实时功率曲线
        drawRealTimeEchart: function (powerArr, radiaArr, dcArr, acArr, powerUnit, radiaUnit, dc_unit, ac_unit) {
            var option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(data){
                        var str = "<p align='left'>" + LANG["TIME"] + "：" + dealTimeNum(data[0].name) + ":00</p>";
                        for(var i = 0; i < data.length; i ++) {
                            if(LANG["1_1_radiationIntensity"] == data[i].seriesName){
                                str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + radiaUnit;
                            }else if (LANG["1_1_realTimePower"] == data[i].seriesName) {
                                str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + powerUnit;
                            }else if(LANG["analysis_report_inverterdcpower"] == data[i].seriesName){
                                str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + dc_unit;
                            }else if(LANG["analysis_report_inverteracpower"] == data[i].seriesName){
                                str += "<p align='left'>" + data[i].seriesName + "：" + dealEchartToolTip(data[i].value) + ac_unit;
                            }
                        }
                        return str;
                    }
                },
                grid: {
                    x: 60,
                    y: 54,
                    x2: 60,
                    y2: 40,
                    //width: 320,
                    //height: 160,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderWidth: 0,
                    borderColor: '#ccc'
                },
                legend: {
                    data:[LANG["1_1_realTimePower"],LANG["1_1_radiationIntensity"],LANG["analysis_report_inverterdcpower"],LANG["analysis_report_inverteracpower"]],
                    x: 'right',
                    textStyle:{
                        color: "#FFFFFF",
                        fontFamily : 'Microsoft YaHei'
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        axisTick:{
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        axisLabel:{
                            textStyle:{
                                color: '#FFFFFF'
                            }
                        },
                        axisLine:{
                            //show:false
                        },
                        data : ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24']
                    }
                ],
                yAxis : [
                    {
                        splitLine: {
                            show: false
                        },
                        name: powerUnit,
                        type : 'value',
                        axisLabel:{
                            textStyle:{
                                color: '#FFFFFF'
                            }
                        },
                        axisLine:{
                            color:"#003B5D"
                        },
                        nameTextStyle:{
                            color: '#FFFFFF',
                            fontFamily : 'Microsoft YaHei'
                        }
                    },
                    {
                        splitLine: {
                            show: false
                        },
                        name: radiaUnit,
                        type : 'value',
                        axisLabel:{
                            textStyle:{
                                color: '#FFFFFF'
                            }
                        },
                        axisLine:{
                            color:"#003B5D"
                        },
                        nameTextStyle:{
                            color: '#FFFFFF',
                            fontFamily : 'Microsoft YaHei'
                        }
                    }
                ],
                //color: ["#6293FA",'#03D5AE'],
                color: ["#a7fffe",'#f8f442','#9f5ba7','#1d5eb6'],
                series : [
                    {
                        yAxisIndex: 0,
                        name:LANG["1_1_realTimePower"],
                        type:'line',
                        data:powerArr,
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default'}}}
                    },
                    {
                        yAxisIndex: 1,
                        name:LANG["1_1_radiationIntensity"],
                        type:'line',
                        data:radiaArr,
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default'}}}
                    },
                    {
                        yAxisIndex: 0,
                        name:LANG["analysis_report_inverterdcpower"],
                        type:'line',
                        data:dcArr,
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default'}}}
                    },
                    {
                        yAxisIndex: 0,
                        name:LANG["analysis_report_inverteracpower"],
                        type:'line',
                        data:acArr,
                        smooth:true,
                        itemStyle: {normal: {areaStyle: {type: 'default'}}}
                    }
                ]
            };
            var prChart = echarts.init(document.getElementById('realTimeEchart'));
            prChart.setOption(option);
        },

        //加载电站天气
        loadWeather: function (cityName) {
            var date = new Date();
            $("#month").text(date.getMonth() + 1);
            $("#date").text(date.getDate());
            $("#days").text(dialog.daysArr[date.getDay()]);

            var _this = this,
                url = 'http://api.map.baidu.com/telematics/v3/weather?location=' + cityName + '&output=json&ak=0h08YBBvVkr746zjlN9k0ftG94oMjEgM';
            $.ajax({
                url: url,
                type: 'GET',
                asyn: false,
                data: '',
                dataType: 'jsonp',
                success: function (res) {
                    if (res.status == 'success') {
                        var weatherArr = res.results[0].weather_data,
                            todayWthObj = weatherArr[0];//今天
                        _this.wertherName = todayWthObj.weather;
                        var tempArr = todayWthObj.temperature.split('~');
                        tempArr[0] = vlm.Utils.trim(tempArr[0]);
                        tempArr[1] = vlm.Utils.trim(tempArr[1]);
                        _this.temprature_high = tempArr[0];
                        _this.temprature_low = tempArr[1].replace('℃', '');
                        _this.windToday = todayWthObj.wind;
                        //未来三天天气
                        var newWeatherArr = [], imgType = '', weather = '', wind = '', monthNum = '', dayNum = '';

                        for (var i = 1; i < weatherArr.length; i++) {
                            var wthObj = weatherArr[i];
                            date.addDays(1);
                            monthNum = date.getMonth() + 1;
                            dayNum = date.getDate();
                            var tempArr = wthObj.temperature.split('~');
                            tempArr[0] = vlm.Utils.trim(tempArr[0]);
                            tempArr[1] = vlm.Utils.trim(tempArr[1]);
                            if (wthObj.weather == '晴') {
                                imgType = 'sunny';
                            } else if (wthObj.weather == '阴') {
                                imgType = 'overcast';
                            } else {
                                imgType = 'cloudy';
                            }
                            weather = wthObj.weather;
                            wind = wthObj.wind;
                            //$("#todayAdd" + (i + 1) + "WinDir").text(windDirectionTrans(wthObj.direction) + LANG["wind"]);

                            newWeatherArr.push({
                                monthNum: monthNum,
                                dayNum: dayNum,
                                high_future: tempArr[0], //最高温度
                                low_future: tempArr[1].replace('℃', ''), //最低温度
                                imgType: imgType, //晴、阴、多云
                                weather: weather,
                                wind: wind
                            });
                        }

                        var weatherStr = $('#weatherTpl').html();
                        var weatherLi = ejs.render(weatherStr, {newWeatherArr: newWeatherArr});
                        $('#weatherUl').html(weatherLi);


                        //for (var i = 0; i < weatherArr.length - 1; i++) {
                        //    var wthObj = weatherArr[i];
                        //    var tempArr=wthObj.temperature.split('~');
                        //    tempArr[0]=vlm.Utils.trim(tempArr[0]);
                        //    tempArr[1]=vlm.Utils.trim(tempArr[1]);
                        //    var temprature_high_future=tempArr[0];
                        //    var temprature_low_future=tempArr[1].replace('℃','');
                        //    //$("#todayAdd" + (i + 1) + "Img").attr("src", "../images/weather/" +28+ ".png");
                        //    //$("#todayAdd" + (i + 1) + "Highc").text(temprature_high_future);
                        //    //$("#todayAdd" + (i + 1) + "Lowc").text(temprature_low_future);
                        //    //$("#todayAdd" + (i + 1) + "WthName").text(wthObj.weather);
                        //    //$("#todayAdd" + (i + 1) + "WinLevel").text(windLevelTrans(wthObj.wind));
                        //    //$("#todayAdd" + (i + 1) + "WinDir").text(windDirectionTrans(wthObj.direction) + LANG["wind"]);
                        //}
                    }
                },
                error: function (res) {
                    alert(res.error);
                }

            });

        },

        //展示电站单元
        showPsUnit: function () {
            var url = "dialog/dialog_Matrix.html?ps_id=" + dialog.ps_id;
            $("#equalHourFm", parent.document).attr("src", url);
        },
        //关闭弹窗
        closeWindow: function () {
            $(".Monitor_left_c1_highLt", parent.document).removeClass("Monitor_left_c1_highLt");
            window.parent.closeEqualHourFm();
        }

    },
    mounted: function () {
        this.getPsDetailInfo1();  //整体信息
        this.loadDataForRealTimePower(); //实时功率
        this.loadWeather();  //天气
    }

})