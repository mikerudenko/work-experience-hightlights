$(document).ready(function() {
    $('.tabs-container a').click(function(e) {
        e.preventDefault();
        $(this).tab('show');
    });

    const defaultSorceCode =
        
        'Program myProgram;\n let i,k:integer;\n Begin\n k = 10;\n i = 5;\n If (k<=45) Then {\n  k = i+15/k;\n };\n Do k = 2 To 12 By 2 While(k<7)\n   k = i+15/k;\n End;\n Read (k);\n Write (i);\n EndPr';

    //inspection source code from localStorage
    if (!window.localStorage.getItem('sourceCode')) {
        window.localStorage.setItem('sourceCode', defaultSorceCode);
        $('.input-sourceCode-area').val(
            window.localStorage.getItem('sourceCode')
        );
    } else {
        $('.input-sourceCode-area').val(
            window.localStorage.getItem('sourceCode')
        );
    }

    // Handlers
    $('.save-btn').click(saveSourceCode);
    $('.la-btn').click(lexicalAnalyze);
    $('.reset-btn').click(resetFunc);
    $('.default-source-code').click(defaultSourceCodeFunc);
    $('.sa-btn').click(syntaxAnalyze);
    $('.co-btn').click(compileFunc);

    function defaultSourceCodeFunc() {
        $('.input-sourceCode-area').val(defaultSorceCode);
        saveSourceCode();
    }
});

function saveSourceCode() {
    window.localStorage.setItem(
        'sourceCode',
        $('.input-sourceCode-area').val()
    );
    $("<div class='succsess-msg'>New source code was saved.</div>").appendTo(
        $('.console .panel-body')
    );
}

function giveError(str) {
    $("<div class='error-msg'>" + str + '</div>').appendTo(
        $('.console .panel-body')
    );
}

function lexicalAnalyze() {
    saveSourceCode();
    //resetFunc();
    let la = new LexicalAnalyzer();
    la.checkLines();
    if (!la.hasErrors) {
        $(
            "<div class='succsess-msg'>Lexical analyzer completed successfully.</div>"
        ).appendTo($('.console .panel-body'));
    }

    window.resultLA = !la.hasErrors;

    la.showTables();
    window.arrayOfLexems = la.arrLexems;
}

function resetFunc() {
    $('tbody').remove();
    $('<tbody></tbody>').appendTo('table');
    $('.console .panel-body').html('');
}

function syntaxAnalyze() {
    if (window.resultLA) {
        let sa = new SyntaxAnalyzer(window.arrayOfLexems),
            resultSA = sa.analyze();
        if (resultSA) {
            $(
                "<div class='succsess-msg'>Syntax analyzer completed successfully.</div>"
            ).appendTo($('.console .panel-body'));
        }
        window.resultSA = resultSA;
    } else {
        giveError('There is problem in your lexical analyzer!');
    }
}

function compileFunc() {
    resetFunc();
    lexicalAnalyze();
    syntaxAnalyze();
    if (window.resultLA) {
        let pol = new Poliz(window.arrayOfLexems);
        pol.makeInPoliz();
        let com = new Compiler(pol.poliz, pol.labels);
        com.compile();
    } else {
        giveError('There is problem in your lexicalor or syntax analyzers!');
    }
}
