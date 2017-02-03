new Vue({
    el: '#stationBulding',
    data: {},
    methods: {
        //电站建设
        stationBuild: function () {
            var _this = this;
            var Parameters = {
                "parameters": {"stationid": "", "statusstr": ""},
                "foreEndType": 2,
                "code": "20000006"
            };
            vlm.loadJson("", JSON.stringify(Parameters), function (res) {
                if (res.success) {
                    var newArr = res.data;
                    newArr = vlm.Utils.sortArr(newArr,'fd_station_status');
                    var stationStr = $('#stationTpl').html();
                    var trHtml = ejs.render(stationStr, {newArr: newArr});
                    $("#tbody_id").html(trHtml);
                    $(".showm_table").mCustomScrollbar({});
                    $('.loadingDiv').hide();
                } else {
                    alert(res.message);
                }
            });

        },

        closeWindow: function () {
            $(".Monitor_right_c3", parent.document).removeClass("Monitor_right_c3_highLt");
            window.parent.closeEqualHourFm();
        }
    },
    mounted: function () {
        this.stationBuild();
    }
});
