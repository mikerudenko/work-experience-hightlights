import { createMachine, interpret } from "xstate";

export const lexemesMap = [
  { id: 1, name: "Program" },
  { id: 2, name: ";" },
  { id: 3, name: "Var" },
  { id: 4, name: "Begin" },
  { id: 5, name: "End" },
  { id: 6, name: "EndPr" },
  { id: 7, name: ":" },
  { id: 8, name: "integer" },
  { id: 9, name: "," },
  { id: 10, name: "=" },
  { id: 11, name: "Read" },
  { id: 12, name: "Write" },
  { id: 13, name: "Do" },
  { id: 14, name: "To" },
  { id: 15, name: "By" },
  { id: 16, name: "While" },
  { id: 17, name: "If" },
  { id: 18, name: "Then" },
  { id: 19, name: "+" },
  { id: 20, name: "-" },
  { id: 21, name: "*" },
  { id: 22, name: "/" },
  { id: 23, name: "^" },
  { id: 24, name: "Or" },
  { id: 25, name: "Not" },
  { id: 26, name: "(" },
  { id: 27, name: ")" },
  { id: 28, name: "<" },
  { id: 29, name: "<=" },
  { id: 30, name: ">" },
  { id: 31, name: ">=" },
  { id: 32, name: "<>" },
  { id: 33, name: "==" },
  { id: 34, name: "id" },
  { id: 35, name: "constant" },
  { id: 36, name: "[" },
  { id: 37, name: "]" },
  { id: 38, name: "And" },
  { id: 39, name: "{" },
  { id: 40, name: "}" },
];

const searchLetter = (symbol) => (symbol.search(/[A-Za-z]/) !== -1 ? 2 : false);
const searchNumber = (symbol) => (symbol.search(/[0-9]/) !== -1 ? 3 : false);
const searchOperator = (symbol) =>
  symbol.search(this.symbolRegex) !== -1 ? "j" : false;
const searchLetterAndNumber = (symbol) =>
  searchLetter(symbol) || searchNumber(symbol);

const findReservedLexeme = (substring) =>
  lexemesMap.find(({ name }) => name === substring);

export const stateMap = {
  "1": {
    "<": 4,
    ">": 5,
    "=": 6,
    other: [searchLetter, searchNumber, searchOperator, () => "error"],
  },
  "2": {
    other: [searchLetterAndNumber, findReservedLexeme, () => "id"],
  },
  "3": {
    other: [searchNumber, searchOperator, () => "error"],
  },
  "4": {
    "=": "<=",
    ">": "<>",
    other: [() => "<"],
  },
  "5": {
    "=": ">=",
    other: [() => ">"],
  },
  "6": {
    "=": ">=",
    other: [() => ">"],
  },
  other: [() => "error"],
};

const lexicalMachine = createMachine({
  id: "lexicalMachine",
  initial: "empty",
  states: {
    1: {
      on: {
        "<": 4,
        ">": 5,
        "=": 6,
        isNumber: 3,
        isLetter: 2,
        isOperator: "j",
        isError: "error",
      },
    },
    2: {
      on: {
        isNumberLetter: 2,
        isLexeme: "j",
        isId: "id",
      },
    },
    3: {
      on: {
        isNumber: 3,
        isOperator: "con",
        isError: "error",
      },
    },
    4: {
      on: {
        "=": "<=",
        ">": "<>",
        isSpace: "<",
      },
    },
    5: {
      on: {
        "=": ">=",
        isSpace: ">",
      },
    },
    "6": {
      on: {
        "=": "==",
        isSpace: "=",
      },
    },
  },
});

const lexicalService = interpret(lexicalMachine);
