import { useState, useCallback } from "react";

import { generateLexemes } from "./services/LexicalAnalyzer";

export const useLexemes = codeString => {
  const [lexemes, setLexemes] = useState([]);
  const generateLexemes = useCallback(() => {
    setLexemes(generateLexemes(codeString));
  }, [codeString]);

  return [lexemes, generateLexemes];
};
