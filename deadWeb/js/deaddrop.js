/**
 * Created for Dead Drop
 * Date: 2013-10-08
 * Time: 10:28 AM
 */

var pw;
var root;
var domain;


function setDrop(path) {

    "use strict";

    if($("#message").val().trim().length < 1) {
    $('html, body').animate({
                    scrollTop: $("#MakeDrop").offset().top
                }, 200);
        return;
    }

    var text = symmetricEncrypt();

    $.post(path, { data: text }, function (data) {

        $("#MakeDrop").hide(300, function () {
            var id = data.id;
            var url = buildUrl(id);

            $("#url").text(url);

            $('#pickuplink').attr("href", url);

            $("#pass").text(pw);
            $("#DropComplete").show(200);

        }
        );

    }).fail(function () {

        $.toast({ 
            heading : "<b>Ой!</b>",
            text : "Что-то пошло не так. Невозможно создать тайник.", 
            showHideTransition : 'slide',
            allowToastClose : false,
            hideAfter : 5000,
            textAlign : 'left',
            position : 'top-right'
        });
        //window.location.assign(getHost());
    });

    

}


function getDrop(path) {

    if (typeof dropid == 'undefined') {
        alert('no drop found');
        window.location.assign("/");
    }

    $.ajax({
        url: path + "/" + dropid,
        success: function (data) {

            if (data == null) {
                alert('no drop found');
                window.location.assign("/");
                return false;
            }

            var plainText = symmetricDecrypt(JSON.stringify(data));
            $("#decrypted").text(plainText);

            $("#RetrieveDrop").hide(300, function () {
                $("#DisplayDrop").show(300);
            });
        }

    }).fail(function () {

        $.toast({ 
            heading : "<b>Ой!</b>",
            text : "Что-то пошло не так. Невозможно получить тайник.", 
            showHideTransition : 'slide',
            allowToastClose : false,
            hideAfter : 5000,
            textAlign : 'left',
            position : 'top-right'
        });
        //window.location.assign(getHost());
        
    });
}


function makePwd() {
    "use strict";

    //get a good seed
    sjcl.random.startCollectors();

    for (var i = 0; i < 5; i++) {
        //throw away a couple
        sjcl.random.randomWords(1);
    }

    var m = new MersenneTwister(sjcl.random.randomWords(1));
    sjcl.random.stopCollectors();

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 15; i++) {
        text += possible.charAt(Math.floor(m.random() * possible.length));
    }

    return text;
}


function buildUrl(id) {
    host = getHost()
    var final = host.concat("pickup/");
    var final = final.concat(id);
    return final;
}

function getHost(){
    "use strict";
    var http = location.protocol;
    var slashes = http.concat("//");
    var host = slashes.concat(window.location.hostname);
    if (window.location.port != "") {
       host = host.concat(":").concat(window.location.port);
    }
    if (window.location.pathname != "") {
       host = host.concat(window.location.pathname);
    }

    return host
}


function symmetricEncrypt() {
    try {
        "use strict";
        pw = makePwd();
        var crypt = sjcl.encrypt(pw, $('#message').val());

        return crypt;
    } catch (err) {
        $.toast({ 
            heading : "<b>Ой!</b>",
            text : "Ошибка шифрования данных", 
            showHideTransition : 'slide',
            allowToastClose : false,
            hideAfter : 5000,
            textAlign : 'left',
            position : 'top-right'
        });
        //alert('Error encrypting data');
        return false;
    }
}


function symmetricDecrypt(data) {
    try {
        "use strict";
        var pw = $("#password").val();
        //trim it
        pw = $.trim(pw);

        return sjcl.decrypt(pw, data);

    } catch (err) {
        $.toast({ 
            heading : "<b>Ой!</b>",
            text : "Ошибка расшифровки данных", 
            showHideTransition : 'slide',
            allowToastClose : false,
            hideAfter : 5000,
            textAlign : 'left',
            position : 'top-right'
        });
        //window.location.assign("/");
        return false;
    }
}



function require(script) {
    "use strict";
    $.ajax({
        url: script,
        dataType: "script",
        async: false,           // <-- this is the key
        success: function () {
            // all good...
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}


$(document).ready(function () {
    root = "/";

    if (typeof dropid != 'undefined') {
        //this is a pickup, show the password dialog
        $("#MakeDrop").hide();
        $("#RetrieveDrop").show();
    } else {
        $("#MakeDrop").show();
        $("#message").focus();
    }

    if (top != self) {
        top.location.assign("/");
    }

});
