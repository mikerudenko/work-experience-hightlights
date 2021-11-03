define(function () {
    'use strict';

    /*
     * @example
     *
     * var matrix = new SyntacticallySugaredMatrix();
     * matrix          | matrix.column('a') | matrix.column('b') |
     * matrix.row('c') | matrix.element(0)  | matrix.element(1)  |
     * matrix.row('d') | matrix.element(2)  | matrix.element(3)  ;
     *
     */

    function SyntacticallySugaredMatrix() {
        this.columns = []; 
        this.rows = []; 
        this.elements = []; 
        this.index = 0;
    }

    SyntacticallySugaredMatrix.prototype.column = function (value) {
        this.columns.push(value);
    };

    SyntacticallySugaredMatrix.prototype.row = function (value) {
        this.rows.push(value);
    };

    SyntacticallySugaredMatrix.prototype.element = function (value) {
        this.elements.push({ position: this.elementIndexToPosition(this.index++), value: value });
    };

    SyntacticallySugaredMatrix.prototype.elementByPosition = function (position) {
        return this.elements.find(atPosition(position)) && this.elements.find(atPosition(position)).value;
    };

    SyntacticallySugaredMatrix.prototype.renewLayout = function (position) {
        /*jshint -W030 */
        this.rows = [], this.columns = [], this.index = 0;
        /*jshint +W030 */
    };

    SyntacticallySugaredMatrix.prototype.elementIndexToPosition = function (index) {
        return {
            row: this.rows[Math.floor(index / this.columns.length)],
            column: this.columns[index % this.columns.length]
        };
    };

    function atPosition(position) {
        return function(element) {
            return (element.position.row === position.row) && (element.position.column === position.column);
        };
    }

    return SyntacticallySugaredMatrix;
});
