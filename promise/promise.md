## ㄧ、同步 vs 異步
因為**Javascript**是**單線程** , 意味著執行任務時需要排隊 , 同一時間只能做一件事 , 
而執行任務又分為**同步模式**和**異步模式**.

> Javascript單線程運作的方式 , 是把**同步任務**放在**主執行緒**做排隊執行 , 而把異步任務放在**任務列隊(task queue)** , 當**異步任務**運行有結果時 , 再放回**主執行緒**上.  

<br />

## 二、Promise Object
我們通常都會對異步的事件做層層的嵌套 , 讓它變成像是在執行同步事件 , 像是在呼叫Api時 , 等待Api回應後再做其它事情 , 為了解決層層嵌套的問題 , 所以就出現了Promise .

> ES6已經把Promise納入規範 , 提供了 Promise Object 來解決異步的問題.

#### Promise 三種狀態  
- Pending : 進行中 , 等待結果.   
- Fulfilled : 已成功. 
- Rejected :  已失敗.  

#### Promise 改變狀態的方法  
- resolve( ): 把Promise狀態改為Fulfilled .    
- reject( ) : 把Promise狀態改為Rejected .

#### Promise 狀態改變後執行的函式
- onFulfilled( ): 當狀態為Fulfilled時 , 執行函式內的程式碼 .    
- onRejected( ) : 當狀態改為Rejected時 , 執行函式內的程式碼 . 

#### 這是 Typesctip 對 Promise 的型別定義 ( 有簡化過 , 留重要的部份 )

    interface Promise<T> {  
        then(onfulfilled?:() , onrejected?:()): Promise<T>;
        catch(onrejected:()): Promise<T | TResult>;  
    }   
> 可以看得出來每個Promise都有then( )和catch( ) , 而本身又可以再return一個Promise , 所以又可以再接then , 藉由這樣把嵌套的程式碼做展平 ,變得更易閱讀.  

<br />

## 三、範例解說

#### i.timeout包成一個Promise.

    let timeout = (s) => {
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                if (s == 10000) {
                    reject('error'); //失敗時
                } else {
                    resolve(s); //成功時
                }
            }, s);
        });
    }

#### ii.Promise運作過程.

    timeout(3000).then((v)=>{      //第1個promise       
            成功時做...
            return timeout(1000);  //傳一個Promse給下一個then
        },(error)=>{         
            失敗時做...             //如果有寫的話 , 會由這邊接收error , cath則不會接收到error.
        }).then((v)=>{
            成功時做...             //第2個Promise , 這邊沒寫onrejected() , 錯誤會由catch捕獲.
        }).catch((error)=>{
            失敗時做...             //接收鏈結上的錯誤.
        })

#### iii.使用ES7的 async / await , 使用 await 代替 then , 讓程式碼更加語意化.

    const = getData = async()=>{    //定義時加上async , 說明是異步函式.
        try {
            await timeout(3000);    //加上await , 等待完成後才會做下一步 , 就像是同步.
        } catch (error) {
            console.log(error);
        }

        try {
            await timeout(1000);
        } catch (error) {
            console.log(error);
        }
    }

    getData();
 > async / await 只是語法糖 , 也是基於Promise上運作的.

<br />

## 參考  
   [阮一峰 - Javascript異步編程的4種方法](http://www.ruanyifeng.com/blog/2012/12/asynchronous%EF%BC%BFjavascript.html)  
   [JavaScript Promise迷你书](http://liubin.org/promises-book/)
