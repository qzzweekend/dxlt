var screen3 = {
    ps_id: "", //被点击电站的ps_id
    earthChart: null,
    isFrist : true,//是否点击操作页面
    version : "",
    preVersion : false,//之前的版本
    ps_target : 0, //电站指标(1：点击刷新)
    show_dinfo : 0, //是否显示‘电站详细信息’按钮（0：不显示）
    psScheme : 2,//电站类型; (2:组串式,显示单元；其他 显示逆变器)
    showEarthOrChina : true,//关闭弹出框时显示 true:3D地球，false;ChinaMap
    initPageCss : function() {
        //设置滚动条
        //$(window).load(function () {
        //    $(".box_slidetab").mCustomScrollbar();  qzz
        //});
        //控制隔行变色
        $('.table_box tr:nth-child(2n) td').css("background", "#0a5f9d");
        //手风琴
        $(".list_slide ul li div.slit_slidetitle").click(function () {
            if ($(this).children("div.em_img").hasClass("jia_back")) {
                $(this).children("div.em_img").removeClass("jia_back").addClass("jian_back");
                $(this).siblings().slideDown();
                $(this).parents().siblings().children("div.table_box").slideUp();
                $(this).parents().siblings().children().children("div.em_img").removeClass("jian_back").addClass("jia_back");
            } else {
                $(this).children("div.em_img").removeClass("jian_back").addClass("jia_back");
                $("#main_powerBuild").find("div.table_box").hide();
            }
        })
        $(".index-main").css("height", $(window).height() - 111);
        $(".index-main").css("width", $(window).width());
        $(".index-center").css("width", $(window).width() - 421 - 421 - 40);
        $(".index-center").css("height", $(window).height() - 111);
        $("#main").css("height", $(window).height() - 271);
        $(window).resize(function () {
            $(".index-main").css("height", $(window).height() - 111);
            $(".index-main").css("width", $(window).width());
            $(".index-center").css("width", $(window).width() - 421 - 421 - 40);
            $(".index-center").css("height", $(window).height() - 111);

            $("#main").css("height", $(window).height() - 271);
            $(".clist-main").css("height", $(window).height() - 150);
            $(".clist").css("height", $(window).height() - 111);
        });
        $("#just_capacity_span").bind("click", function(){
            $(".M_bottom_b1").addClass("M_bottom_b1_clicked");
            $(".main").hide();
            hideLoading();
            $("#equalHourFm").slideToggle();
            var url = bathPath + "/dialog/dialog_buildProgressRanking.jsp?scrnvs=3";
            $("#equalHourFm").attr("src", url);
        });
    }
};

$(function(){
    screen3.initPageCss();
    initLogo();
    /*setInterval(function () {
     $("#currentTime").text(new Date().toLocaleString() + "  " + screen3.version);
     }, 1000);*/

    var refreshMin = 60;
    setInterval(function () {
        var myDate = new Date();
        var hour = myDate.getHours();
        if (hour == 6 || hour == 5) {//1点刷新
            window.location.reload(true);
        }
    }, 60 * 1000 * refreshMin);//

    $("#mtag1").click(function(){
        $(".location").toggle();
        if($("#mtag1").hasClass("grayDiv")){
            $("#mtag1").removeClass("grayDiv");
        }else{
            $("#mtag1").addClass("grayDiv");
        }
    });
    $("#mtag2").click(function(){
        $(".location2").toggle();
        if($("#mtag2").hasClass("grayDiv")){
            $("#mtag2").removeClass("grayDiv");
        }else{
            $("#mtag2").addClass("grayDiv");
        }
    });
    $("#mtag3").click(function(){
        $(".location3").toggle();
        if($("#mtag3").hasClass("grayDiv")){
            $("#mtag3").removeClass("grayDiv");
        }else{
            $("#mtag3").addClass("grayDiv");
        }
    });
    $("div[name='portal']").bind("click",function(){
        if($(".maps_show").hasClass("mapbox_show")){
            return;
        }
        showLoading();
        $('.whileShowMapInfo').hide();
        $(".cityPoint").hide();
        var id = "";
        if($(this).find(".module").length>0){
            id = $(this).find(".module")[0].id;
        }

        $("div[name='portal']").addClass("grayDiv");
        $(this).removeClass("grayDiv");
        if(id=='plan'){//点击发电计划
            $(this).addClass("Monitor_left_c3_highLt");
            if(screen3.preVersion){
                clickPowerPlan();
            }else{
                var url = bathPath + "/dialog/dialog_psGeneratePlan.jsp?scrnvs=3";
                showDialogIframe(url);
            }
        } else if(id=="power"){//点击发电趋势
            $(this).addClass("Mc4_bg_highLt");
            if(screen3.preVersion){//todo 暂时屏蔽（发电趋势touch slide）
                if(genTrendsDateType == 2){
                    clickPowerTrend();
                }else if(genTrendsDateType == 1){
                    clickPowerTrend_today();
                }else{//年发电趋势弹出
                    clickPowerTrend();
                }
            }else{
                var url = bathPath + "/dialog/dialog_equalHour.jsp?scrnvs=3";
                showDialogIframe(url);
            }
        } else if(id=="capacity"){//点击性能排名
            $(this).addClass("Monitor_left_c2_highLt");
            if(screen3.preVersion){
                clickCapacity();
            }else{
                var url = bathPath + "/dialog/dialog_psPr.jsp?scrnvs=3";
                showDialogIframe(url);
            }
        } else if(id=="ps_build"){//点击电站建设
            $(this).addClass("Monitor_right_c3_highLt");
            if(screen3.preVersion){
                clickPowerBuild();
            }else{
                var url = bathPath + "/dialog/dialog_psTable_psBuild.jsp?scrnvs=3";
                showDialogIframe(url);
            }
        } else if(id=="dayChart"){//点击社会贡献 shgx
            $(this).addClass("Mc5_bg_highLt");
            var url = bathPath + "/dialog/dialog_psTable_energySaving.jsp?scrnvs=3";
            showDialogIframe(url);
            //clickShgx();
        } else if(id=="power_lj"){//点击累计发电
            $(this).addClass("Monitor_left_c1_highLt");
            if(screen3.preVersion){
                clickPower();
            }else{
                var url = bathPath + "/dialog/dialog_orgCurYearGen.jsp?scrnvs=3";
                showDialogIframe(url);
            }
        } else if(id=="powernumChart"){//电站建设
            return;
            clickPowerTrend_today();
        } else {
            goIndex();
        }
        screen3.isFrist = false;
    });

    $(".goback").bind("click",function(){
        showMap();
    });

    draw3DMap();
    loadCapacityChart();//性能排名  qzz
    loadPlanChart();//发电计划  qzz
    //getYearPercentageComplete();
    //每小时更新下地球状态
    setInterval(function () {
        var earth = screen3.earthChart;
        updateEarthTime(earth);
    }, 1000*60*60);
});

function showDialogIframe(url){
    hideLoading();
    $(".main").hide();
    $("#equalHourFm").attr("src", url);
    $("#equalHourFm").slideToggle();
}

function initSelect2(){
    $('#psSearchName').select2();
}

function closeEqualHourFm(){
    $("#equalHourFm").slideToggle();
    $("#equalHourFm").attr("src", "");
    showMap();
    if(detailInfo){
        $("#grayLayer").removeClass("grayLayer");
        detailInfo = false;
    }
}

function showMap(){
    $(".Monitor_left_c2_highLt").removeClass("Monitor_left_c2_highLt");
    $(".main").hide();
    $("#main").show();
    $("div[name='portal']").removeClass("grayDiv");
    if(!screen3.showEarthOrChina){
        chinaClick();
    }
}

//返回主页
function goIndex(){
    $(".main").hide();
    $("#main").show();
    $("div[name='portal']").removeClass("grayDiv");
}

//点击发电计划
function clickPowerPlan(){
    //$("#main_detail").html();
    $(".main").hide();
    $("#main_detail").show();
    var len = $("#box_tslide2").find(".box_nav1 li").length;
    if(len!=0&&!screen3.isFrist){//不是第一次加载，不在请求，直接显示
        hideLoading();
        return;
    }
    var param = {};
    param["valid_flag"] = "1";
    param["service"] = "getPlanAndActualPower";
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
            if (data != "") {
                var object = parseJson(data);
                log("getPsList:" + data);
                if ($(object).length > 0 && object.result_code == 1&&object.result_data!=null) {
                    var powerList = object.result_data.list;
                    if(powerList!=null&&powerList!=undefined){
                        var length = powerList.length;
                        var j = parseInt(length/6);//分6个一组
                        var x = length%6;
                        if(j >= 0 && x > 0 || x >= 0 && j > 0){
                            var htmlli = "";
                            var len = 0;
                            for(var i = 0;i<j;i++){

                                len = (i+1)*6;
                                var a = i*6;
                                for(a;a<len;a++){
                                    if(a == i*6){
                                        htmlli = htmlli +"<ul>";
                                    }
                                    var obj = powerList[a];
                                    var ps_name = obj.ps_name;
                                    var rate = parseInt(obj.year_rate*100);
                                    htmlli = htmlli + '<li><div class="box_h1 clearfix"><div class="fl box_t2">'+ps_name+'</div>' +
                                        '<div class="fr box_t3">' + LANG["yearFinish"] +' ' +($.isNumeric(rate)?rate:'--')+'%</div></div><div class="box_ch">' +
                                        '<div id="psPlanChart'+a+'" name="psPlanChart'+a+'" style="height: 120px;width: 340px"></div></div></li>';
                                    if(a+1==len){
                                        htmlli =htmlli +"</ul>"
                                    }
                                }
                            }
                            for(var y=0;y<x;y++){
                                if(y == 0){
                                    htmlli = htmlli +"<ul>";
                                }
                                var obj = powerList[len+y];
                                var ps_name = obj.ps_name;
                                if(ps_name.length>8){
                                    ps_name = ps_name.substring(0,8)+"...";
                                }
                                var rate = parseInt(obj.year_rate*100);
                                htmlli = htmlli + '<li><div class="box_h1 clearfix"><div class="fl box_t2">'+ps_name+'</div>' +
                                    '<div class="fr box_t3">' + LANG["yearFinish"] + ' '+($.isNumeric(rate)?rate:'--')+'%</div></div><div class="box_ch">' +
                                    '<div id="psPlanChart'+(len+y)+'" name="psPlanChart'+(len+y)+'" style="height: 120px;width: 340px"></div></div></li>';
                                if(len+y+1==length){
                                    htmlli =htmlli +"</ul>"
                                }
                            }

                            $("#box_tslide2 .box_list2").html(htmlli);
                        }
                    }

                    if($("#box_tslide2").find(".box_nav1 li").length>0){
                        $("#box_tslide2").find(".box_nav1 ul").empty();
                    }

                    TouchSlide({
                        slideCell:"#box_tslide2",
                        titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
                        effect:"leftLoop",
                        autoPage:true, //自动分页
                    });

                    for(var i = 0;i<powerList.length;i++){
                        var actualData = powerList[i].actualList;
                        var planData = powerList[i].planList;//[19,30,20,36,31,20,24,15,25,30,23,28];
                        drawPSPlanChart(i,actualData,planData);
                    };
                }
            } else {
                log("获取电站数据失败");
            }
        },
        complete : function(){
            hideLoading();
        }
    });

}

//点击月发电趋势
function clickPowerTrend(){
    $(".main").hide();
    $("#main_powerTrend").show();
    //var powerList = getPowerList();
    var len = $("#box_tslide_powerTrend li").length;
    if(len!=0&&!screen3.isFrist){//不是第一次加载，不在请求，直接显示
        hideLoading();
        return;
    }
    $.post('powerAction_getPsList.action',"",function(data){
        hideLoading();
        var object = parseJson(data);
        if (object != null) {
            log("getPsList:" + data);
            if ($(object).length > 0 && object.result_code == 1&&object.result_data!=null) {
                var powerList = object.result_data.powerList;
                if(powerList!=null&&powerList!=undefined){
                    var length = powerList.length;
                    var j = parseInt(length/9);
                    var x = length%9;
                    if(j >= 0 && x > 0 || x >= 0 && j > 0){
                        var htmlli = "";
                        var len = 0;
                        for(var i = 0;i<j;i++){

                            len = (i+1)*9;
                            var a = i*9;
                            for(a;a<len;a++){
                                if(a == i*9){
                                    htmlli = htmlli +"<ul>";
                                }
                                var obj = powerList[a];
                                var ps_name = obj.ps_name;
                                htmlli = htmlli + '<li><div class="box_h2" title="'+obj.ps_name+'">'+ps_name+'</div>' +
                                    '<div class="box_con"><div class="title1">'+obj.yestoday_energy+replaceUnit(obj.yestoday_energy_unit)+'</div>' +
                                    '<div class="title2">'+obj.yestoday_radiation+obj.yestoday_radiation_unit+'</div></div></li>';
                                if(a+1==len){
                                    htmlli =htmlli +"</ul>"
                                }
                            }
                        }

                        var x = len;
                        for(len;len<length;len++){
                            if(x==len){
                                htmlli = htmlli +"<ul>";
                            }
                            var obj = powerList[len];
                            var ps_name = obj.ps_name;
                            if(ps_name.length>8){
                                ps_name = ps_name.substring(0,8)+"...";
                            }
                            htmlli = htmlli + '<li><div class="box_h2" title="'+obj.ps_name+'">'+ps_name+'</div>' +
                                '<div class="box_con"><div class="title1">'+obj.yestoday_energy+replaceUnit(obj.yestoday_energy_unit)+'</div>' +
                                '<div class="title2">'+obj.yestoday_radiation+obj.yestoday_radiation_unit+'</div></div></li>';
                            if(len+1==length){
                                htmlli =htmlli +"</ul>"
                            }
                        }

                        $("#box_tslide_powerTrend .box_list1").html(htmlli);
                    }
                }
                if($("#box_tslide_powerTrend").find(".box_nav1 li").length>0){
                    $("#box_tslide_powerTrend").find(".box_nav1 ul").empty();
                }
                TouchSlide({
                    slideCell:"#box_tslide_powerTrend",
                    titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
                    effect:"leftLoop",
                    autoPage:true //自动分页
                    //boxSize:20//自定义分页按钮长度
                });
            }
        } else {
            log("获取电站数据失败");
        }
    },'json');

}

//点击日发电趋势
function clickPowerTrend_today(){
    $("#main_power").show();
    $("#main_powerTrend_today").show();
    //var powerList = getPowerList();
    var len = $("#box_tslide_powerTrend_today li").length;
    if(len!=0&&!screen3.isFrist){//不是第一次加载，不在请求，直接显示
        hideLoading();
        return;
    }
    $.post('powerAction_getPsList.action',"",function(data){
        hideLoading();
        var object = parseJson(data);
        if (object != null) {
            log("getPsList:" + data);
            if ($(object).length > 0 && object.result_code == 1&&object.result_data!=null) {
                var powerList = object.result_data.powerList;
                if(powerList!=null&&powerList!=undefined){
                    var length = powerList.length;
                    var j = parseInt(length/9);
                    var x = length%9;
                    if(j >= 0 && x > 0 || x >= 0 && j > 0){
                        var htmlli = "";
                        var len = 0;
                        for(var i = 0;i<j;i++){

                            len = (i+1)*9;
                            var a = i*9;
                            for(a;a<len;a++){
                                if(a == i*9){
                                    htmlli = htmlli +"<ul>";
                                }
                                var obj = powerList[a];
                                var ps_name = obj.ps_name;
                                htmlli = htmlli + '<li><div class="box_h2" title="'+obj.ps_name+'">'+ps_name+'</div>' +
                                    '<div class="box_con"><div class="title2">'+obj.p83033+replaceUnit(obj.p83033_unit)+'</div>' +
                                    '<div class="title1">'+obj.today_energy+replaceUnit(obj.today_energy_unit)+'</div></div></li>';
                                if(a+1==len){
                                    htmlli =htmlli +"</ul>"
                                }
                            }
                        }

                        var x = len;
                        for(len;len<length;len++){
                            if(x==len){
                                htmlli = htmlli +"<ul>";
                            }
                            var obj = powerList[len];
                            var ps_name = obj.ps_name;
                            if(ps_name.length>8){
                                ps_name = ps_name.substring(0,8)+"...";
                            }
                            htmlli = htmlli + '<li><div class="box_h2" title="'+obj.ps_name+'">'+ps_name+'</div>' +
                                '<div class="box_con"><div class="title1">'+obj.p83033+replaceUnit(obj.p83033_unit)+'</div>' +
                                '<div class="title2">'+obj.today_energy+replaceUnit(obj.today_energy_unit)+'</div></div></li>';
                            if(len+1==length){
                                htmlli =htmlli +"</ul>"
                            }
                        }

                        $("#box_tslide_powerTrend_today .box_list1").html(htmlli);
                    }
                }
                if($("#box_tslide_powerTrend_today").find(".box_nav1 li").length>0){
                    $("#box_tslide_powerTrend_today").find(".box_nav1 ul").empty();
                }
                TouchSlide({
                    slideCell:"#box_tslide_powerTrend_today",
                    titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
                    effect:"leftLoop",
                    autoPage:true, //自动分页
                    //boxSize:20//自定义分页按钮长度
                });
            }
        } else {
            log("获取电站数据失败");
        }

    },'json');
}

//点击性能排名
function clickCapacity(){
    $(".main").hide();
    $("#main_capacity").show();
    var len = $("#main_capacity tr").length;
    if(len!=0&&!screen3.isFrist){//不是第一次加载，不在请求，直接显示
        hideLoading();
        return;
    }
    //var powerList = getPowerList();
    $.post('powerAction_getPsList.action',"",function(data) {
        hideLoading();
        var object = parseJson(data);
        if (object != null) {
            log("getPsList:" + data);
            if ($(object).length > 0 && object.result_code == 1 && object.result_data != null) {
                var powerList = object.result_data.powerList;
                if(powerList!=null&&powerList!=undefined){
                    var length = powerList.length;
                    var trHtml = "";
                    for(var i = 0;i<length;i++){
                        var obj = powerList[i];
                        var pr = obj.pr_month=="--"?"--":(obj.pr_month+"%");//PR
                        var capacity = obj.design_capacity+obj.design_capacity_unit;//装机容量
                        var sw_power = obj.yestoday_energy+replaceUnit(obj.yestoday_energy_unit);//上网电量
                        var zfzl = obj.yestoday_radiation+obj.yestoday_radiation_unit;//总辐照量
                        trHtml = trHtml + '<tr><td class="tab_title1">'+obj.ps_name+'</td>' +
                            '<td class="tab_title2">'+pr+'</td>' +
                            '<td class="tab_title3">'+capacity+'</td><td class="tab_title4">'+sw_power+'</td>' +
                            '<td class="tab_title5">'+zfzl+'</td></tr>';
                    }
                    $("#main_capacity table").html(trHtml);
                }
            }
        }

    },'json');

}

//点击电站建设
function clickPowerBuild(){
    $(".main").hide();
    $("#powerStationMap").hide();
    $("#main_powerBuild").show();
    //var powerList = getPowerList();
    var len = $("#main_powerBuild tr").length;
    if(screen3.isFrist||len==0){
        $.post('powerAction_getPsList.action',"",function(data) {
            var object = parseJson(data);
            if (object != null) {
                log("getPsList:" + data);
                if ($(object).length > 0 && object.result_code == 1 && object.result_data != null) {
                    var powerList = object.result_data.powerList;
                    if(powerList!=null&&powerList!=undefined){
                        var length = powerList.length;
                        var str=[];
                        for(var i = 0;i<length;i++){
                            var obj = powerList[i];
                            var psType = obj.ps_type_code;
                            var area_name = checkGetValue(obj.area_name);
                            var design_capacity = checkGetValue(obj.design_capacity)+checkGetValue(obj.design_capacity_unit);
                            var ps_type = checkGetValue(obj.ps_type_code);
                            var sys_scheme = checkGetValue(obj.sys_scheme);
                            for(var j=0;j<screen3_left.powerArray.length;j++){
                                if(psType == screen3_left.powerArray[j]["pstype"]){
                                    str[j]+='<tr><td class="tab_title1">'+checkGetValue(obj.ps_name)+'</td>' +
                                        '<td class="tab_title2">'+design_capacity+'</td>' +
                                        '<td class="tab_title3">'+sys_scheme+'</td>' +
                                        '<td class="tab_title4">'+area_name+'</td></tr>';
                                }
                            }
                        }
                        for(var k=0;k<screen3_left.powerArray.length;k++){
                            $("#powerbyType table").eq(k).html(str[k]);
                        }
                    }
                }
            }
            hideLoading();
        },'json');
    } else {
        hideLoading();
    }
}

//点击累计发电
function clickPower(){
    screen3_left.isChangePower = false;
    clickModuleCss();
    $("#main_power").show();
    //var powerList = getPowerList();
    $.post('powerAction_getPsList.action',"",function(data) {
        hideLoading();
        var object = parseJson(data);
        if (object != null) {
            log("getPsList:" + data);
            if ($(object).length > 0 && object.result_code == 1 && object.result_data != null) {
                var powerList = object.result_data.powerList;
                if(powerList!=null&&powerList!=undefined){
                    var len = 0;
                    var length = powerList.length;
                    var j = parseInt(length/9);
                    var x = length%9;
                    if(j >= 0 && x > 0 || x >= 0 && j > 0){
                        var htmlli = "";
                        for(var i = 0;i<j;i++){
                            len = (i+1)*9;
                            var a = i*9;
                            for(a;a<len;a++){
                                if(a == i*9){
                                    htmlli = htmlli +"<ul>";
                                }
                                var obj = powerList[a];
                                var ps_name = obj.ps_name;
                                htmlli = htmlli + '<li><div class="box_h2" title="'+obj.ps_id+'">'+ps_name+'</div>' +
                                    '<div class="box_con"><div class="title1">'+obj.yestoday_energy+replaceUnit(obj.yestoday_energy_unit)+'</div>' +
                                    '<div class="title3">'+obj.year_energy+replaceUnit(obj.year_energy_unit)+'</div></div></li>';
                                if(a+1==len){
                                    htmlli =htmlli +"</ul>"
                                }
                            }
                        }
                        for(var i = 0;i<x;i++){
                            if(i == 0){
                                htmlli = htmlli +"<ul>";
                            }
                            var obj = powerList[len + i];
                            var ps_name = obj.ps_name;
                            htmlli = htmlli + '<li><div class="box_h2" title="'+obj.ps_id+'">'+ps_name+'</div>' +
                                '<div class="box_con"><div class="title1">'+obj.yestoday_energy+replaceUnit(obj.yestoday_energy_unit)+'</div>' +
                                '<div class="title3">'+obj.year_energy+replaceUnit(obj.year_energy_unit)+'</div></div></li>';
                            if(i+1==len){
                                htmlli =htmlli +"</ul>"
                            }
                        }
                        $("#box_tslide3 .box_list1").html(htmlli);
                    } else {
                        var htmlli = "<ul>";
                        for(var i = 0;i<length;i++){
                            var obj = powerList[i];
                            var ps_name = obj.ps_name;
                            htmlli = htmlli + '<li><div class="box_h2" title="'+obj.ps_id+'">'+ps_name+'</div>' +
                                '<div class="box_con"><div class="title1">'+obj.yestoday_energy+replaceUnit(obj.yestoday_energy_unit)+'</div>' +
                                '<div class="title3">'+obj.year_energy+replaceUnit(obj.year_energy_unit)+'</div></div></li>';
                            if(i+1==len){
                                htmlli =htmlli +"</ul>"
                            }
                        }

                        $("#box_tslide3 .box_list1").html(htmlli);
                    }
                }
                if($("#box_tslide3").find(".box_nav1 li").length>0){
                    $("#box_tslide3").find(".box_nav1 ul").empty();
                }

                TouchSlide({
                    slideCell:"#box_tslide3",
                    titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
                    effect:"leftLoop",
                    autoPage:true, //自动分页
                });
            }
        }

    },'json');

}

function getPowerList(callback){
    var powerList = null;
    $.ajax({
        type: "post",
        data: '',
        url: 'powerAction_getPsList.action',
        async: false,
        dataType: "json",
        beforeSend: function () {
            //loading(obj);
        },
        success: function (data, s) {
            var object = parseJson(data);
            if (data != null) {

                if ($(object).length > 0 && object.result_code == 1&&object.result_data!=null) {
                    powerList = object.result_data.powerList;
                }
            } else {
                log("获取电站数据失败");
            }
        },
        complete : function(){
            hideLoading();
        }
    });

    return powerList;
}
/**
 * 3D earth draw
 */
function draw3DMap(){
    require.config({
        paths: {
            'echarts': 'js/plugin/echarts/build/dist',
            'echarts-x': 'js/plugin/echarts-x/build/dist'
        }
    });

    // 然后就可以动态加载图表进行绘制啦
    require([
        'echarts',
        'echarts-x',
        // ECharts-X 中 map3d 的地图绘制基于 ECharts 中的 map。
        'echarts/chart/map',
        'echarts-x/chart/map3d'
    ], function (ec) {
        do3DMap(ec);
    });
    if (screen3.earthChart) {
        screen3.earthChart.dispose();
    }
}

function do3DMap(ec){
    screen3.earthChart = ec.init(document.getElementById('main'));
    var ecConfig = require('echarts/config');

    screen3.earthChart.setOption({
            title: {
                text: '',
                x: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            mapLocation: {
                x: 0,
                y: 0,
                width: '100%',
                height: '100%'
            },
            tooltip: {
                formatter: function(data){
                    if(data.name=="China"){
                        return LANG["China"];
                    }
                    return data.name;
                }
            },
            series: [{
                type: 'map3d',
                mapType: 'world',     //地图类型
                //background:'images/starfield.jpg',  //全景背景图

                baseLayer: {
                    backgroundColor: '',
                    backgroundImage: 'images/earth.jpg',
                    quality: 'high',
                    heightImage: 'images/elev_bump.jpg'
                },
                light: {
                    show: true,
                    ambientIntensity: 0.5
                },
                roam: {
                    autoRotate: true,
                    autoRotateAfterStill: 2,
                    focus: 'China',
                    zoom: 1, //初始化的缩放大小。
                    minZoom: 1, //最小缩放值
                    maxZoom: 1.5, //最大缩放值
                    preserve: true
                },
                light: {
                    show: true,
                    // Use the system time
                    //time: '2016-09-10 21:09:09',
                    sunIntensity: 1,
                    ambientIntensity: 0.5//环境光照强度，有时候为了更清楚的展现地球暗面的信息，需要把这个值调高。
                },
                surfaceLayers: [{
                    type: 'texture',
                    distance: 5,
                    image: 'images/clouds.png'
                }],
                //selectedMode: 'single',  //多选mutiple

                itemStyle: {
                    normal: {
                        label: {
                            show: true
                        },
                        borderWidth: 1,
                        borderColor: 'yellow',
                        areaStyle: {
                            color: 'rgba(0, 0, 0, 0)'
                        }
                    }
                },
                data: [{
                    name: 'China',
                    selected: true   //默认选中区域
                }]
            }]
        });


    screen3.earthChart.on(ecConfig.EVENT.CLICK, function (param) {
        var name = param.name;
        if (name == 'China') {
            screen3.showEarthOrChina = false;
            chinaClick();
        }
    });//地图坐标图标点击
}


function back(){
    $('#img_china').hide();
    $('.sousuo_box').hide();
    $('.whileShowMapInfo').hide();
    <!--删除热点元素-->
    //$("#chinaClick").remove();
    $('.main').hide();
    $('#main').show();
    // 加一个返回图标
    // $("#returnClick").css('margin-top','100px');
    $("#returnClick").hide();
    $(".cityPoint").hide();
    screen3.ps_id = "";
    screen3.showEarthOrChina = true;
    refreshBothSide();
}

function chinaClick() {
    $(".Monitor_header_tag_list ul li").removeClass("grayDiv");//电站状态全选中
    $('#main').hide();
    $(".Monitor_center").show();
    $('#img_china').show();
    $('.Monitor_center_header').show();
    $('.sousuo_box').show();
    $('.whileShowMapInfo').show();
    $("#returnClick").show();
    $(".cityPoint").fadeIn();
    getMapByUser();
    if(GetQueryString("isEdit") == 1){
        $("#saveMapInfo").show();
    }
}

function closePsInfo() {
    layer.closeAll();
}

function drawPSPlanChart(i,actualData,planData){
    var option = {
        title : {
            show:false,
            text: LANG["yy1.PowerGenerationPalnY"],
            x: 'left',                 // 水平安放位置，默认为左对齐，可选为：
            y: 'top',
            textStyle: {
                fontFamily: 'Microsoft YaHei',
                fontSize: 26,
                fontWeight:200,
                color: 'white'
            },
        },
        tooltip : {
            trigger: 'axis',
            formatter: function(param){
                var data0 = param[0].data;
                var data1 = param[1].data;
                var x = data0/1000;
                var y =data1/1000;
                if(x>10000){
                    data0 = (x/10000).toFixed(2)+LANG["tenThousandDegree"];
                    data1 = (y/10000).toFixed(2)+LANG["tenThousandDegree"];
                } else {
                    data0 = (x).toFixed(2)+LANG["degree"];
                    data1 = (y).toFixed(2)+LANG["degree"];
                }
                var year=myDate.getFullYear();
                return year+"/"+param[0].name+"</br>"+param[0].seriesName+":"+data0+"</br>"
                    +param[1].seriesName+":"+data1;
            }
        },
        legend: {
            show:false,
            orient: 'vertical',      // 布局方式，默认为水平布局，可选为：
            // 'horizontal' ¦ 'vertical'
            x: 'right',               // 水平安放位置，默认为全图居中，可选为：
            // 'center' ¦ 'left' ¦ 'right'
            // ¦ {number}（x坐标，单位px）
            y: 'top',                  // 垂直安放位置，默认为全图顶端，可选为：
            // 'top' ¦ 'bottom' ¦ 'center'
            // ¦ {number}（y坐标，单位px）
            textStyle: {
                color: '#FFFFFF'          // 图例文字颜色
            },
            data:[LANG["actualGeneration"],LANG["planGeneration"]]
        },
        // 网格
        grid: {
            x: 2,
            y: 12,
            x2: 0,
            y2: 0,
            width: 332,
            height: 80,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc'
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                axisLine: {
                    show: true,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#FFFFFF',
                        width: 0.5
                    }
                },
                axisLabel : {
                    show : true,
                    rotate : 0,//逆时针显示标签，不让文字叠加
                    textStyle : {
                        color : '#FFFFFF'
                    }
                },
                axisTick : {
                    show:false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#7EE8EF'],
                        width: 0.1,
                        type: 'solid'
                    }
                },
                boundaryGap : false,
                data : ['1','2','3','4','5','6','7','8','9','10','11','12']
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLine: {
                    show: true,
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#FFFFFF',
                        width: 0.5
                    }
                },
                axisLabel : {
                    show : false,
                    textStyle : {
                        color : '#FFFFFF'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#7EE8EF'],
                        width: 0.1,
                        type: 'solid'
                    }
                },
            }
        ],
        series : [
            {
                name:LANG["actualGeneration"],
                type:'bar',
                smooth:true,
                itemStyle: {
                    normal: {
                        color: '#00f4fe',
                        lineStyle: {        // 系列级个性化折线样式
                            width: 4
                        }
                    }	},
                symbol:'none',
                data: actualData//[12,23,14,25,16,37,28,19,10]
            },
            {
                name:LANG["planGeneration"],
                type:'line',
                smooth:true,
                itemStyle: {normal: {lineStyle: {type: 'default',color:'#1845AC'}}},
                symbol:'none',
                data: planData//[19,30,20,36,31,20,24,15,25,30,23,28]
            }
        ]
    };
    require.config({
        paths: {
            'echarts': 'js/plugin/echarts/build/dist'
        }
    });
    require([
            'echarts',
            'echarts/chart/line',
            'echarts/chart/bar'
        ],
        function (ec) {
            var len = $("div[name=\"psPlanChart"+i+"\"]").length;

            if(len>1){
                $("div[name=\"psPlanChart"+i+"\"]").each(function(){
                    var ptChart = ec.init(this);
                    ptChart.setOption(option);
                });
            } else if(len==1) {
                var ptChart = ec.init(document.getElementById('psPlanChart'+i));
                ptChart.setOption(option);
            } else {
                log("psPlanChart"+i+"未加载");
            }


        });
}

function showLoading(){
    $("#loadding").show();
}

function hideLoading(){
    $("#loadding").hide();
}

function parseJson(data){
    var object = null;
    try{
        object = JSON.parse(data);
        if(!isNotNull(object)||object.result_code==-1){
            showErrorMsg("请求接口数据失败，请刷新重试");
        }
    } catch(e){
        showErrorMsg();
        log("解析数据出错 data:"+data);
    }

    return object;
}

function checkGetValue(data){
    return isNotNull(data)?data:"";
}

function showErrorMsg(message){
    if(!isNotNull(message)){
        message = "数据请求失败，请重试!";
    }
    $("#failInfo").html(message);
    $("#failInfo").slideDown();
    setTimeout(function(){
        $("#failInfo").slideUp();
    },3000);
}

function showPowerBuild(obj){
    $("#main_powerBuild li").removeClass("active");
    $(obj).addClass("active");
    $("#main_powerBuild table").hide();
    var i = $(obj).attr("name");
    $("#powerbyType table").eq(i).fadeIn();
}

function loadWeather_ps(city) {
    var cityUrl = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js';
    $.getScript(cityUrl, function (script, textStatus, jqXHR) {
        var citytq = city;
        var url = "http://php.weather.sina.com.cn/iframe/index/w_cl.php?code=js&city=" + citytq + "&day=0&dfc=3";
        $.ajax({
            url: url,
            dataType: "script",
            scriptCharset: "gbk",
            success: function (data) {
                var _w = window.SWther.w[citytq][0];
                var detailHtml = ' ' +
                    '<div class="t1">' + LANG["yy1.enviornmentTemperate"] + '  ' + _w.t1 + '℃～' + _w.t2 + '℃</div>' +
                    '<div class="t1"> ' + _w.d1 + _w.p1 + '级</div>';
                $("#wd").text(_w.t2 + '℃～' + _w.t1 + '℃');
                $("#fx").text(_w.d1)
                $("#fs").text(_w.p1)
                $("#tq").text(_w.s1)
//                    alert(detailHtml)
                $(".ct-tight").html(detailHtml);
            }
        });
    });
}

//获取用户需要显示的地图
function getMapByUser() {
    var param = {};
    param["service"] = "getMapByUser";
    $.post('powerAction_loaddata.action', param, function (data) {
        if (data != null) {
            var result = parseJson(data);
            if (result.result_code == 1) {
                var obj = result.result_data;
                var map_url =  obj.area_map;
                map_id = obj.map_id;
                console.log("map_url:   "+map_url);
                //$(".maps").css("background-image","url("+map_url+")");
                $("#img_china").css("background-image","url("+map_url+")");
                showPsInMap(map_id);
            }
        }
    }, 'json')
}

/*
 获取地址栏参数
 */
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return unescape(r[2]); return null;
}

//获取地图配置显示的电站
function showPsInMap(map_id) {
    var param = {};
    param["map_id"] = map_id;
    param["service"] = "getPsListByMapId";
    $.post('powerAction_loaddata.action', param, function (data) {
        if (data != null) {
            var result = parseJson(data);
            if (result.result_code == 1) {
                var obj = result.result_data;
                var psList = obj.list;
                console.log("psList:");
                console.log(psList);
                var str='';
                var optStr='<option>' + '请输入电站名称' + '</option>';//电站查找下拉框
                var j=1;
                var len = psList.length;
                for(var i=0;i<psList.length;i++){
                    var build_status = psList[i]["build_status"];
                    optStr += "<option>" + psList[i]["ps_name"] + "</option>";
                    if(build_status=="2") {
                        str +=' <div id="'+psList[i]["ps_id"]+'" class="location " style="display: inline-block;cursor: pointer;position: absolute;left:'+psList[i]["left"]+'px;top:'+psList[i]["top"]+'px">' +
                            '<em title="'+psList[i]["ps_name"]+'" onclick="powerInfo_detail('+psList[i]["ps_id"]+','+psList[i]["ps_type"]+','+psList[i]["sys_scheme"]+')">'+psList[i]["ps_name"]+'</em>' +
                            '<div class="map_title">'+psList[i]["ps_name"]+'</div></div>';
                    } else if(build_status=="1") {
                        str +=' <div id="'+psList[i]["ps_id"]+'" class="location2" style="display: inline-block;cursor: pointer;position: absolute;left:'+psList[i]["left"]+'px;top:'+psList[i]["top"]+'px">' +
                            '<em title="'+psList[i]["ps_name"]+'" onclick="powerInfo('+psList[i]["ps_id"]+','+psList[i]["ps_type"]+','+psList[i]["sys_scheme"]+')">'+psList[i]["ps_name"]+'</em>' +
                            '<div class="map_title">'+psList[i]["ps_name"]+'</div></div>';
                    }else if(build_status=="0"){
                        str +=' <div id="'+psList[i]["ps_id"]+'" class="location3" style="display: inline-block;cursor: pointer;position: absolute;left:'+psList[i]["left"]+'px;top:'+psList[i]["top"]+'px">' +
                            '<em title="'+psList[i]["ps_name"]+'" onclick="powerInfo('+psList[i]["ps_id"]+','+psList[i]["ps_type"]+','+psList[i]["sys_scheme"]+')">'+psList[i]["ps_name"]+'</em>' +
                            '<div class="map_title">'+psList[i]["ps_name"]+'</div></div>';
                    }
                }
                $("#psSearchName").html(optStr);
                initSelect2()
                $('#img_china').html(str);
                if(len>2){
                    $(".map_title").hide();
                }
                var isEdit = GetQueryString("isEdit");
                if(isEdit == 1){
                    $(".location").draggable({ containment: "parent" });
                    $(".location2").draggable({ containment: "parent" });
                    $(".index-left").css("visibility","hidden");
                    $(".index-right").css("visibility","hidden");
                    $("#returnClick").hide();
                    $(".sousuo_box").hide();
                    $('.whileShowMapInfo').hide();
                    $(".map_title").show();
                }
            }
        }
    }, 'json');

}

var timeFinish;
function powerInfo(psId, psType, ps_scheme){
    if(GetQueryString("isEdit") == 1){
        return;
    }
    $("#grayLayer").addClass("grayLayer");
    screen3.psScheme = ps_scheme;
    screen3.ps_id = psId;
    if(screen3.ps_target == 1){
        $("#powernumChart").empty();
        //if($(".c5 .loadingDiv").is(":visible")){//发电趋势数据正在加载
        //    return;
        //}
        screen3.ps_id = psId;
        $(".afterClickPs").show();
        $(".beforeClickPs").hide();
        $("#pieName").text(LANG["poser_station_PR"]);
        $("#capacityTitle").text(LANG["1_1_equalHour"]);
        genTrendsDateType = 2; //点击电站 展示当月发电趋势
        refreshBothSide();
    }
    if($("#left2").is(":visible")){
        return;//当三星弹出框弹出时,禁止点击其他电站
    }
    if(timeFinish){
        clearInterval(timeFinish);
        timeFinish = null;
    }
    showLoading();
    if(psType == 7){
        storgePS(psId,psType);
    }else{//光伏电站
        normalPS(psId);
    }
}

var detailInfo = false;
function powerInfo_detail(psId, psType, ps_scheme){
    if(GetQueryString("isEdit") == 1){
        return;
    }
    detailInfo = true;
    $("#grayLayer").addClass("grayLayer");
    screen3.psScheme = ps_scheme;
    screen3.ps_id = psId;
    if(timeFinish){
        clearInterval(timeFinish);
        timeFinish = null;
    }
    showLoading();
    psDetailInfo();
}


/**
 * 储能电站
 * @param psId
 * @param psType
 */
function storgePS(psId,psType){
    //$(".show_c3_top_link").show();
    normalPS(psId);
}

//普通电站
function normalPS(psId){
    if(!(screen3.show_dinfo == 1)){
        $(".show_c3_top_link").hide();
    }
    var param = {};
    param["psId"] = psId;
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_getPsMapinfoByPsId.action',
        async: true,
        dataType: "json",
        beforeSend: function () {
            showLoading();
        },
        success: function (data, s) {
            hideLoading();
            var object = JSON.parse(data);
            if (object != null) {
                if ($(object).length > 0 && object.result_code == 1) {
                    var result = object.result_data;
                    console.log(result);
                    $(".maps_show").addClass("mapbox_show");
                    $("#powerInfoName").text(dealEmpthData(result.ps_name));
                    $("#powerInfoLocation").text(dealEmpthData(result.ps_location));
                    $("#powerInfoType").text(dealEmpthData(result.ps_type_name));
                    $("#powerInfoNormalCapacity").text(dealEmpthData(result.design_capacity));
                    $("#powerInfoNormalCapacityUnit").text(dealEmpthDataUnit(result.design_capacity_unit));
                    $("#powerInfoDayEnergy").text(dealEmpthData(result.powerstation_day_energy));
                    $("#powerInfoDayEnergyUnit").text(dealEmpthDataUnit(result.powerstation_day_energy_unit));
                    $("#powerInfoRadiation").text(dealEmpthData(result.today_radiation));
                    $("#powerInfoRadiationUnit").text("Wh/㎡");
                    $("#powerInfoTemperature").text(dealEmpthData(result.temperature));
                    $("#powerInfoWindLevel").text(dealEmpthData(result.wind_level));
                    $("#powerInfoWindDirection").text(dealEmpthData(result.wind_direction));
                    $("#powerInfoContent").html(dealEmpthData(result.description));
                    $("#expectInstallDate").html(dealEmpthData(result.expect_install_date));
                }
            }
        },
        complete:function(){
            //hideLoading();
        }
    })
}

function dealEmpthData(val){
    if(val && val != 'null' && val !="NULL"){
        return val;
    }
    return "--";
}

function dealEmpthDataUnit(val){
    if(val){
        return replaceUnit(val);
    }
    return "";
}

function refreshBothSide(){
    $(".Mc4_con .loadingDiv").show();
    //左
    refreshLeftSide();
    //右
    loadPlanChart();//发电计划
    if(screen3.ps_id){
        getLeftPR(screen3.ps_id);
        loadEqualHour(screen3.ps_id);
    }else{
        loadCapacityChart();//PR
    }
}

/**
 * 保存地图位置信息
 */
function saveMapInfo(){
    //alert(111)
    var mapData = [];
    var param = {};
    param["data"] = [];
    $("#img_china .location").each(function(){
        var json = '{"ps_id":"' + $(this).attr("id") + '","left":"' + parseInt($(this).css("left") )+ '","top":"' + parseInt($(this).css("top")) + '","map_id":"' +map_id +'"}';
        param["data"].push(json);
    })
    $("#img_china .location2").each(function(){
        var json = '{"ps_id":"' + $(this).attr("id") + '","left":"' + parseInt($(this).css("left") )+ '","top":"' + parseInt($(this).css("top")) + '","map_id":"' +map_id +'"}';
        param["data"].push(json);
    })
    $("#img_china .location3").each(function(){
        var json = '{"ps_id":"' + $(this).attr("id") + '","left":"' + parseInt($(this).css("left") )+ '","top":"' + parseInt($(this).css("top")) + '","map_id":"' +map_id +'"}';
        param["data"].push(json);
    })
    console.log(param["data"]);
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_saveMapInfoByUser.action',
        async: true,
        dataType: "json",
        beforeSend: function () {
            //showLoading();
        },
        success: function (data) {
            var object = parseJson(data);
            if(object.result_msg=="success"){
                showErrorMsg("位置保存成功");
            }
        },
        complete:function(){
            //hideLoading();
        }
    })
}


function closeLayer() {
    $("#grayLayer").removeClass("grayLayer");
    screen3.ps_id = "";
    $(".afterClickPs").hide();
    $(".beforeClickPs").show();
    $("#pieName").text(LANG["operation_manage_powerStationConstruct"]);
    $("#capacityTitle").text(LANG["1_1_psPr"]);
    $(".maps_show").removeClass("mapbox_show");
    refreshBothSide();
}

//特殊需求，临时更改，单位中文转英文
function replaceUnit(unit){
    if($("#org_id").val()!="3040"){//东旭集团定制
        return unit;
    }
    if (unit=="万度"){
        unit = "万kWh";
    } else if (unit=="亿度"){
        unit = "亿kWh"
    } else if(unit=="度") {
        unit = "kWh";
    }
    return unit;
}

//日月年 发电趋势切换
var genTrendsDateType = 2; //默认显示月
function selectTrends(val){
    event.stopPropagation();
    genTrendsDateType = val;
    showGenTrends();
}

//show 发电趋势
function showGenTrends(){
    $(".Mc4_con .loadingDiv").show();
    require.config({
        paths: {
            'echarts': 'js/plugin/echarts/build/dist'
        }
    });
    require(['echarts'],
        function (ec) {
            var temChart = ec.init(document.getElementById('power'));
            temChart.clear();
        }
    );
    $(".trends_btn").removeClass("on");
    if(genTrendsDateType == 3){//year
        $("#powerTrendTitle").text(LANG["generationTrend_year"]);
        $(".trends_btn:eq(2)").addClass("on");
        loadPowerChart_day(4);
    }else if(genTrendsDateType == 2){//month
        $("#powerTrendTitle").text(LANG["generationTrend_month"]);
        $(".trends_btn:eq(1)").addClass("on");
        loadPowerChart();
    }else{//day
        $("#powerTrendTitle").text(LANG["generationTrend_day"]);
        $(".trends_btn:eq(0)").addClass("on");
        loadPowerChart_day(1);
    }
}

/**
 * 单个电站PR值获取
 */
function getLeftPR(psId){
    var param = {};
    param["ps_id"] = psId;
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_getPR.action',
        async: true,
        dataType: "json",
        beforeSend: function () {
            //loading(obj);
        },
        success: function (data, s) {
            var object = parseJson(data);
            var pieName='电站PR';
            var tempp = {};
            var dzpr_data = [];
            var lengendData = [];
            var title = '';
            var yesterday_ps_radiation = "--";
            var yesterday_ps_radiation_unit = "";
            var ps_proproduction = "";
            var ps_proproduction_unit = "";
            var ps_pr = 0;
            if (object != null) {
                if ($(object).length > 0 && object.result_code == 1) {
                    var result = object.result_data;
                    tempp["value"] = result.ps_pr*100;
                    tempp["name"] = pieName;
                    dzpr_data.push(tempp);
                    tempp["value"] = 100 - result.ps_pr*100;
                    tempp["name"] = 'other';
                    dzpr_data.push(tempp);
                    $("#yestPR").html(parseFloat(result.ps_pr*100).toFixed(2)+" %");
                    if(result.ps_radiation && result.ps_radiation.value){
                        yesterday_ps_radiation = result.ps_radiation.value;
                        yesterday_ps_radiation_unit = result.ps_radiation.unit;
                        yesterday_ps_radiation = parseFloat(yesterday_ps_radiation).toFixed(2);
                    }
                    loadPRChart(dzpr_data,pieName,lengendData,title);
                    ps_proproduction = $.isNumeric(result.ps_proproduction.value) ? parseFloat(result.ps_proproduction.value).toFixed(2) : "--";
                    ps_proproduction_unit = result.ps_proproduction.unit;
                    ps_pr = result.ps_pr;
                }
            }
            $("#yestRadi").html(yesterday_ps_radiation + " " + yesterday_ps_radiation_unit);
            $("#yestYield").html(ps_proproduction +" " + ps_proproduction_unit);
            $("#title_a_ps").html(parseFloat(ps_pr*100).toFixed(2)+"%");
            $("#title_b_ps").html("近30天");
        }
    })
}
/**
 * 电站PR图
 */
function loadPRChart(dzpr_data){
    //$("#pieName_ps").html(pieName);
    var option;
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
            drawPRChart(ec, dzpr_data);
        }
    );
}

function drawPRChart(ec, dzpr_data){
    var powerNum_option = {
        title: {
            show:false,
            text: '222',
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
        // 网格
        grid: {
            //orient : 'vertical',
            y : '90',
            x : document.getElementById('powernumChart_ps').offsetWidth / 2,
            x2: 0,
            y2: 0,
            width: 60,
            height: 80,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc'
        },
        series: [
            {
                name: '电站PR',
                type: 'pie',
                clockWise:false,
                center: [90,110],
                radius: ['55%', '90%'],
                itemStyle: {
                    normal: {
                        label: {
                            show : false
                        },
                        labelLine: {
                            show : false
                        }
                    }
                },
                data:dzpr_data
            }
        ]
    };
    var powerNumChart_ps = ec.init(document.getElementById('powernumChart_ps'));
    //window.onresize = powerNumChart_ps.resize;
    powerNumChart_ps.setOption(powerNum_option, true);
}

/**
 * 等效小时
 */
function loadEqualHour(psId){
    var param ={};
    param["primaryKey"] = psId + "_11_0_0";
    $.ajax({
        type: "post",
        data: param,
        url: 'powerAction_loadEqualHourNew.action',
        async: true,
        dataType: "json",
        beforeSend: function () {
            //loading(obj);
        },
        success: function (data, s) {
            if (data) {
                var dateArr = data.dateList;
                var valueArr = data.eqlHList;
                drawEqualHour(dateArr, valueArr);
            } else {
                log("获取性能排名数据失败");
            }
        }
    })
}

function drawEqualHour(dateArr, valueArr){
    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (data) {
                var year=myDate.getFullYear();
                var month = myDate.getMonth()+1;
                var date = parseInt(myDate.getDate());
                return year+"/"+month+"/" + data[0].name + "<br>" + data[0].seriesName + "：" + data[0].value + "h";
            }
        },
        legend: {
            orient: 'horizontal',      // 布局方式，默认为水平布局，可选为：
            x: 'right',               // 水平安放位置，默认为全图居中，可选为：
            y: '20',                  // 垂直安放位置，默认为全图顶端，可选为：
            textStyle: {
                color: '#FFFFFF'          // 图例文字颜色
            },
            data:[ '等效小时']
        },
        grid: {
            x: 40,
            y: 40,
            x2: 0,
            y2: 0,
            width: 340,
            height: 140,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderColor: '#ccc'
        },
        xAxis : [
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
                data: dateArr
            }
        ],
        yAxis : [
            {
                type : 'value',
                name: '小时',
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
                    show: true
                }
            }
        ],
        series : [
            {
                name:'等效小时',
                type:'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#4CF0FF'
                    }
                },
                data:valueArr
            }
        ]
    };

    require.config({
        paths: {
            'echarts': 'js/plugin/echarts/build/dist'
        }
    });
    require([
            'echarts',
            'echarts/chart/bar'
        ],
        function (ec) {
            ptChart = ec.init(document.getElementById('equalHourChart'));
            ptChart.setOption(option);
        });
}

var order = true;//默认前十
function top10(val){
    event.stopPropagation()
    if(val == 0){//前十名
        order = true;
    }else{//后十名
        order = false;
    }
    loadCapacityChart();
}

function searchPS(psName){
    //var psName = $("#psSearchName").val();
    $("#img_china .location em").each(function(i, obj){
        resetTipCss(obj);
    });
    $("#img_china .location2 em").each(function(i, obj){
        resetTipCss(obj);
    });
    $("#img_china .location3 em").each(function(i, obj){
        resetTipCss(obj);
    });
    if(psName){
        $("#img_china .location em").each(function(i, obj){
            var temPsNm = $(obj).text();
            if(temPsNm.indexOf(psName) >= 0){
                tipAnimal(obj);
            }
        });
        $("#img_china .location2 em").each(function(i, obj){
            var temPsNm = $(obj).text();
            if(temPsNm.indexOf(psName) >= 0){
                tipAnimal(obj);
            }
        });
        $("#img_china .location3 em").each(function(i, obj){
            var temPsNm = $(obj).text();
            if(temPsNm.indexOf(psName) >= 0){
                tipAnimal(obj);
            }
        });
    }
}

function resetTipCss(obj){
    $(obj).removeClass();
    $(obj).parent().css("z-index","1000");
    $(obj).css( "zoom","");
}

function tipAnimal(obj){
    $(obj).addClass("slideInUp");
    $(obj).addClass("animated");
    $(obj).parent().css("z-index","9999");
    /*$(obj).animate({//滚动动画
     "zoom": '0.5',
     "zoom": '0.6'
     }, 2000, 'swing'
     );*/
}

//配置星空背景
function startBackGroud(){
    $("body").css({"background-color": "#050d19", "background-image": "none"});//({"background-color":"yellow","font-size":"200%"});
    var local = bathPath + "/dxltvue/assets/js/lib/star.js";
    loadScriptAndCallback(local);
}

//点击电站图标刷新两侧数据
function setPsTarget(){
    screen3.ps_target = 1;
}

function setShowDetailinfo(){
    screen3.show_dinfo = 1;
}

//电站详细信息
function psDetailInfo(){
    $("#showPsInfo").hide();
    if(screen3.ps_id){
        hideLoading();
        var url = bathPath + "/dialog/dialog_psDetailInfo.jsp?ps_id=" + screen3.ps_id + "&ps_scheme=" + screen3.psScheme +"&scrnvs=3";
        $("#equalHourFm").attr("src", url);
        $("#equalHourFm").slideToggle();
    }
}

//得到年完成率
/*function getYearPercentageComplete(){
 var param = {};
 param["service"] = "planPower";
 param["req"] = "app";
 $.ajax({
 type: "post",
 data: param,
 url: 'powerAction_loaddata.action',
 async: true,
 dataType: "json",
 catch: false,
 beforeSend: function () {
 $("#yearCompleteRate").text("--");
 },
 success: function (data, s) {
 var object = parseJson(data);
 if (data != null && object.result_data) {
 object = object.result_data;
 $("#yearCompleteRate").text(object.percent_plan_year + "%");
 } else {
 log("获取电站数据失败");
 }
 },
 complete : function(){

 }
 });
 }*/

function clickModuleCss(){
    $(".Monitor_center").show();
    $('#img_china').hide();
    $('.Monitor_center_header').hide();
    $("#main").hide();
    $(".main").hide();
}


