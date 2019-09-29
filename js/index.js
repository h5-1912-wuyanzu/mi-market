 //jQuery入口函数
 $(function () {
     console.log("qq");

     //第一步：去增加到购物车的按钮点击函数
     function add_shoppingcart(btn) {
         console.log("qq12");
         //传递过来的btn是dom元素，先全部转为jQuery元素,多次用到tds
         var $tds = $(btn).parent().siblings();
         //获取到商品的名字价格和库存信息，string类型
         var name=$tds.eq(0).html();
         var price=$tds.eq(1).html();
         var stock=$tds.eq(3).html();

         //先查看库存是否为0，为0不允许点击事件的发生
         if(stock <= 0){
             return;
         }

         //当点击了放入购物车后，库存减掉1
         $tds.eq(3).html(--stock);

         //添加操作
         //判断之前有无添加，有则是数量加1，否则创建一个tr行
         //购物车表单的tr行
         var $trs = $("#goods>tr");
         console.log($trs.length);
         for(var i=0;i<$trs.length;i++){
             var $goodstds = $trs.eq(i).children();  //找到购物车表单所有的行中的所有单元格（列）
             var goodsname =  $goodstds.eq(0).html();  //找到商品名称
             //name（在商城表格中）是表示点击了加入购物车的那个名字，goodsname表示已经存在购物车的名字
             if(name == goodsname){   //若存在，就是数量加1
                 var num=parseInt($goodstds.eq(2).children().eq(1).val()); //获得num
                 $goodstds.eq(2).children().eq(1).val(++num);  //num+1
                 console.log("aaa");
                 //单项金额重新计算，并修改
                 //这个price是商城表格的price，因为是一样的价格，没必要在购物车的价格上获取
                 $goodstds.eq(3).html(price*num);

                 //总计功能
                 total();

                 return; //  如果存在就直接增加金额操作，后面的创建追加元素不要执行
             }
         }

         //若不存在，则创建一个并追加,并且这里面的数值就是1的price name等等，不用计算哦
         var div= "<tr>"+
             "<td>"+name+"</td>"+
             "<td>"+price+"</td>"+
             "<td align='center'>"+
             "<input type='button' value=' ▼ ' οnclick='decrease(this);'/> "+
             "<input type='text' size='3' readonly value='1' align='center'/> "+
             "<input type='button' value=' ▲ ' οnclick='increase(this);'/>"+
             "</td>"+
             "<td>"+price+"</td>"+
             "<td align='center'>"+
             "<input type='button' value=' ✘ ' οnclick='del(this);'/>"+
             "</td>"+
             "</tr>";
         console.log("bbb");
         //追加到#goods后面
         $("#goods").append(div);

         //总计功能
         total();

     }
     /*----------第一步点击函数工作结束-------------*/

     /*总计功能的函数total*/
     function total() {
         //获取所有的购物车里头的trS
         var $trs = $("#goods tr");
         var amount = 0;
         //遍历所有tr
         for(var i=0;i<$trs.length;i++){
             //获取每个商品的总价,先防止数据精度，先用整数计
             var money =parseInt($trs.eq(i).children().eq(3).html());
             //所有商品的总价相加就是total值
             amount += money;
         }
         //值给总计表格单元格
         $("#total").html(amount);
     }
     /*-------------总计函数结束----------------*/

     /*增加数量中的+的功能函数
     * 增加了一个后，相应购物车的数据会改变；商城数量也会改变
     * 第一步处理商城的数量减掉1（要先找到在商城的对应产品，所以先找到这个td）
     * 第二步处理购物更新数据,这边很多数据会更新，数量加1，总价变了，购物车total会变
     * */
     //这个btn就是那边的额this
     function increase(btn) {
         //先判断库存是否为0了已经
         var $stock = findstock(btn);
         var stock = $stock.html();
         if(stock <= 0){
             return ;
         }

         //否则库存-1
         $stock.html(--stock);

         //更新购物车一系列的数据
         var $td = $(btn).prev();    //找到上一个数量的兄弟
         var num = parseInt($td.val());
         $td.val(++num);   //num为number类型，这里是用val（）
         //获取单价，在计算总计
         var price = parseInt($(btn).parent().prev().html()); //这里找了bug很久，这里使用html和val要区别看清楚，有哪个才用那个
         $(btn).parent().next().html(num * price);
         //重新总计
         total();
     }
     /*-----------增加函数结束-----------------*/


     /*减少数量中的+的功能函数
     * 减少了一个后，相应购物车的数据会改变；商城数量也会改变
     * 第一步处理商城的数量加1（要先找到在商城的对应产品，所以先找到这个td）
     * 第二步处理购物更新数据,这边很多数据会更新，数量减掉1，总价变了，购物车total会变
     * */
     //这个btn就是那边的额this
     function decrease(btn) {
         //先判断商城的商品是否已经为1，为1 设置不能减，只能删
         var num = parseInt($(btn).next().val());
         if(num<=1){
             return ;
         }

         var $stock = findstock(btn);
         //库存+1
         var stock = parseInt($stock.html());
         $stock.html(++stock);

         //更新购物车一系列的数据
         //商城商品数量-1
         $(btn).next().val(--num);
         //获取单价，在计算总计
         var price = parseInt($(btn).parent().prev().html()); //这里找了bug很久，这里使用html和val要区别看清楚，有哪个才用那个
         $(btn).parent().next().html(num * price);
         //重新总计
         total();
     }
     /*-----------减少函数结束-----------------*/

     /*删除函数开始
     * 要做的就是将数量归还给库存
     * 然后整个清空tr
     * */
     function del(btn) {
         //归还数量操作
         var $stock = findstock(btn);
         var stocknum = parseInt($stock.html());
         var shoppingcartnum = parseInt($(btn).parent().prev().prev().children().eq(1).val());
         $stock.html(stocknum+shoppingcartnum);

         //清空商品的tr, remove()自杀:事件数据都会消失
         $(btn).parent().parent().remove();

         //重新计算总计功能
         total();
     }
     /*-------del函数结束---------*/

     /*增加减少删除函数所需要获取的那个对象，在点击这些时，是在购物车的表格table中的，
     * 但是我们在获取这些增删减的动作是要去处理库存的那边信息的
     * 所以，这个函数就会返回一个jQuery对象，
     * 让我们操作的购物车的元素和相应商品的那个库存里的td元素可以找到
     * 这就是他们之间的一个联系和桥梁作用
     * 在找的过程有点像回溯递归的感觉，大家可以体会一下
     * */
     function findstock(btn) {
         var name = $(btn).parent().siblings().eq(0).html(); //name是购物车table的name
         //得到商城的库存的所有tr,注意，这里少了tbody是找不到tr
         var $trs = $("#table1 tbody tr:gt(0)");
         for(var i=0;i<$trs.length;i++){

             var stockname = $trs.eq(i).children().eq(0).html(); //找到相应i的name
             if(name == stockname){
                 //找到了点击的商品和库存table中相对于的商品了
                 return $trs.eq(i).children().eq(3);  //f返回库存的那个td!!很重要，这样就可以直接库存表格里的库存信息
             }
         }
     }
     /*-------------获取库存的td（JQUERY对象）函数结束-----------------*/


 });