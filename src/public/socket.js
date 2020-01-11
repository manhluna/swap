jQuery(document).on("click", "#btn-add-phone", function(){
    let phoneUpdate = jQuery("#add-phone-content").val();
    console.log(phoneUpdate)
    jQuery.ajax({
        url: "/user/update-phone",
        type: "put",
        data: {
            phone: phoneUpdate
        },
        success: function(result){
            socket.emit("update-phone", phoneUpdate);
        },
        error: function(error){
            console.log(error);
        }
    });
});
jQuery(document).on("click", "#btn-add-address", function(){
    let state = jQuery("#state").val();
    let city = jQuery("#city").val();
    let country = jQuery("#country").val();
    let address = state + ", " + city + ", " + country;
    jQuery.ajax({
        url: "/user/update-address",
        type: "put",
        data: {
            address: address
        },
        success: function(result){
            console.log("ok");
            socket.emit("update-address", address);
        },
        error: function(error){
            console.log(error);
        }
    });
});
jQuery(document).on("click", "#withdraw-btc", function(){
    let coin = jQuery("#withdraw-btc").data("coin");
    let address = jQuery("#btc-address").val();
    let amount = jQuery("#btc-amount").val();
    jQuery.ajax({
        url: "/user/withdraw",
        type: "post",
        data: {
            coin: coin,
            address: address,
            amount: amount
        },
        // success: function(result){
        //     socket.emit("post-withdraw", {
        //         coin, address, amount
        //     });
        // },
        error: function(error){
            console.log(error);
        }
    });
});
jQuery(document).on("click", "#withdraw-wbt", function(){
    let coin = jQuery("#withdraw-wbt").data("coin");
    let address = jQuery("#wbt-address").val();
    let amount = jQuery("#wbt-amount").val();
    jQuery.ajax({
        url: "/user/withdraw",
        type: "post",
        data: {
            coin: coin,
            address: address,
            amount: amount
        },
        // success: function(result){
        //     socket.emit("post-withdraw", {
        //         coin, address, amount
        //     });
        // },
        error: function(error){
            console.log(error);
        }
    });
});

jQuery(document).on("click", "#swap-coin", function(){
    let coin_1 = jQuery("#coin_1").val();
    let coin_2 = jQuery("#coin_2").val();
    let amount_1 = jQuery("input.add-amount-swap").val();

    jQuery.ajax({
        url: "/user/swap",
        type: "post",
        data: {
            coin_1: coin_1,
            amount_1: amount_1,
            coin_2: coin_2
        },
        success: function(result){
            socket.emit("post-swap", targetId);
        },
        error: function(error){
            console.log(error);
        }
    });
});

socket.on("update-phone-success", (data)=>{
    jQuery("#add-phone").css("dislay", "none");
    jQuery("#phone-user").css("dislay", "block");
    jQuery("#phone-user").html(data);
});
socket.on("update-address-success", (data)=>{
    jQuery("#add-address").css("dislay", "none");
    jQuery("#user-address").css("dislay", "block");
    jQuery("#user-address").html(data.address);
});
socket.on("post-swap-success", (data)=>{
    jQuery("#amountBtcCoin").html(data.currentBtcBalance);
    jQuery("#amountWbtCoin").html(data.currentWbtBalance);
});
// socket.on("post-withdraw-success", (data)=>{
//     jQuery("#amountBtcCoin").html(data.currentBtcBalance);
//     jQuery("#amountWbtCoin").html(data.currentWbtBalance);
// });
socket.on("post-price", (data)=>{
    jQuery("#btcPrice").html(Number(data.btcprice).toFixed(2));
    jQuery("title#title-header-top").html(Number(data.btcprice).toFixed(2));
    jQuery("#wbtPrice").html(data.wbtprice);
});


socket.on("post-deposit", (data)=>{
    jQuery("#amountBtcCoin").html(Number(data.currentBtcBal).toFixed(4));
    jQuery("#amountWbtCoin").html(Number(data.currentWbtBal).toFixed(2));
    jQuery("#balance-swap-btc").html(Number(data.currentBtcBal).toFixed(4));
    jQuery("#balance-swap-wbt").html(Number(data.currentWbtBal).toFixed(2));
});