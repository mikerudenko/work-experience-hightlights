/*global define*/
define([
  'core/router'
], function (router) {
  'use strict';

  var mock = {
    "data": {
      "filterGroups": [
        [
          {
            "question_answer": 1
          },
          {
            "question_answer": 6
          },
          {
            "question_answer": 7
          },
          {
            "question_answer": 8
          },
          {
            "question_answer": 9
          },
          {
            "question_answer": 10
          }
        ]
      ],
      "groups": [
        {
          "bars": [
            {
              "label": 1,
              "count": 4,
              "value": 1
            },
            {
              "label": 6,
              "count": 2,
              "value": 6
            },
            {
              "label": 7,
              "count": 7,
              "value": 7
            },
            {
              "label": 8,
              "count": 8,
              "value": 8
            },
            {
              "label": 9,
              "count": 5,
              "value": 9
            },
            {
              "label": 10,
              "count": 11,
              "value": 10
            }
          ]
        }
      ],
      "minValue": 0,
      "maxValue": 10,
      "totalCount": 37,
      "totalCountMeasurement": "Answers",
      "filters": {
        "period": [
          "all"
        ],
        "average": [
          "0"
        ],
        "time_scale": [
          "daily"
        ],
        "date_format": [
          "0"
        ],
        "display_mode": [
          "absoluteValues"
        ],
        "distribution": [
          "1"
        ],
        "surveys": {
          "150": [
            "1274"
          ]
        },
        "drill_down": [
          "1"
        ]
      },
      "drillDown": true
    }
  };

  return ['$http', '$q', function ($http, $q) {
    return {
      load: function (id) {
        var url = router.generate('GadgetData');

        var defer = $q.defer();

        defer.resolve({data: mock});

        /**
         * @TODO: WTF?
         */
        //return defer.promise;

        return $http.get(url, {
          params: {
            'gadget_id': id
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
      }
    };
  }];
});
