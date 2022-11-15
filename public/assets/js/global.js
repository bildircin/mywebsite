

var global = (function () {
    'use strict';

    function showLoader() {
        $('#custom_loader').fadeIn()
    }

    function hideLoader() {
        $('#custom_loader').fadeOut()
    }

    function toast(type, message){
        if(type == "success"){
            toastr.success(message, "Başarılı", {
                timeOut: 3000,
                closeButton: !0,
                debug: !1,
                progressBar: !0,
                positionClass: "toast-top-right",
                onclick: null,
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut",
                tapToDismiss: false
            })
        }else if(type == "error"){
            toastr.error(message, "Başarısız", {
                timeOut: 3000,
                closeButton: !0,
                debug: !1,
                progressBar: !0,
                positionClass: "toast-top-right",
                onclick: null,
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut",
                tapToDismiss: false
            })
        }else if(type == "warning"){
            toastr.warning(message, "Uyarı", {
                timeOut: 3000,
                closeButton: !0,
                debug: !1,
                progressBar: !0,
                positionClass: "toast-top-right",
                onclick: null,
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut",
                tapToDismiss: false
            })
        }
    }

    return {
        showLoader,
        hideLoader,
        toast
    }
})();