const uuidv4 = require("uuid/v4");
import React, { Fragment } from "react";
import { SourceService } from "/services/SourceService/";

import "./MetaQueryService.scss";

export class MetaQueryService {
  static operators = {
    $in: "Equal",
    $nin: "Not Equal",
    $gte: ">=",
    $gt: ">",
    $lt: "<",
    $lte: "<=",
    $empty: "Is empty",
    $notempty: "Is not empty"
  };

  //Query validator
  static validateViewDataBeforeSend(query) {
    let valid = true;
    if (query.hash !== "root") {
      let { operator, value, attribute } = query;
      let isNullOperator = ["$empty", "$notempty"].includes(operator);
      let isFullValue = Array.isArray(value)
        ? value.length > 0
        : ![undefined, null].includes(value);
      valid = isNullOperator
        ? operator && attribute
        : isFullValue && operator && attribute;
    }

    if (query.items) {
      query.items.forEach(item => {
        valid = valid && MetaQueryService.validateViewDataBeforeSend(item);
      });
    }

    return valid;
  }

  //Get extra condition
  static getAttributeCompareCondition(attribute) {
    return { $in: [{ $type: attribute }, ["int", "double"]] };
  }

  static isCompareOperator(operator) {
    return ["$lt", "$gt", "$lte", "$gte"].includes(operator);
  }

  static isConditionTypeCheck(item) {
    return item.$in && item.$in[0].$type;
  }

  //Client to server formatter
  static clientToServerFormatter({ query, attributeValueKey, source }) {
    query = JSON.parse(JSON.stringify(query));

    let items = query.items;

    if (!query.items.length) {
      return JSON.stringify({});
    }

    function addOr(items) {
      let orArray = [];

      items.forEach(item => {
        let result =
          item.items && item.items.length
            ? { $and: addAnd(item) }
            : MetaQueryService.setServerItemData({
                item,
                attributeValueKey,
                source
              });

        orArray.push(result);

        let operator = Object.keys(result)[0];

        if (MetaQueryService.isCompareOperator(operator)) {
          orArray = addExtraCondition({ orArray, result, operator });
        }
      });

      return orArray;
    }

    function addExtraCondition({ orArray, result, operator }) {
      let extraCondition = MetaQueryService.getAttributeCompareCondition(
        result[operator][0]
      );

      if (orArray[orArray.length - 1].$and) {
        orArray[orArray.length - 1].$and.push(extraCondition);
      } else {
        orArray[orArray.length - 1] = {
          $and: [orArray[orArray.length - 1], extraCondition]
        };
      }

      return orArray;
    }

    function addAnd(item) {
      let andArray = [];
      let obj = MetaQueryService.setServerItemData({
        item,
        attributeValueKey,
        source
      });
      andArray.push(obj);

      let operator = Object.keys(obj)[0];

      if (MetaQueryService.isCompareOperator(operator)) {
        andArray.push(
          MetaQueryService.getAttributeCompareCondition(obj[operator][0])
        );
      }

      if (item.items && item.items.length) {
        item.items.length > 1
          ? andArray.push({ $or: addOr(item.items) })
          : andArray.push(...addAnd(item.items[0]));
      }

      return andArray;
    }

    return items.length > 1
      ? { $or: addOr(items) }
      : { $and: addAnd(items[0]) };
  }

  static setServerItemData({ item, attributeValueKey, source }) {
    let matrix = [
      {
        condition: {
          operator: "$empty"
        },
        changes: {
          operator: "$in",
          value: [null]
        }
      },
      {
        condition: {
          operator: "$notempty"
        },
        changes: {
          operator: "$nin",
          value: [null]
        }
      },
      {
        condition: {
          value: ""
        },
        changes: {
          value: null
        }
      }
    ];

    item = MetaQueryService.processMatrix({ matrix, item });
    let { attribute, value, operator } = item;

    let isChoiceColumn =
      source.attributes.find(attr => attr[attributeValueKey] === attribute)
        .originType === "CHOICE";
    let decorateAttr = attrName => {
      let attr = source.attributes.find(x => x.index === attrName);
      let name = attr && attr.name;

      return `[placeholder]${name}[placeholder]`;
    };

    if (["$in", "$nin"].includes(operator) && isChoiceColumn) {
      let data = {
        $setIsSubset: [value, decorateAttr(attribute)]
      };

      return operator === "$nin" ? { $not: data } : data;
    }

    if (operator === "$nin" && !isChoiceColumn) {
      return {
        $not: {
          $in: [decorateAttr(attribute), value]
        }
      };
    }

    return {
      [operator]: [decorateAttr(attribute), value]
    };
  }

  //matrix processing generation
  static processMatrixCondition({ condition, item, single }) {
    let extraInspection = item => {
      let valid = false;

      let conditions = [
        !single,
        single && !Array.isArray(item),
        single && Array.isArray(item) && item.length === 1
      ];

      valid = conditions.some(x => x);

      return valid;
    };

    return Object.keys(condition).every(field => {
      return Array.isArray(item[field]) && extraInspection(item[field])
        ? item[field].includes(condition[field])
        : item[field] === condition[field];
    });
  }

  static processMatrix({ matrix, item }) {
    matrix.forEach(rule => {
      let { condition, changes, single } = rule;
      let isConditionTrue = MetaQueryService.processMatrixCondition({
        condition,
        item,
        single
      });

      if (isConditionTrue) {
        Object.keys(changes).forEach(key => {
          if (Array.isArray(item[key])) {
            item[key] = item[key].map(x => {
              return x === condition[key] ? changes[key] : x;
            });
          } else {
            item[key] = changes[key];
          }
        });
      }
    });

    return item;
  }

  //Query string generation
  static getOrClientStringPart({ query, source }) {
    let result = [];
    query.items.forEach((item, index) => {
      result.push(
        MetaQueryService.clientQueryToString({ query: item, source })
      );

      if (index !== query.items.length - 1) {
        let or = (
          <strong className={"blue-label"} key={uuidv4()}>
            {" "}
            OR{" "}
          </strong>
        );
        result.push(or);
      }
    });

    return result;
  }

  static clientQueryToString({ query, source }) {
    if (query.hash === "root") {
      return MetaQueryService.getOrClientStringPart({ query, source });
    }
    let { operator, attribute, value = "" } = query;

    let attrObject = source.attributes.find(x => x.index === attribute);
    attribute = attrObject && attrObject.name;

    if (Array.isArray(value)) {
      value = value
        .map(valueItem => {
          let valueName = SourceService.getValueById({
            attribute: attrObject,
            id: valueItem
          }).name;
          return valueName === "" ? "No value" : valueName;
        })
        .join(", ");
      value = `[ ${value} ]`;
    } else {
      value = SourceService.getValueById({ attribute: attrObject, id: value })
        .name;
    }

    if (value === "" && !["$empty", "$notempty"].includes(operator)) {
      value = "No value";
    }

    let currentItemQuery = (
      <Fragment key={uuidv4()}>
        <strong>
          &nbsp;
          {attribute}
        </strong>
        <strong className={"blue-label"}>
          &nbsp;{MetaQueryService.operators[operator] || ""}&nbsp;
        </strong>
        {value && (
          <strong>
            {value}
            &nbsp;
          </strong>
        )}
      </Fragment>
    );

    let orItemsQuery;

    if (query.items && query.items.length > 0) {
      orItemsQuery = MetaQueryService.getOrClientStringPart({ query, source });
    }

    let andItems = orItemsQuery && (
      <Fragment key={uuidv4()}>
        <strong className={"blue-label"}> AND (</strong>
        {orItemsQuery}
        <strong className={"blue-label"}> )</strong>
      </Fragment>
    );

    return (
      <Fragment key={uuidv4()}>
        <strong className={"blue-label"}>( </strong>
        {currentItemQuery}
        <strong className={"blue-label"}> )</strong>
        {andItems}
      </Fragment>
    );
  }

  //Server to client formatter
  static serverToClientFormatter({
    query,
    source,
    attributeValueKey,
    placeholdersMapping
  }) {
    let result;

    function filterUnnessessaryItems(items) {
      return items.filter(item => !MetaQueryService.isConditionTypeCheck(item));
    }

    function makeOrSlice(items) {
      let dataToView = [];

      items = filterUnnessessaryItems(items);

      items.forEach(item => {
        let result = item.$and
          ? makeAndSlice(item.$and)
          : MetaQueryService.setClientItemData({
              query: item,
              placeholdersMapping
            });

        dataToView.push(result);
      });

      return dataToView;
    }

    function makeAndSlice(items) {
      let root = {};

      items = filterUnnessessaryItems(items);

      for (let index = 0; index < items.length; index++) {
        let item = items[index];

        if (item.$or) {
          return makeOrSlice(item.$or);
        }

        root = MetaQueryService.setClientItemData({
          query: item,
          placeholdersMapping
        });

        if (items.length > 1) {
          let sliceResult = makeAndSlice(items.splice(index + 1));
          root.items = Array.isArray(sliceResult)
            ? [...sliceResult]
            : [sliceResult];
        }
      }

      return root;
    }

    if (query.$or) {
      result = makeOrSlice(query.$or);
    } else if (query.$and) {
      result = [makeAndSlice(query.$and)];
    } else {
      result = [
        MetaQueryService.setClientItemData({ query, placeholdersMapping })
      ];
    }

    return {
      hash: "root",
      items: result
    };
  }

  static setClientItemData({ query, placeholdersMapping }) {
    let operator = Object.keys(query)[0];
    let attribute = query[operator][0];
    let value = query[operator][1];

    if (["$not", "$setIsSubset"].includes(operator)) {
      let lens = operator === "$not" ? query.$not : query;
      operator = operator === "$not" ? "$nin" : "$in";

      if (lens.$setIsSubset) {
        attribute = lens.$setIsSubset[1];
        value = lens.$setIsSubset[0];
      } else {
        attribute = lens.$in[0];
        value = lens.$in[1];
      }
    }

    let matrix = [
      {
        single: true,
        condition: {
          operator: "$in",
          value: null
        },
        changes: {
          operator: "$empty",
          value: ""
        }
      },
      {
        single: true,
        condition: {
          operator: "$nin",
          value: null
        },
        changes: {
          operator: "$notempty",
          value: ""
        }
      },
      {
        condition: {
          value: null
        },
        changes: {
          value: ""
        }
      }
    ];

    let item = MetaQueryService.processMatrix({
      matrix,
      item: {
        attribute: placeholdersMapping[attribute], // will be index
        operator,
        value,
        hash: uuidv4()
      }
    });

    return item;
  }
}
