function gotoSys(){
    if($("#user_id").val()=="12900"){//东旭集团用户定制，不跳转
        return;
    }
    var a = getCookie("a");
    var b = getCookie("b");
    var url = $("#operateSysUrl").val()+"autoLogin.jsp?a="+a+"&b="+b;
    //window.open(url);
    window.open (url,'newwindow','height=768,width=1366,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
    /*var param = {};
     param["a"] = a;
     param["b"] = b;
     post(url, param);*/
}

function post(URL, PARAMS) {
    var temp_form = document.createElement("form");
    temp_form.action = URL;
    temp_form.target = "_blank";
    temp_form.method = "post";
    temp_form.style.display = "none";
    for (var x in PARAMS) {
        var opt = document.createElement("textarea");
        opt.name = x;
        opt.value = PARAMS[x];
        temp_form.appendChild(opt);
    }
    document.body.appendChild(temp_form);
    temp_form.submit();
}