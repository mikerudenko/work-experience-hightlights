define(function(require) {
    'use strict';

    /*jshint camelcase: false*/
    var λ = require('ramda');
    var _ = require('underscore');
    var SyntacticallySugaredMatrix = require('../js/gadgets/SyntacticallySugaredMatrix');



    var transform = new SyntacticallySugaredMatrix();
    var from = transform.row.bind(transform);
    var to = transform.column.bind(transform);
    var through = transform.element.bind(transform);

    /*jshint -W016 */
    /*jshint -W030 */
    transform                  | to('classifier_chart') | to('lemmata_word_cloud') |
    from('classifier_chart')   | through(_.identity) | through(classifierChartToLemmataWordCloud) |
    from('lemmata_word_cloud') | through(null) | through(_.identity) |
    from('surveys_bar_chart')  | through(null) | through(null) |
    from('generic_pie_chart')  | through(null) | through(null) |

    transform.renewLayout() | to('surveys_bar_chart') | to('generic_pie_chart') |
    from('classifier_chart') | through(classifierChartToSurveysBarChart) | through(classifierChartToGenericPieChart) |
    from('lemmata_word_cloud') | through(null) | through(null) |
    from('surveys_bar_chart') | through(_.identity) | through(null) |
    from('generic_pie_chart') | through(null) | through(_.identity) |

    transform.renewLayout() | to('generic_pie_chart') | to('surveys_bar_chart') |
    from('super_chart') | through(superChart) | through(superChart) |

    transform.renewLayout() | to('stacked_bar_chart') |
    from('super_chart') | through(superChartToStackedBarFormat)
    transform.renewLayout() | to('line_chart') |
    from('super_chart') | through(superChartToLineFormat);
    /*jshint +W030 */
    /*jshint +W016 */

    var query = {from: null, to: null};

    var exports = {
        from: function(value) {
            query.from = value;
            return this;
        },
        to: function(value) {
            query.to = value;
            return transform.elementByPosition({row: query.from, column: query.to});
        }
    };

    return exports;
});
