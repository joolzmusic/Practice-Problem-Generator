'use client';
export interface TextQuestion {
  question: string;
  questionType: 'text';
  answer: string;
}

// takes in TextQuestion object and outputs the question
export function printQuestion(questionData: TextQuestion): string {
  let output = questionData.question + '\n';
  return output;
};

//  inputs TextQuestion object and outputs the answer
export function printTextAnswer(questionData: TextQuestion): string {
  let output = questionData.answer + '\n';
  return output;
};