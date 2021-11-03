class LexicalAnalyzer {
  constructor() {
    this.arrayCodeLines = window.localStorage.getItem("sourceCode").split("\n");
    this.arrayIds = [];
    this.arrayConstants = [];
    this.countIDs = 0;
    this.countConstants = 0;
    this.arrLexems = [];
    this.state = 1;
    this.substr = "";
    this.arrVars = [];
    this.canDefine = true;
    this.symbRegexpr = /\(|\)|\[|\]|\{|\}|\+|\-|\*|\/|\:|\,|\;|\^|\n/;
    this.errorsInLexicalAnalyzer = false;
    this.hasErrors = false;
    this.tableLexems = [
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
      { id: 40, name: "}" }
    ];
  }

  printRow(arr, i, index, table) {
    if (arr[i].hasOwnProperty("code")) {
      $(
        "<tr>" +
          "<td>" +
          arr[i].str +
          "</td>" +
          "<td>" +
          arr[i].code +
          "</td>" +
          "<td>" +
          (arr[i].lineNumber + 1) +
          "</td>" +
          "<td>" +
          index +
          "</td>" +
          "<tr>"
      ).appendTo($(".first-table tbody"));
    } else {
      $(
        "<tr>" +
          "<td>" +
          arr[i].str +
          "</td>" +
          "<td>" +
          arr[i].number +
          "</td>" +
          "<tr>"
      ).appendTo($(table));
    }
  }

  showTables() {
    for (let i = 0; i < this.arrLexems.length; i++) {
      if (this.arrLexems[i].code == 34) {
        this.countIDs++;
        this.arrayIds.push({
          str: this.arrLexems[i].str,
          number: this.countIDs
        });
        this.printRow(this.arrLexems, i, this.countIDs);
      } else if (this.arrLexems[i].code == 35) {
        this.countConstants++;
        this.arrayConstants.push({
          str: this.arrLexems[i].str,
          number: this.countConstants
        });
        this.printRow(this.arrLexems, i, this.countConstants);
      } else {
        this.printRow(this.arrLexems, i, null);
      }
    }

    this.arrayIds.forEach((_, index) =>
      this.printRow(this.arrayIds, index, null, ".second-table tbody")
    );

    for (let i = 0; i < this.arrayConstants.length; i++) {
      this.printRow(this.arrayConstants, i, null, ".third-table tbody");
    }
  }

  toInitialState(lineNumber, str, code) {
    this.arrLexems.push({
      lineNumber: lineNumber,
      str: str,
      code: code
    });
    this.substr = "";
    this.state = 1;
  }

  isGap(lineNumber, symb) {
    if (symb === " " && this.state === 1) {
      this.substr = "";
      return true;
    } else if (symb === " " && this.state === 3) {
      this.toInitialState(lineNumber, this.substr, 35);
      return true;
    }
    return false;
  }

  isSymbolLexem(lineNumber, symb) {
    if (symb.search(this.symbRegexpr) !== -1 && this.state === 1) {
      for (let i = 0; i < this.tableLexems.length; i++) {
        if (this.tableLexems[i].name === symb) {
          this.arrLexems.push({
            lineNumber: lineNumber,
            str: symb,
            code: this.tableLexems[i].id
          });
        }
      }
      this.substr = "";
      return true;
    }
    return false;
  }

  checkLines() {
    for (let i = 0; i < this.arrayCodeLines.length; i++) {
      let line = this.arrayCodeLines[i];
      line += "\n";

      for (let j = 0; j < line.length; j++) {
        if (this.isGap(i, line[j])) {
          continue;
        }
        if (this.isSymbolLexem(i, line[j])) {
          continue;
        }

        this.state = this.incpectState(line[j]);

        switch (this.state) {
          case "error":
            giveError("Error on line " + i + ". Please check your syntax");
            this.hasErrors = true;
            break;
          case "j":
            if (this.substr === "Begin") {
              this.canDefine = false;
            }
            for (let k = 0; k < this.tableLexems.length; k++) {
              if (this.substr === this.tableLexems[k].name) {
                //circle is working even when number is find
                this.arrLexems.push({
                  lineNumber: i,
                  str: this.substr,
                  code: this.tableLexems[k].id
                });
              }
            }
            this.substr = line[j];
            this.state = 1;
            j--;
            break;
          case "id":
            if (!this.canDefine) {
              for (let k = 0; k < this.arrVars.length; k++) {
                if (this.arrVars[k] == this.substr) {
                  this.arrLexems.push({
                    lineNumber: i,
                    str: this.substr,
                    code: 34
                  });
                  break;
                }
                if (k === this.arrVars.length - 1) {
                  giveError(
                    "Undefined variable : " + this.substr + ". Line " + i
                  );
                  this.hasErrors = true;
                }
              }
            } else {
              this.arrVars.push(this.substr);
              this.arrLexems.push({
                lineNumber: i,
                str: this.substr,
                code: 34
              });
            }
            this.substr = line[j];
            this.state = 1;
            j--;
            break;
          case "con":
            this.arrLexems.push({
              lineNumber: i,
              str: this.substr,
              code: 35
            });
            this.substr = line[j];
            this.state = 1;
            j--;
            break;
          case "=":
            this.toInitialState(i, "=", 10);
            j--;
            break;
          case "==":
            this.toInitialState(i, "==", 33);
            break;
          case "<=":
            this.toInitialState(i, "<=", 29);
            break;
          case "<":
            this.toInitialState(i, "<", 28);
            j--;
            break;
          case ">=":
            this.toInitialState(i, ">=", 31);
            break;
          case ">":
            this.toInitialState(i, ">", 30);
            j--;
            break;
          case "<>":
            this.toInitialState(i, "<>", 32);
            break;
          default:
            this.substr += line[j];
            break;
        }
      }
    }
  }

  incpectState(symb) {
    switch (this.state) {
      case 1:
        if (symb.search(/[A-Za-z]/) !== -1) {
          return 2;
        } else if (symb.search(/[0-9]/) !== -1) {
          return 3;
        } else if (symb === "<") {
          return 4;
        } else if (symb === ">") {
          return 5;
        } else if (symb === "=") {
          return 6;
        } else if (symb.search(this.symbRegexpr) !== -1) {
          return "j";
        } else {
          return "error";
        }
      case 2:
        if (symb.search(/[A-Za-z0-9]/) !== -1) {
          return 2;
        } else {
          for (let i = 0; i < this.tableLexems.length; i++) {
            if (this.substr === this.tableLexems[i].name) {
              return "j";
            }
          }
          return "id";
        }
      case 3:
        if (symb.search(/[0-9]/) !== -1) {
          return 3;
        } else if (symb.search(this.symbRegexpr) !== -1) {
          return "con";
        } else {
          return "error";
        }
      case 4:
        if (symb === "=") {
          return "<=";
        } else if (symb === ">") {
          return "<>";
        } else {
          return "<";
        }
      case 5:
        return symb === "=" ? ">=" : ">";
      case 6:
        return symb === "=" ? "==" : "=";
      default:
        return "error";
    }
  }
}
