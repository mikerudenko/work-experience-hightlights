import { useState, useCallback } from "react";

export const useCodeString = () => {
  const [codeString, setCodeString] = useState("");

  const setDefaultCodeString = useCallback(() => {
    const defaultCodeString =
      "Program myProgram;\n let i,k:integer;\n Begin\n k = 10;\n i = 5;\n If (k<=45) Then {\n  k = i+15/k;\n };\n Do k = 2 To 12 By 2 While(k<7)\n   k = i+15/k;\n End;\n Read (k);\n Write (i);\n EndPr";
    setCodeString(defaultCodeString);
  }, []);

  return [
    codeString,
    {
      setCodeString,
      setDefaultCodeString
    }
  ];
};
