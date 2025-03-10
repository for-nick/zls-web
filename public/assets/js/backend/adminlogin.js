define(['jquery', 'bootstrap', 'backend', 'addtabs', 'adminlte', 'form'], function ($, undefined, Backend, undefined, AdminLTE, Form) {
    var Controller = {
        index: function () {
            var lastlogin = localStorage.getItem("lastlogin");
            if (lastlogin) {
                lastlogin = JSON.parse(lastlogin);
                $("#profile-img").attr("src", Backend.api.cdnurl(lastlogin.avatar));
                $("#profile-name").val(lastlogin.username);
            }

            //让错误提示框居中
            Fast.config.toastr.positionClass = "toast-top-center";

            //本地验证未通过时提示
            $("#login-form").data("validator-options", {
                invalid: function (form, errors) {
                    $.each(errors, function (i, j) {
                        if ($('.tip_text').length>0) {
                            $('.tip_text').addClass('hidden');
                            $('.tip_text.warn').removeClass('hidden').find('p').text(j);
                        } else {
                            Toastr.error(j);
                        }
                    });
                },
                target: '#errtips',
                ignore: '.no-valida',
            });

            if (!Config.hasCaptcha) {
                $('[name="captcha"]').addClass('no-valida');
            }

                //为表单绑定事件
            Form.api.bindevent($("#login-form"), function (data) {
                localStorage.setItem("lastlogin", JSON.stringify({
                    id: data.id,
                    username: data.username,
                    avatar: data.avatar
                }));
                location.href = Backend.api.fixurl(data.url);
                if ($('.tip_text').length>0) {
                    $('.tip_text').addClass('hidden');
                    $('.tip_text.success').removeClass('hidden').find('p').text(res.msg);
                    return false;
                }
            }, function (data, res) {
                $("input[name=captcha]").next(".input-group-addon").find("img").trigger("click");
                if (data.has_captcha) {
                    $('.captcha-group').removeClass('hidden');
                    $('[name="captcha"]').removeClass('no-valida');
                }
                if ($('.tip_text').length>0) {
                    $('.tip_text').addClass('hidden');
                    $('.tip_text.warn').removeClass('hidden').find('p').text(res.msg);
                    return false;
                }
            });
        }
    };

    return Controller;
});
