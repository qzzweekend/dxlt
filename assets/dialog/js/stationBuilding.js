new Vue({
    el: '#stationBulding',
    data: {},
    methods: {
        //根据电站建设状态排序
        sortPsBuildArr: function (arr) {
            for (var i = 0; i < arr.length - 1; i++) {
                var maxIndex = i;
                for (var j = i + 1; j < arr.length; j++) {
                    var maxVal = arr[maxIndex].fd_station_status;
                    var curVal = arr[j].fd_station_status;
                    if ($.isNumeric(maxVal) && $.isNumeric(curVal) && maxVal < curVal) {
                        maxIndex = j;
                    }
                }
                if (maxIndex != i) {
                    var tem = arr[maxIndex];
                    arr[maxIndex] = arr[i];
                    arr[i] = tem;
                }
            }
            return arr;
        },
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
                    console.log(newArr[0]);
                    newArr = _this.sortPsBuildArr(newArr);
                    console.log(newArr[0]);
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
