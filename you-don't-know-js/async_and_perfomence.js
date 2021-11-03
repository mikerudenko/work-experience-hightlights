function callbackCoordinationInteraction(){
    "use strict";

    var a;
    function foo(x) {
        if (!a) {
            a = x * 2;
            baz();
        }
    }
    function bar(x) {
        if (!a) {
            a = x / 2;
            baz();
        }
    }
    function baz() {
        console.log( a );
    }
    // ajax(..) is some arbitrary Ajax function given by a library
    ajax( "http://some.url.1", foo );
    ajax( "http://some.url.2", bar );
}

function gateInCallbacks() {
    "use strict";
    function add(getX, getY, cb) {
        let x,y;
        getX((xVal)=>{
            x = xVal;
            //both are ready?
            if(y!==undefined) {
                cb(x+y);
            }
        });

        getY((yVal)=>{
            y = yVal;
            //both are ready?
            if(x!==undefined) {
                cb(x+y);
            }
        });
    }

    //`fetchX()` and `fetchY()` are sync or async functions
    add(fetchX, fetchY, function(sum) {
        console.log(sum); //that was easy, huh?
    });

}

function splittingDataProcessing() {
    "use strict";
    let res = [];
    function response(data) {
        var chunk = data.splice(0,1000);

        res = res.concat(
            chunk.map(function(val){
                return val*2;
            })
        );

        //anything left to process?
        if(data.length > 0) {
            //async schedule next batch
            setTimeout(function(){
                responce(data);
            }, 0);
        }
    }

    // ajax(..) is some arbitrary Ajax function given by a library
    ajax( "http://some.url.1", response );
    ajax( "http://some.url.2", response );
}

function timeoutRestriction() {
    "use strict";

    function timeoutify(fn, delay) {
        let intv = setTimeout(function(){
            intv = null;
            fn(new Error("Timeout"));
        }, delay);

        return function(){
            if(intv){
                clearTimeout(intv);
                fn.apply(this, arguments);
            }
        }
    }

    function foo(err, data) {
        if(err){
            console.error(err);
        } else {
            console.log(data);
        }
    }

    ajax("http://some.url.1", timeoutify(500, foo)); //If callback will not trigger less then 500 milliseconds, than Error will be thrown
}

function usingAsyncify() {
    "use strict";

    function asyncify(fn) {
        var orig_fn = fn,
            intv = setTimeout(function() {
                intv = null;
                if (fn) fn();
            },0 );

        fn = null;

        return function() {
            // firing too quickly, before `intv` timer has fired to
            // indicate async turn has passed?
            if (intv) {
                fn = orig_fn.bind.apply( orig_fn,
                    // add the wrapper's `this` to the `bind(..)`
                    // call parameters, as well as currying any // passed in parameters
                    [this].concat( [].slice.call( arguments ) )
                );
            }// already async
            else {
                // invoke original function
                orig_fn.apply( this, arguments );
            }
        };
    }

    function result(data){
        console.log(a);
    }

    var a = 0;
    ajax("..pre-cached-url..", asyncify(result));
    a++;
}
