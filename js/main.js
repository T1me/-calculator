const P = 0.2;
const AFTER_TAX = 0.95;
const AVG_EQUIP_PRICE = 85;
const P_TEA = 0.4;
const P_ELIXIR = 0.1;

const dsu = (arr1, arr2) => arr1.
            map((item, index) => [arr2[index], item]).
            sort(([arg1], [arg2]) => arg1 - arg2).
            map(([, item]) => item);

function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    this.val = '';
    this.index = -1;
    this.initEvents();
}

DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
            $(this).toggleClass('active');
            return false;
        });

        obj.opts.on('click',function(){
            var opt = $(this);
            obj.val = opt.text();
            obj.index = opt.index();
            obj.placeholder.text(obj.val);
        });
    },
    getValue : function() {
        return this.val;
    },
    getIndex : function() {
        return this.index;
    }
}

function factorial(n){
    var r = 1
    for (var i=2; i<=n; i++){
        r = r*i;
    }
    return r;
}

function cumsum(a){
    const b = new Array(a.length);
    var sum = 0;
    for (var i = 0; i<a.length; i++){
        sum = sum + a[i];
        b[i] = sum;
    }
    return b;
}

function comb(n1,n2){
    return factorial(n1)/(factorial(n2)*factorial(n1-n2));
}

function calculate(n1=2,
                   n2=8,
                   price3=20,
                   price4=230,
                   price6=600,
                   add_val = 1000){
    price3 = price3*AFTER_TAX;
    price4 = price4*AFTER_TAX;
    price6 = price6*AFTER_TAX;
    var probs = [];
    var vals = [];
    for(var i=0;i<=n1;i++){
        for (var j=0;j<=n2;j++){
            var p = comb(n1,i)*Math.pow(P,i)*Math.pow(1-P,n1-i)*comb(n2,j)*Math.pow(P,j)*Math.pow(1-P,n2-j);
            var val = (i+j)*price6 + (n1-i)*price3 + (n2-j)*price4 + add_val;
            probs.push(p);
            vals.push(val);
        }
    }
    probs = dsu(probs,vals);
    vals.sort(function(a, b){return a-b});
    return [probs,vals];
}

function cal_price_tb(probs,vals){
    const cum_probs = cumsum(probs)
    const auction_prices = [];
    const gain_probs = [];
    const avg_gains = [];
    const avg_losses = [];
    const min_price = Math.floor(vals[0]/500)*500;
    const max_price = vals[vals.length-1];
    for (var price = min_price; price < max_price; price=price+500){
        var gain_prob = 1;
        var idx = -1;
        var sum_prob = 0;
        var weighted_val = 0;
        for (var j = 1; j < vals.length; j++){
            if (vals[j]>=price && vals[j-1]<price){
                gain_prob = 1-cum_probs[j-1];
                idx = j-1;
                break;
            }
        }
        if(gain_prob<0.01){
            break;
        }
        auction_prices.push(price);
        gain_probs.push(gain_prob);
        for (var j = 0; j <= idx; j++){
            sum_prob = sum_prob + probs[j];
            weighted_val = weighted_val + probs[j]*vals[j];
        }
        if (sum_prob==0){
            avg_losses.push(0);
        }else{
            avg_losses.push((weighted_val/sum_prob) - price);
        }
        sum_prob = 0;
        weighted_val = 0;
        for (var j = idx+1; j < vals.length; j++){
            sum_prob = sum_prob + probs[j];
            weighted_val = weighted_val + probs[j]*vals[j];
        }
        if (sum_prob==0){
            avg_gains.push(0);
        }else{
            avg_gains.push((weighted_val/sum_prob) - price);
        }
    }
    return [auction_prices,gain_probs,avg_losses,avg_gains];
}

function output(el,res){
    const auction_prices = res[0];
    const gain_probs = res[1];
    const avg_losses = res[2];
    const avg_gains = res[3];
    el.empty();
    var $head = $("<div></div");
    $head.append($("<div class='tbelement'>出价</div>"));
    $head.append($("<div class='tbelement'>盈利概率</div>"));
    $head.append($("<div class='tbelement'>平均盈利</div>"));
    $head.append($("<div class='tbelement'>平均亏损</div>"));
    el.append($head);
    for (var i=0; i<auction_prices.length; i++){
        if (i%2==0){
            var $row = $("<div class='evenline'></div");
        }else{
            var $row = $("<div class='oddline'></div");
        }
        $row.append($("<div class='tbelement'>"+auction_prices[i]+"</div>"));
        $row.append($("<div class='tbelement'>"+gain_probs[i].toFixed(2)+"</div>"));
        $row.append($("<div class='tbelement'>"+avg_gains[i].toFixed(2)+"</div>"));
        $row.append($("<div class='tbelement'>"+avg_losses[i].toFixed(2)+"</div>"));
        el.append($row);
    }

}

function load_prices(){
    for(var i = 0; i < localStorage.length; i++){
        var key = localStorage.key(i);
        var id = "#" + key
        $(id).val(localStorage.getItem(key))
    }
}

function save_prices(prices_input){
    for(var key in prices_input){
        localStorage.setItem(key, prices_input[key])
    }
}

$(function(){
    var scenario = new DropDown($('#scenario'));
    var gongzhan = new DropDown($('#gongzhan'));
    var boss1 = new DropDown($('#boss1'));
    var endofseason = new DropDown($('#endofseason'));
    load_prices();
    $(document).click(function(){
        $('.wrapper-dropdown-3').removeClass('active');
    })
    $('#calculate').click(function(){
        var n1;
        var n2;
        var add_val;
        var price3 = Number($('#price3').val());
        var price4 = Number($('#price4').val());
        var price6 = Number($('#price6').val());
        var pricetea = Number($('#pricetea').val());
        var priceelixir = Number($('#priceelixir').val());
        var pricemulberry_sm = Number($('#pricemulberry_sm').val());
        var pricemulberry_md = Number($('#pricemulberry_md').val());
        switch(scenario.getIndex()){
            case -1: // 当前赛季10人本
                n1 = 2;
                n2 = 8;
                break;
            case 0: // 5首领
                n1 = 2;
                n2 = 6;
                break;
            case 1:
                n1 = 2;
                n2 = 8;
                break;
	        case 2:
		        n1 = 2;
		        n2 = 10;
                break;
            case 3:
                n1 = 6;
                n2 = 14;
                break;
            default:
                n1 = 2;
                n2 = 8;
        }
        add_val = (n1+n2+2)*AVG_EQUIP_PRICE;
        if (gongzhan.getIndex()>0){
            add_val = add_val + (n1+n2+2)/2*AVG_EQUIP_PRICE;
        }
        if (endofseason.getIndex()>0){
            add_val = add_val + (n1+n2+2)/2*AVG_EQUIP_PRICE;
        }
        switch(boss1.getIndex()){
            case -1:
                add_val = add_val + price3*2*AFTER_TAX;
                break;
            case 0:
                add_val = add_val + price3*2*AFTER_TAX;
                break;
            case 1:
                add_val = add_val + price3*AFTER_TAX + price6*AFTER_TAX;
                break;
            case 2:
                add_val = add_val + price6*2*AFTER_TAX;
                break;
            default:
                add_val = add_val * price3*2*AFTER_TAX;
        }
        var sp1 = $('#sp1').is(':checked');
        var sp2 = $('#sp2').is(':checked');
        var sp3 = $('#sp3').is(':checked');
        if (sp1){
            add_val = add_val + pricetea*P_TEA + priceelixir*P_ELIXIR + 20*(1-P_TEA-P_ELIXIR);
        }
        if (sp2){
            add_val = add_val + 2*price4*(1-P)*(1-P) + (price4+price6)*(1-P)*P*2 + 2*price6*P*P;
        }
        if (sp3){
            add_val = add_val + pricemulberry_md + pricemulberry_sm*5;
        }
        var res = calculate(n1,n2,price3,price4,price6,add_val);
        var probs = res[0];
        var vals = res[1];
        res = cal_price_tb(probs,vals);
        output($("#results"),res);
        var prices_input = {
            price3: price3,
            price4: price4,
            price6: price6,
            pricetea: pricetea,
            priceelixir: priceelixir,
            pricemulberry_sm: pricemulberry_sm,
            pricemulberry_md: pricemulberry_md
        };
        save_prices(prices_input);
    })
});