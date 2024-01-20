'use client';

// structure of MCQ
export interface MultipleChoiceQuestion {
  question: string;
  questionType: 'multipleChoice';
  choices: string[];
  answer: string;
  
}

// function that inputs a MultipleChoiceQuestion object and outputs a string with the question and its choices
export function printQuestionAndChoices(questionData: MultipleChoiceQuestion): string {
  let output = questionData.question + '\n';
      questionData.choices.forEach((choice: string, index: number) => {
        output += `${index + 1}: ${choice}\n`;
      });
      return output;
  };

// inputs MCQ object and outputs the answer for that MCQ
export function printMCAnswer(questionData: MultipleChoiceQuestion): string {
  let output = questionData.answer;
      return output;
  };


