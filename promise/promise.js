/* 
    範例一：示範異步事件會發生的問題.(舉例：前端呼叫多個api,等待api回應)
    說明：異步事件並不會放進『主執行緒』,而是放進『訊息列隊』(callback queue),當異步事件完成後再放回『主執行緒』.
    流程：
        此範例是一起放入『訊息列隊』,依完成的速度放回『主執行緒』, 共花 3s.
        (1) ----> 完成 2s
        (2) ------> 完成 3s
        (3) --> 完成 1s
        完成順序 : (3) => (1) => (2)
    ---------------------------------------------------------------------------------
    希望的流程:依序執行變成像是同步事件.
        (1) ----> (2) ------> (3) --> 完成 ,共花 6s 
    ---------------------------------------------------------------------------------
 */
const getData = () => {
    console.log('Start:', new Date());
    setTimeout(() => {
        console.log('(1):', new Date());
    }, 2000);
    setTimeout(() => {
        console.log('(2):', new Date());
    }, 3000);
    setTimeout(() => {
        console.log('(3):', new Date());
    }, 1000);
}
// getData();



/* 
    範例二：示範解決異步問題(沒有Promise前的解決方式),缺點是程式碼不易閱讀.
    說明：使用 callback function 包 callback function 的方式.
    流程：
        2000 ----> 3000 ------> 1000 --> 完成 ,共花 6s 
        完成順序 : (1) => (2) => (3)
 */
const getData2 = () => {
    console.log('Start:', new Date());
    setTimeout(() => {
        console.log('(1):', new Date());
        setTimeout(() => {
            console.log('(2):', new Date());
            setTimeout(() => {
                console.log('(3):', new Date());
            }, 1000);
        }, 3000);
    }, 2000);
}
// getData2();



/* 
    範例三：示範解決異步問題(使用Promise的解決方式). Ps:ES6已把Promise Object納入規範.
    說明：建立一個Promise, 可使用then來串接下一個Promise, 將程式碼展平, 可使程式碼更易閱讀.
    promise的流程：
            Promise 有三種狀態 pending , fulfilled , rejected
            建立一個Promise(pending) , 當有結果後使用 resolve() / reject() , 就會把Promise的狀態改成
            fulfilled / rejected , 然後then()接收到結果後,再看要調用onFulfilled() / onRejected()
            Ps: promise =>進行中:pending , 已成功：fulfilled ,已失敗：rejected() ; 
    promise Object:
            typescript對promise的定義檔內容(不是全部,簡化過)
            interface Promise<T> {
                then(onFulfilled?:(),onRejected?:()) ;
            }
            => 這是typescript的interface,'?'的意思是此屬性(function)可有可無.
    流程：
        2000 ----> 3000 ------> 1000 --> 共花 6s 
        完成順序 : (1) => (2) => (3)
 */
let timeout = (s) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(s);
        }, s);
    });
}

const getData3 = () => {
    console.log('Start:', new Date());
    timeout(2000) //1.發出第一個promise
        .then((v) => { //2.接收第一個promise結果的then()
            console.log('(1):', new Date());
            return timeout(3000); //3.發出第二個promise
        })
        .then((v) => { //4.接收第二個promise結果的then()
            console.log('(2):', new Date());
            return timeout(1000); //5.發出第三個promise
        })
        .then((v) => { //6.接收第三個promise結果的then()
            console.log('(3):', new Date());
        })
}
// getData3();




/* 
    範例四：改寫範例三,假使沒有發送一個Promise給then會發生的情況.
    說明：還是會依序執行,但是沒接收到Promise結果的then會立即執行onFulfilled(),
        但因為沒有Promise回傳結果,所以console.log('(2) v:' + v)會是 (2) v:underfined.
    流程：
        2000 ----> 1000 --> 共花 3s 
        完成順序 : (1) => (2) => (3)
 */
const getData4 = () => {
    console.log('Start:', new Date());
    timeout(2000)
        .then((v) => {
            console.log('(1):', new Date());
            console.log('(1) v:' + v);
            // return timeout(3000);    //1.不發出第二個promise
        })
        .then((v) => { //2.沒接收到Promise的then(),會立即執行onFulfilled().
                console.log('(2) 立即執行onFulfilled()');
                console.log('(2):', new Date());
                console.log('(2) v:' + v);
                return timeout(1000);
            },
            ((error) => {
                console.log('onRejected');
            }))
        .then((v) => {
            console.log('(3):', new Date());
            console.log('(3) v:' + v);
        })
}
// getData4();


/* 
    範例五：示範異步事件中,發生錯誤時,捕捉錯誤.(舉例:前端呼叫api後,但api發生錯誤時)
    說明：只要鏈上發生錯誤時,都由catch()來捕獲reject().
    流程：
        2000 ----> 3000 ------> X 共花 5s 
        完成順序 : (1) => (2) => X
 */
let error = 3000;
let timeout2 = (s) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (s == error) {
                reject('error ' + new Date());
            } else {
                resolve(s);
            }
        }, s);
    });
}

const getData5 = () => {
    console.log('Start:', new Date());
    timeout2(2000)
        .then((v) => {
            console.log('(1):', new Date());
            return timeout2(3000); //1.這個promise會回傳reject()
        })
        .then((v) => { //2.這裡沒有寫onRejected(),所以下一個then()不會有反應(連執行都不會執行)
            console.log('(2):onFulfilled()');
            console.log('(2):', new Date());
            return timeout2(1000);
        })
        .then((v) => { //3.這裡因為上一個promise沒寫onRejected(),所以不會有任何執行.
            console.log('(3):', new Date());
            console.log('(3) v:' + v);
        }).catch((error) => { //只要這個promise鏈有發生resolve,都會在這邊捕捉到.
            console.log('catch:' + error);
        })
}
// getData5();


/* 
    範例六：改寫範例五 , 可更細的去捕捉reject().
    說明：如果then()下有寫onRejected(),promise發的reject()就會優先由這個onRejected()來捕捉,而catch()並不會執行,
         反之沒寫onRejected(),還是會由catch()來捕捉reject().
    流程：
        2000 ----> 3000 ------> 共花 5s 
        完成順序 : (1) => (2) => (3)
 */
// error = 1000;
const getData6 = () => {
    console.log('Start:', new Date());
    timeout2(2000)
        .then((v) => {
            console.log('(1):', new Date());
            console.log('(1) v:' + v);
            return timeout2(3000);
        })
        .then((v) => {
                console.log('(2):onFulfilled()');
                console.log('(2):', new Date());
                return timeout2(1000);
            },
            ((error) => { //1.這邊有寫onRejected(),所以會捕獲到reject()
                console.log('(2):onRejected');
                console.log('(2):' + error);
                // return timeout2(1000); //2.這邊也可以選擇發promise給下一個then()
            }))
        .then((v) => { //3.這邊還是會執行,但是沒有promise,所以不會有結果,v會是undefined.
            console.log('(3):', new Date());
            console.log('(3) v:' + v);
        }).catch((error) => { //4.reject()已被其它then寫的onRejected捕獲,所以這邊不會有反應.
            console.log('catch:' + error);
        })
}
// getData6();




/* 
    範例六：使用 ES7的async/await.
    說明：async/await並不是一種新的東西,也是基於promise運作的一種語法糖,可以用await來取代then,讓程式碼更語義化,
         另外error handler,是改換用try/catch來捕捉.
    流程：
        2000 ----> 3000 ------> 1000 --> 共花 6s 
        完成順序 : (1) => (2) => (3)
 */
let timeout3 = (s) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (s == 10000) {
                reject('error ' + new Date());
            } else {
                resolve(s);
            }
        }, s);
    });
}

const getData7 = async() => {
    console.log('start', new Date());
    try {
        await timeout3(2000);
        console.log('(1):' + new Date());
    } catch (error) {
        console.log(error);
    }

    try {
        await timeout3(3000);
        console.log('(2):' + new Date());
    } catch (error) {
        console.log(error);
    }

    try {
        await timeout3(1000);
        console.log('(3):' + new Date());
    } catch (error) {
        console.log(error);
    }
}
// getData7()catch((error)=>{console.log(error);});
