
var dialog = {
    ps_id : "",
    screenVersion : "",
    ps_scheme : "",
    ps_type : "",
    daysArr : [LANG["common_date_day1"], LANG["common_date_day2"], LANG["common_date_day3"], LANG["common_date_day4"], LANG["common_date_day5"], LANG["common_date_day6"], LANG["common_date_day7"]]
};

$(function(){
    dialog.ps_id = $("#psId").val();
    dialog.ps_scheme = $("#psScheme").val();
    dialog.screenVersion = $("#screenVersion").val() ? $("#screenVersion").val(): "";
    $(".closeBtn").click(function(){
        $("#showPsInfo", parent.document).show();
        window.parent.closeEqualHourFm();
    });
    getPsDetailInfo1();
    loadDataForRealTimePower();
    loadWeather();
});

function getPsDetailInfo1(){
    var param = {};
    param["service"] = "getPsDetail";
    param["ps_id"] = dialog.ps_id;
    param["req"] = "app";
    $.ajax({
        url: "powerAction_loaddata.action",
        type: "post",
        data: param,
        dataType: "json",
        timeout: 1000 * 10,
        beforeSend: function(){

        },
        success: function (data) {
            var data = parseJson(data);
            if(data && data.result_data){
                var result = data.result_data;
                $(".psName").text(result.ps_name);
                $("#curPower_value").text(result.curr_power.value + result.curr_power.unit);
                $("#todayGeneration_value").text(result.today_energy.value + result.today_energy.unit);
                $("#totalGen_value").text(result.total_energy.value + result.total_energy.unit);
                $("#reduceCo2_value").text(result.co2_reduce.value + result.co2_reduce.unit);
                var lastMonthPr = result.p83023y;
                //var totalPr = result.p83023year;
                var totalPr = result.monthPr;
                dialog.ps_type = result.ps_type;
                //if($.isNumeric(lastMonthPr)){
                //    $("#title_a").text(lastMonthPr);
                //    drawLastMonthPR(lastMonthPr);//上月PR
                //}else{
                //    drawLastMonthPR(0);//上月PR
                //}
                /* switch (parseInt(dialog.ps_id)){
                 case 109189 :
                 totalPr = 85;
                 break;
                 case 108816 :
                 totalPr = 81;
                 break;
                 case 109192 :
                 totalPr = 80;
                 break;
                 }*///演示写死

                if($.isNumeric(totalPr)){
                    $("#title_a1").text(totalPr);
                    drawTotalPR(totalPr);//当月pr
                }else{
                    drawTotalPR(0);//当月pr
                }
                $("#psRoughInfo").append(result.description);
                /* if(result.diagram_url){
                 if(dialog.ps_id==108816){//广水
                 $("#psDiagram").attr("src", "http://file.isolarcloud.com/station/108816/file120161205120924582.jpg");//电站示意图
                 } else {
                 $("#psDiagram").attr("src", result.diagram_url);//电站示意图
                 }

                 }*/
                //superSlide
                if(result.images && result.images.length){
                    var images = result.images;
                    var htmlStr = "";
                    for(var i = 0; i < images.length; i ++){
                        if(images[i].pic_type==0){//电站图片
                            htmlStr += '<li><a><img src="' + images[i].picture_url + '" alt=""></a></li>'
                        } else {
                            $("#psDiagram").attr("src", images[i].picture_url);//电站示意图
                        }
                    }
                    $("#smPicture").html(htmlStr);
                    $("#bigPicture").html(htmlStr);
                }
                jQuery(".siteMore_con_ri_tog").slide({mainCell:".bd ul",titCell:".hd li",effect:"topLoop",autoPlay:true});
                jQuery(".siteMore_con_ri_tog .hd").slide({mainCell:"ul",prevCell:".siteMore_con_ri_togprev",nextCell:".siteMore_con_ri_tognext",vis:3,effect:"topLoop",scroll:1});
                jQuery(".siteMore_con_ri").slide({titCell:".siteMore_con_ri_tit li",mainCell:".siteMore_con_ri_wrap",effect:"fold",trigger:"click"})
            }
        },
        error: function () {
        }
    });
}

function drawLastMonthPR(pr){
    option = {
        color: ['#0086DB','#FC8A44'],
        series : [
            {
                hoverAnimation: false,
                type:'pie',
                radius : ['50%', '80%'],
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    }
                },
                data:[
                    {value:pr,
                        itemStyle: {
                            normal: {
                                color:"#0086DB"
                            }
                        }
                    },
                    {value:100 - pr,
                        itemStyle: {
                            normal: {
                                color:"#FC8A44"
                            }
                        }
                    }
                ]
            }
        ]
    };
    var prChart = echarts.init(document.getElementById('lastMonthPr'));
    prChart.setOption(option);
}

function drawTotalPR(pr){
    option = {
        color: ['#0086DB','#62C5FC'],
        series : [
            {
                hoverAnimation: false,
                type:'pie',
                radius : ['50%', '80%'],
                itemStyle : {
                    normal : {
                        label : {
                            show : false
                        },
                        labelLine : {
                            show : false
                        }
                    }
                },
                data:[
                    {value:pr,
                        itemStyle: {
                            normal: {
                                color:"#0086DB"
                            }
                        }
                    },
                    {value:100 - pr,
                        itemStyle: {
                            normal: {
                                color:"#62C5FC"
                            }
                        }
                    }
                ]
            }
        ]
    };

    var prChart = echarts.init(document.getElementById('totalPr'));
    prChart.setOption(option);

}

function loadDataForRealTimePower(){var param = {};
    param["service"] = "psHourPointsValue";
    param["ps_id"] = dialog.ps_id;
    param["req"] = "app";
    $.ajax({
        url: "powerAction_loaddata.action",
        type: "post",
        data: param,
        dataType: "json",
        timeout: 1000 * 10,
        beforeSend: function(){

        },
        success: function (data) {
            var data = parseJson(data);
            if(data && data.result_data){
                var date = new Date();
                var hours = date.getHours();
                var min = date.getMinutes();
                if(min<5){
                    hours = hours-1;
                }
                var result = data.result_data;
                var powerArr = result.p83033List.slice(0,hours);
                var radiaArr = result.p83012List.slice(0,hours);
                var dclist = result.p83039List.slice(0,hours);
                var aclist = result.p83002List.slice(0,hours);
                var powerUnit = result.p83033_unit;
                var radiaUnit = result.p83012_unit;
                var dc_unit = result.p83039_unit;
                var ac_unit = result.p83002_unit;


                drawRealTimeEchart(dealEchartLineArr(powerArr), dealEchartLineArr(radiaArr),dealEchartLineArr(dclist), dealEchartLineArr(aclist), powerUnit, radiaUnit, dc_unit, ac_unit);
            }
        },
        error: function () {
        }
    });
}

function dealTimeNum(val){
    var rest = "--";
    if($.isNumeric(val)){
        rest = val > 9? val:("0"+val);
    }
    return rest;
}

//实时功率曲线
function drawRealTimeEchart(powerArr, radiaArr, dcArr, acArr, powerUnit, radiaUnit, dc_unit, ac_unit){
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
}

//加载电站天气
function loadWeather(){
    var param = {};
    param["ps_id"] = dialog.ps_id;
    param["service"] = "getWeatherInfo";
    param["req"] = "app";
    $.ajax({
        url: "powerAction_loaddata.action",
        type: "post",
        dataType: "json", //后台返回的响应数据形式json、xml、html、text、script、_default
        data: param,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",//指定浏览器传输form表单参数时采用的字符集
        beforeSend: function(){
            $("#todayvalue").text("--");
            $("#tomorrowvalue").text("--");
            var date = new Date();
            $("#month").text(date.getMonth() + 1);
            $("#date").text(date.getDate());
            $("#days").text(dialog.daysArr[date.getDay() + 1]);
            date.addDays(1);
            $(".curMonthAdd1").text(date.getMonth() + 1);
            $(".curDateAdd1").text(date.getDate());
            date.addDays(1);
            $(".curMonthAdd2").text(date.getMonth() + 1);
            $(".curDateAdd2").text(date.getDate());
            date.addDays(1);
            $(".curMonthAdd3").text(date.getMonth() + 1);
            $(".curDateAdd3").text(date.getDate());
        },
        success: function (data) {
            data = eval("(" + data + ")");
            if(data && data.result_data.length >= 3) {
                data = data.result_data;
                var todayWthObj = data[3];//今天
                $("#wertherName").text(todayWthObj.code_name);
                //$("#todayImg").attr("src", ctx + "/images/weather/" + todayWthObj.code + ".png");
                $("#highc").text(todayWthObj.highc);
                $("#lowc").text(todayWthObj.lowc);
                $("#todayWind").text((($.isNumeric(todayWthObj.speed) && todayWthObj.speed >= 0.3)? (windDirectionTrans(todayWthObj.direction) + LANG["wind"] + " ") :"") + windLevelTrans(todayWthObj.speed));
                $(".environmentCom").text(todayWthObj.p83016);
                $("#batteryPlateCom").text(todayWthObj.p83017);
                //未来三天天气
                for(var i = 0; i < data.length - 1; i ++){
                    var wthObj = data[i];
                    $("#todayAdd" + (i + 1) + "Img").attr("src", ctx + "/images/weather/" + wthObj.code + ".png");
                    $("#todayAdd" + (i + 1) + "Highc").text(wthObj.highc);
                    $("#todayAdd" + (i + 1) + "Lowc").text(wthObj.lowc);
                    $("#todayAdd" + (i + 1) + "WthName").text(wthObj.code_name);
                    $("#todayAdd" + (i + 1) + "WinLevel").text(windLevelTrans(wthObj.speed));
                    if($.isNumeric(wthObj.speed) && wthObj.speed >= 0.3){
                        $("#todayAdd" + (i + 1) + "WinDir").text(windDirectionTrans(wthObj.direction) + LANG["wind"]);
                    }
                }
            }
        }
    });
}

//展示电站单元
function showPsUnit(){
    if($("#user_id",parent.document).val()=="12900"){//东旭集团用户定制，不跳转
        return;
    }
    var url = ctx + "/dialog/dialog_psUnit.jsp?ps_id=" + dialog.ps_id + "&ps_scheme=" + dialog.ps_scheme + "&ps_type=" + dialog.ps_type + "&scrnvs=" + dialog.screenVersion;
    $("#equalHourFm", parent.document).attr("src", url);
}
