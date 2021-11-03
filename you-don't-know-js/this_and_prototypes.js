function implicitBinding(){
    "use strict";
    function foo() {
        console.log(this.a)
    }

    let obj2 = {
        a:42,
        foo: foo
    };

    let obj1 = {
        a:2,
        obj2: obj2
    };

    obj1.obj2.foo(); //42

}

function implicitlyLost() {
    "use strict";
    function foo() {
        console.log(this.a);
    }

    let obj = {
        a:2,
        foo: foo
    };

    let bar = obj.foo;

    let a = 'oops, global';

    bar(); //'oops, global'
}

function implicitAssignment() {
    "use strict";

    function foo(){
        console.log(this.a);
    }

    function doFoo(fn) { //implicitly let fn = <value passed there>
        fn();
    }

    let obj = {
        a:2,
        foo: foo
    };

    let a = 'oops, global';

    doFoo(obj.foo); //oops, global

}

function hardBinding() {
    "use strict";

    function foo(){
        console.log(this.a);
    }

    let obj = {
        a: 2
    };

    let bar = function(){
        foo.call(obj);
    };

    bar(); //2

    setTimeout(bar, 100); //2

    // hard-bound `bar` can no longer have its `this` overridden
    bar.call( window ); // 2
}

function hardBinding2() {
    "use strict";
    function foo(something) {
        console.log( this.a, something );
        return this.a + something;
    }

    let obj = {
        a: 2
    };

    let bar = function() {
        return foo.apply(obj, arguments);
    };

    let b = bar(3); // 2, 3
    console.log(b); // 5
}

function newBinding() {
    "use strict";
    function foo(something) {
        this.a = something;
    }
    let obj1={
        foo: foo
    };
    let obj2 = {};
    obj1.foo(2);
    console.log( obj1.a ); // 2
    obj1.foo.call( obj2, 3 );
    console.log( obj2.a ); // 3
    let bar = new obj1.foo( 4 );
    console.log( obj1.a ); // 2
    console.log( bar.a ); // 4
}

function hardBindingWithNew() {
    "use strict";
    function foo(something) {
        this.a = something;
    }
    let obj1 = {};
    let bar = foo.bind( obj1 );
    bar( 2 );
    console.log( obj1.a ); // 2
    let baz = new bar(3);
    console.log( obj1.a ); // 2
    console.log( baz.a ); // 3
}

function ignoredThis() {
    "use strict";
    function foo(){
        console.log(this.a);
    }

    let a = 2;

    foo.call( null ); //2
}

function indirectedReferences() {
    "use strict";

    function foo() {
        console.log( this.a );
    }
    let a=2;
    let o={a:3,foo:foo};
    let p={a:4};
    o.foo(); // 3
    (p.foo = o.foo)(); // 2
}

function sofBind() {
    "use strict";

    if (!Function.prototype.softBind) {
        Function.prototype.softBind = function(obj) {
            let fn = this;
            // capture any curried parameters
            let curried = [].slice.call( arguments, 1 );
            let bound = function() {
                return fn.apply(
                    (!this || this === (window || global)) ? obj : this,
                    curried.concat.apply( curried, arguments ));
            };
            bound.prototype = Object.create( fn.prototype );
            return bound;
        };
    }

    //Example
    function foo() {
        console.log("name: " + this.name);
    }
    let obj = { name: "obj" },
        obj2 = { name: "obj2" },
        obj3 = { name: "obj3" };
    let fooOBJ = foo.softBind(obj);
    fooOBJ(); // name: obj
    obj2.foo = foo.softBind(obj);
    obj2.foo(); // name: obj2 <---- look!!!
    fooOBJ.call( obj3 ); // name: obj3 <---- look!
    setTimeout( obj2.foo, 10 );// name: obj   <---- falls back to soft-binding


}

function shadowingProps() {
    "use strict";
    let anotherObject = {
        a:2
    };

    let myObject = Object.create(anotherObject);

    anotherObject.a //2;
    myObject.a //2


    anotherObject.hasOwnProperty( "a" ); // true
    myObject.hasOwnProperty( "a" ); // false

    myObject.a++; // oops, implicit shadowing!

    anotherObject.a; // 2
    myObject.a; // 3
    myObject.hasOwnProperty( "a" ); // true

}

function whatIsConstructor() {
    "use strict";
    function Foo() {
        this.b = 2;
    }
    Foo.prototype = {
        a: 1
    }

    let a1 = new Foo();

    a1.constructor === Foo; // false!
    a1.constructor === Object; //true!
}

function correctInheritance() {
    "use strict";

    // pre-ES6
    // throws away default existing `Bar.prototype`
    Bar.prototype = Object.create( Foo.prototype );

    // ES6+
    // modifies existing `Bar.prototype`
    Object.setPrototypeOf( Bar.prototype, Foo.prototype );
}

function classES6Problems() {
    "use strict";
    class C {
        constructor() {
            this.num = Math.random();
        }
        rand() {
            console.log( "Random: " + this.num );
        }
    }
    let c1 = new C();
    c1.rand(); // "Random: 0.4324299..."
    C.prototype.rand = function() {
        console.log( "Random: " + Math.round( this.num * 1000 ));
    };
    let c2 = new C();
    c2.rand(); // "Random: 867"
    c1.rand(); // "Random: 432" -- oops!!!
}
