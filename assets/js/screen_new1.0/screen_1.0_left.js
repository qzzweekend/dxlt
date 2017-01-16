
var screen3_left = {
    isChangePower : false,//发电数据是否变化
    isfirstLoad : 1,//是否第一次请求
    powerArray: [],
    todayPsGenPower : 0//今日电站发电量
};

$(function () {
    var areacode = $("#areacode").val();

    refreshLeftSide(areacode);//左侧数据获取

    window.setTimeout(function(){
        hideLoading();
    },10000);

    /*setInterval(function(){
     refreshLeftSide();
     },60000);*/
});

//左侧数据
function refreshLeftSide(areacode) {
    var param = {};
    param["areacode"] = areacode;
    param["isfirstLoad"] = "1";
    param["service"] = "getKpiByUserIdAndAreaCode";
    $.ajax({
        type: "post",
        data: param,
        url: '/dxlt/assets/data/powerAction_loaddata.json',
        async: true,
        dataType: "json",
        catch: false,
        beforeSend: function () {
            $("#currentPowerValue").val(0);
            screen3_left.todayPsGenPower = 0;
            $("#just_capacity").text("--");
            $("#just_capacity_unit").text("");
            $("#exist_capacity").text("--");
            $("#exist_capacity_unit").text("");
            $("#safe_operation").text("--");
        },
        success: function (data, s) {
            //var object = parseJson(data);
            var object = data;
            if (object != null) {
                if ($(object).length > 0 && object.result_code == 1) {
                    var result = object.result_data;
                    writeLeftData(result);
                }
            } else {
                console.log("获取累计发电数据失败");
            }
        },
        error:function(res){
           console.log("error获取累计发电数据失败");
        },
        complete:function(){
            //hideLoading();
        }
    })
}

function writeLeftData(result_data) {
    var result = result_data;
    var total_energy = 0;
    if(!(isNotNull(result)&&isNotNull(result.total_energy_unit))){
        showGenTrends();
        console.log("writeLeftData请求数据错误*****："+result_data);
        return;
    }
    var  today_energy_virgin = result.today_energy_virgin;
    var  today_power_virgin = result.curr_power_virgin;
    var  curr_power_virgin = result.curr_power_virgin;

    /*if($.isNumeric(today_energy_virgin)){
     lastReqTodayEnergy  = parseInt(today_energy_virgin);
     }*/
    var $currentP = $("#currentPower");
    var $currentGL = $("#currentGL");
    var $currentGLUnit = $("#currentGLUnit");

    $currentGL.text(parseInt(result.curr_power_virgin));//当前功率
    //$currentGLUnit.text(replaceUnit(result.curr_power_unit));

    $currentGLUnit.html("kW");

    /*$currentP.text(parseInt(today_energy_virgin));//今日发电
     $("#currentPowerUnit").html(replaceUnit(LANG["degree"]));//今日发电*/
    $currentP.text(toFix(result.today_energy,2));//今日发电
    $("#currentPowerUnit").html(replaceUnit(result.today_energy_unit));

    if($("#org_id").val() == "3040") {//东旭集团定制
        unitTransForDx(result);
    }
    $("#just_capacity").text(toFix(result.just_capacity));
    $("#just_capacity_unit").text(result.just_capacity_unit);
    $("#exist_capacity").text(toFix(result.exist_capacity));
    $("#exist_capacity_unit").text(result.exist_capacity_unit);
    $("#safe_operation").text(result.safe_operation);

    //$("#year_gen_value").text(toFix(result.year_energy,3).toFixed(2));//年累计
    $("#year_gen_value").text(toFix(result.year_energy_add_today_energy,3).toFixed(2));
    $("#year_gen_unit").empty().append(replaceUnit(result.year_energy_add_today_energy_unit));

    $("#total_gen_value").html(toFix(result.total_energy,3).toFixed(2));
    $("#total_gen_unit").empty().append(replaceUnit(result.total_energy_unit));


    var exist_capacity = toFix(result.exist_capacity);
    $("#currentPowerValue").val(result.today_energy);
    $("#currentPowerUnit").html(replaceUnit(result.today_energy_unit));

    $("#currentPowerValue_virgin").val(result.today_energy_virgin);

    $("#co2").html(result.gas_mitigation + result.gas_mitigation_unit);//co2减排
    //$("#meter").html(result.equivalent_mileage + result.equivalent_mileage_unit);//汽车里程
    $("#standard_coal").html(result.save_coal + result.save_coal_unit);//标准煤
    $("#dxzs").html(result.plant_tree + result.plant_tree_unit);//等效植树
    $("#so2").html(result.so2_reduce + result.so2_reduce_unit);//so2
    var dz_data;
    var pieName;
    var lengendData;
    var title = "  "+exist_capacity +"\n"+ "("+result.exist_capacity_unit+")";
    $("#title_a").html(toFix(result.total_capacity));
    $("#title_b").html(result.total_capacity_unit);
    screen3_left.powerArray = result.powerType;

    dz_data = [];
    lengendData = [];
    pieName = LANG["powerStationConstruct"];
    var colorArray = [];
    colorArray.push("#0CCA26");
    colorArray.push("#FDD600");
    colorArray.push("#2E7FF9");
    var ps_exist_capacity = toFix(result.exist_capacity);//并网容量
    var ps_exist_capacity_unit = result.exist_capacity_unit;//并网
    var ps_exist_capacity_count = result.ps_exist;//并网
    var ps_just_capacity = toFix(result.just_capacity);//在建容量
    var ps_just_capacity_unit = result.just_capacity_unit;//在建
    var ps_just_capacity_count = result.ps_just;//在建
    var no_just_capacity = toFix(result.no_capacity);//未建容量
    var no_just_capacity_unit = result.no_capacity_unit;//未建
    var no_just_capacity_count = result.ps_no;//未建
    $("#exist_ps_count").text(($.isNumeric(ps_exist_capacity_count)?ps_exist_capacity_count:"--") + LANG["psUnit_zuo"]);
    $("#just_ps_count").text(($.isNumeric(ps_just_capacity_count)?ps_just_capacity_count:"--") + LANG["psUnit_zuo"]);
    $("#no_ps_count").text(($.isNumeric(no_just_capacity_count)?no_just_capacity_count:"--") + LANG["psUnit_zuo"]);
    $("#mc3_exist_capacity").text(ps_exist_capacity + ps_exist_capacity_unit);
    $("#mc3_just_capacity").text(ps_just_capacity + ps_just_capacity_unit);
    $("#no_capacity").text(no_just_capacity + no_just_capacity_unit);
    var ps_array = [ps_exist_capacity, ps_just_capacity, no_just_capacity];
    for(var i=0;i<ps_array.length;i++){
        var tempp = {};
        tempp["value"] = ps_array[i];
        tempp["color"] = colorArray[i];
        dz_data.push(tempp);
    }
    loadPowerNumChart(dz_data,pieName,lengendData,title);

    if(screen3_left.isfirstLoad){
        var str="";
        var str2="";
        for(var i=0;i<screen3_left.powerArray.length;i++){
            if(i==0){
                str+='<li role="presentation" class="active" onclick="showPowerBuild(this)" name="'+i+'"><a href="#" style="color: #ffffff">'+screen3_left.powerArray[i]["pstypename"]+'</a></li>';
                str2+='<table  class="table table-striped"></table>';
            }else{
                str+='<li role="presentation" onclick="showPowerBuild(this)" name="'+i+'"><a href="#" style="color: #ffffff">'+screen3_left.powerArray[i]["pstypename"]+'</a></li>';
                str2+='<table  class="table table-striped" style="display: none"></table>';
            }
        }
        $("#powerConstruct").html(str);
        $("#powerbyType").html(str2);
        screen3_left.isfirstLoad = 0;
    }
    showGenTrends();//月发电趋势依赖 当日发电（ todayPsGenPower || 集团当日发电：$("#currentPowerValue").val() ）
}

var ll;
/**加载电量数字滚动**/
function slideNum(total_energy) {

    var array = total_energy.toFixed(0).split("");
    var c = $(".c1-main li");
    var j = array.length;
    var l = c.length-j;
    for(var i = 0;i<l;i++){
        $(c[i]).css("background-position-x", '200px');
        $(c[i]).css("background-position-y", '0');
    }
    for (var i = c.length-1; i > -1; i--) {
        if (j-1 > -1) {
            var num = 0;
            if(array[j]=="."){
                num = 90.1;
            } else if(array[j]==","){
                num = 100;
            } else {
                num = parseInt(array[j-1]) * 9.090909090909091;
            }
            var y = $(c[i]).css("background-position-y").replace("%","");
            var m = 300;
            if(y>num){
                m = 0;
                //$(c[i]).css("background-position-y",num + '%');
            }
            $(c[i]).animate({//滚动动画
                    "background-position-x": '0',
                    "background-position-y": '' + num + '%'
                }, m, 'swing'
            );
            j--;
        }

    }

}

//获取区域的电站建立情况图表
function loadPowerNumChart(dz_data,pieName,lengendData,title) {
    //$("#pieName").html(pieName);
    require.config({
        paths: {
            'echarts': 'js/plugin/echarts/build/dist'
        }
    });
    require([
            'echarts',
            'echarts/chart/pie',
            'echarts/chart/funnel'
        ],
        function (ec) {
            drawPowerNumChart(ec,dz_data,pieName,lengendData,title);
        }
    );
}

function drawPowerNumChart(ec,dz_data,pieName,lengendData,title) {
    var powerNum_option = {
        /*tooltip : {
         trigger: 'item',
         formatter: "{a} <br/>{b} : {c} ({d}%)"
         },*/
        title: {
            show:false,
            text: title,
            x: '35',
            y: '90',
            itemGap: 20,
            textStyle : {
                color : '#ffffff',
                fontFamily : 'Microsoft YaHei',
                fontSize : 18,
                fontWeight : '100'
            }
        },
        color:['#2F7FFA','#20B126','#FDD600'],
        series: [
            {
                name: pieName,
                type: 'pie',
                center: ['50%','45%'],
                radius: ['55%', '90%'],
                itemStyle: {
                    normal: {
                        color: function (value) {
                            return value.data.color;
                        },
                        label: {
                            show : false
                        },
                        labelLine: {
                            show : false
                        }
                    }
                },
                data: dz_data
            }
        ]
    };

    var powerNumChart = ec.init(document.getElementById('powernumChart'));
    //window.onresize = powerNumChart.resize;
    powerNumChart.setOption(powerNum_option, true);
}

function unitTransForDx(result){//东旭定制单位
    var temArr = ['just_capacity', 'exist_capacity', 'no_capacity', 'total_capacity'];
    //在建装机功率
    for(var i = 0; i < temArr.length; i ++){
        var unit = result[temArr[i] + "_unit"];
        var val = parseFloat(result[temArr[i]]);
        if(unit=="万千瓦" || unit=="万KW" || unit=="WKW"){
            if(val >= 100){
                result[temArr[i]] = val / 100;
                result[temArr[i] + "_unit"] = 'GW';
            }else{
                result[temArr[i]] = val * 10;
                result[temArr[i] + "_unit"] = 'MW';
            }
        }else if(unit=="千瓦" || unit=="千W"){
            result[temArr[i] + "_unit"] = 'kW';
        }else if(unit=="瓦"){
            result[temArr[i] + "_unit"] = 'W';
        }
    }
}