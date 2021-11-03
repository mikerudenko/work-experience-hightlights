import { lexemesMap } from "./LexicalAnalyzer.constants";

export class LexicalAnalyzer {
  constructor(codeString) {
    this.codeLines = codeString.split("\n");
    this.ids = [];
    this.constants = [];
    this.lexemes = [];
    this.symbolRegex = /\(|\)|\[|\]|\{|\}|\+|-|\*|\/|:|,|;|\^|\n/;

    this.state = 1;
    this.substring = "";
    this.variables = [];
    this.canDefine = true;
    this.currentLineIndex = 0;
    this.currentSymbolIndex = 0;
    this.errorsInLexicalAnalyzer = false;
    this.hasErrors = false;
  }

  pushLexeme(code) {
    this.lexemes.push({
      lineIndex: this.currentLineIndex,
      lexeme: this.substring,
      code
    });
    this.resetSubstring();
    this.resetState();
  }

  resetSubstring() {
    this.substring = "";
  }

  resetState() {
    this.state = 1;
  }

  proceedCodeLineSymbol(symbol, symbolIndex) {
    this.currentSymbolIndex = symbolIndex;

    if (symbol === " " && this.state === 1) {
      return this.resetSubstring();
    }
    if (symbol === " " && this.state === 3) {
        this.pushLexeme(35);
    }
  }

  proceedCodeLine(codeLine, lineIndex) {
    this.currentLineIndex = lineIndex;
    codeLine.split("").forEach(this.proceedCodeLineSymbol);
  }

  checkLines() {
    this.codeLines.forEach(this.proceedCodeLine);

    for (let i = 0; i < this.arrayCodeLines.length; i++) {
    //   let line = this.arrayCodeLines[i];
    //   line += "\n";

    //   for (let j = 0; j < line.length; j++) {
    //     if (this.isGap(i, line[j])) {
    //       continue;
    //     }
    //     if (this.isSymbolLexem(i, line[j])) {
    //       continue;
    //     }

        this.state = this.inspectState(line[j]);

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
                  linenmb: i,
                  str: this.substr,
                  codeLexem: this.tableLexems[k].id
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
                    linenmb: i,
                    str: this.substr,
                    codeLexem: 34
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
                linenmb: i,
                str: this.substr,
                codeLexem: 34
              });
            }
            this.substr = line[j];
            this.state = 1;
            j--;
            break;
          case "con":
            this.arrLexems.push({
              linenmb: i,
              str: this.substr,
              codeLexem: 35
            });
            this.substr = line[j];
            this.state = 1;
            j--;
            break;
          case "=":
            this.pushLexeme(i, "=", 10);
            j--;
            break;
          case "==":
            this.pushLexeme(i, "==", 33);
            break;
          case "<=":
            this.pushLexeme(i, "<=", 29);
            break;
          case "<":
            this.pushLexeme(i, "<", 28);
            j--;
            break;
          case ">=":
            this.pushLexeme(i, ">=", 31);
            break;
          case ">":
            this.pushLexeme(i, ">", 30);
            j--;
            break;
          case "<>":
            this.pushLexeme(i, "<>", 32);
            break;
          default:
            this.substr += line[j];
            break;
        }
      }
    }
  }

  inspectState(symbol) {
    switch (this.state) {
        case 1:
            if (symbol.search(/[A-Za-z]/) !== -1) {
                return 2;
            } else if (symbol.search(/[0-9]/) !== -1) {
                return 3;
            } else if (symbol === '<') {
                return 4;
            } else if (symbol === '>') {
                return 5;
            } else if (symbol === '=') {
                return 6;
            } else if (symbol.search(this.symbRegexpr) !== -1) {
                return 'j';
            } else {
                return 'error';
            }
        case 2:
            if (symbol.search(/[A-Za-z0-9]/) !== -1) {
                return 2;
            } else {
                for (let i = 0; i < this.tableLexems.length; i++) {
                    if (this.substr === this.tableLexems[i].name) {
                        return 'j';
                    }
                }
                return 'id';
            }
        case 3:
            if (symbol.search(/[0-9]/) !== -1) {
                return 3;
            } else if (symbol.search(this.symbRegexpr) !== -1) {
                return 'con';
            } else {
                return 'error';
            }
        case 4:
            if (symbol === '=') {
                return '<=';
            } else if (symbol === '>') {
                return '<>';
            } else {
                return '<';
            }
        case 5:
            return symbol === '=' ? '>=' : '>';
        case 6:
            return symbol === '=' ? '==' : '=';
        default:
            return 'error';
    }
}
}
