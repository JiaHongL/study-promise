## ㄧ、同步 vs 異步
- 同步 : 調用函式後 , 能預期結果 , 立即返回.   
- 異步 : 調用函式後 , 不能預期結果 , 需要等待.  

<br />

## 二、Javascript 單線程
因為 **Javascript** 是 **單線程** 運作, 意味著執行任務時需要排隊 , 同一時間只能做一件事 , 
而執行任務又分為 **同步模式** 和 **異步模式**. 
> Javascript **單線程** 運作的方式 , 是把 **同步任務** 放在 **主執行緒** 做排隊執行(阻塞) , 而 **異步任務** 則放在 **任務列隊(task queue)** (非阻塞) , 當 **異步任務** 運行有結果後 , 藉由 **事件循環(Event Loop)** 的機制 , 再放回 **主執行緒** 上.  

<br />

## 三、Promise Object
我們有時會對異步事件做層層的嵌套 , 讓它變成像在執行同步事件 , 但就會造成程式不易閱讀 , 而為了解決層層嵌套的問題 , 所以就出現了Promise這個解決方案 .

> ES6已經把 Promise 納入規範 , 並提供了 Promise Object 來解決異步的問題.


#### Promise 三種狀態  
- Pending :  剛建立 , 正進行中 , 等待結果.   
- Fulfilled : 已成功. 
- Rejected :  已失敗.  

#### Promise 改變狀態的方法  
- resolve( ) : 把Promise狀態改為Fulfilled .    
- reject( ) : 把Promise狀態改為Rejected .

#### Promise 狀態改變後執行的函式
- onFulfilled( ): 當狀態為Fulfilled時 , 執行函式內的程式碼 .    
- onRejected( ) : 當狀態為Rejected時 , 執行函式內的程式碼 . 

#### 一次發出多個Promise , 最後回傳一個新的Promise(Fulfilled或Rejected) 
- Promise.all( ) : 當全部為Fulfilled時 , 回傳一個Fulfilled的Promise , 但只要有Rejected時 , 則回傳一個Rejected的Promise.
- Promise.race( ) : 只要有一個Promise改變狀態(Fulfilled/Rejected) , 就會馬上回傳一個Promise(Fulfilled/Rejected). 


#### 這是 Typescript 對 Promise 的型別定義 , '?' 表示可有可無的意思. ( 有簡化過 , 留重要的部份 )

    interface Promise<T> {  
        then(onfulfilled?:() , onrejected?:()): Promise<T>;
        catch(onrejected:()): Promise<T | TResult>;  
    }   
> 可以看得出來每個Promise都有then( )和catch( ) , 本身如果有 return 的話 , 又會是一個新 Promise , 而沒有 return 的話, 則會默認發送一個狀態為 Fulfilled 的 Promise , 所以又可以再接then( ) , 藉由這樣的方式 , 把嵌套的程式碼做展平 ,變得更易閱讀.  


<br />

## 四、範例解說

#### i.timeout包成一個Promise.

    let timeout = (s) => {
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                if (s == 2500) {
                    reject('error'); //失敗時
                } else {
                    resolve(s); //成功時
                }
            }, s);
        });
    }

#### ii.Promise運作過程.
    const getData = ()=>{
    
        console.log('Start');
        
        timeout(3000).then((v)=>{      //第1個promise       
                成功時做...
                console.log('(1)');
                return timeout(1000);  //傳一個Promse給下一個then
            },(error)=>{         
                失敗時做...             //如果有寫的話 , 會由這邊接收error , cath則不會接收到error.
            }).then((v)=>{
                成功時做...             //第2個Promise.then , 這邊沒寫onrejected() , 有錯誤的話 , 會由catch捕獲.
                console.log('(2)');
            }).catch((error)=>{
                失敗時做...             //接收鏈結上的錯誤.
            })
            
        console.log('End');
        
     }
     
     getData();  // 執行順序： Start => End => (1) => (2)
     
     Ps: Promise 只是讓異步任務依序執行 , 而其它同步任務還是會先執行.

#### iii. Promise.all 與 Promise.race 的區別
    //兩者都是同時發出三個Promise , 然後timeout(2500)設定為失敗.
    const main = () => {return Promise.all([timeout(2500), timeout(1000), timeout(3000)]);}
    const main2 = () => {return Promise.race([timeout(2500), timeout(1000), timeout(3000)]);}

    main().then((v) => {
        console.log(v);
    }).catch((error) => {
        console.log(error);     //error 
    });

    main2().then((v) => {
        console.log(v);         //1000
    }).catch(function (error) {
        console.log(error);
    });

    說明 : main()  => 因為其中一個失敗 , 所以就回傳一個狀態為Rejected的Promise.
          main2() => timeout(1000)最快改變狀態(Pending->Fulfilled) , 所以就回傳一個Fulfilled的Promise.


#### iv.使用ES7的 async / await , 讓 await 代替 then , 讓程式碼更加語意化.

    const getData = async()=>{    //定義時加上async , 說明是異步函式.
    
        console.log('Start');
        
        try {
            await timeout(3000);    //加上await , 等待完成後才會做下一步 , 就像是同步.
            console.log('(1)');
        } catch (error) {           //error handler, 改換用try/catch來捕捉.
            console.log(error);
        }

        try {
            await timeout(1000);
            console.log('(2)');
        } catch (error) {
            console.log(error);
        }
        
        console.log('End');
        
    }
    
    getData().catch((error)=>{console.log(error);});  //沒寫 try/catch 的 , 會由這裡來捕捉error handler.
                                                      //執行順序： Start => (1) => (2) => End  
      
    Ps: await 和 then 還是有差別的 , 使用 await 會等異步任務執行完後 , 再執行其它任務 , 讓全部的任務都變成像同步任務一樣.
    
 > async / await 只是語法糖 , 也是基於 Promise 上運作.

<br />

## 參考  
  - [阮一峰 - 什麼是 Event Loop？](http://www.ruanyifeng.com/blog/2013/10/event_loop.html)  
  - [JavaScript Promise迷你书](http://liubin.org/promises-book/) 
  - [告別 JavaScript 的 Promise ! 迎接 Async/Await 的到來](https://jigsawye.com/2016/04/18/understanding-javascript-async-await/) 
