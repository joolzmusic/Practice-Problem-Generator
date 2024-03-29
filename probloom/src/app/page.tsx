"use client";

// useState to manage component handling: button press to update counter, update username variable, etc.
import { useState } from "react";
import styles from "./page.module.css";

// useEffect to handle event listeners (scrolling), data fetching, updating doc title, etc. 
import { useEffect } from "react";
import {
  MultipleChoiceQuestion,
  printQuestionAndChoices,
} from "./interfaces/MultipleChoiceQuestion";
import { TextQuestion, printQuestion } from "./interfaces/TextQuestion";
import FileIn from "./components/FileIn/fileIn";
import { Problem, printThing, printThingAnswers } from "./types/Problem";
import QuizSection from "./components/Quiz/QuizSection";

// imports jsPDF class from "jspdf" library
// allows you to create and modify PDF documents
import { jsPDF } from "jspdf";

export default function Home() {

  // declares a state variable "topic" and function "setTopic" to update topic state
  // useState is the React Hook, showing topic is initially an empty string
  // const = reference to the array structure [topic, setTopic] cannot change
  // ex: [topic, setTopic] = useState("newTopic"); would cause error
  const [topic, setTopic] = useState("");

  const [content, setContent] = useState("");
  const [questionType, setQuestionType] = useState("");

  // Problem[] represents an array of Problems, initially empty array
  const [problems, setProblems] = useState<Problem[]>([]); // Update the state type
  const [solutions, setSolutions] = useState("");
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // if default quiz is not hidden, it will show user the default style output (1 mcq and 1 short answer Q) 
  useEffect(() => {
    const hideDefaultQuiz = process.env.NEXT_PUBLIC_HIDE_DEFAULT_QUIZ || "1";
    if (hideDefaultQuiz === "0") {
      setTopic("java");
      setSolutions(` here is the review of your answers `);
      setProblems([
        {
          question: "question one",
          questionType: "multipleChoice",
          choices: [" choice 1", " choice 2", " choice 3", " choice 4"],
          answer: "answer here",
        },
        {
          question: "question two",
          questionType: "text",
          answer: "answer here",
        },
      ]);
    }
  }, []);

  async function handleGeneration(prompt: string, setFunction: any) {
    setLoading(true);
    setError("");

    // console.log is for testing purposes
    console.log(prompt, setFunction);

    try {
      // await = pausing execution of code until fetch operation is complete
      const response = await fetch("https://bonai.dobany.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // makes sure prompt is in json formatted string before being sent
        body: JSON.stringify({ question: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setFunction(data.answer);
    } catch (error) {
      console.error("Error calling /api/openai:", error);
      setError(
        "There was an error generating a response. Please try again later."
      );
      if (error) {
        const timer = setTimeout(() => {
          setError("");
        }, 2000); // Adjust the delay to match the transition duration

        return () => clearTimeout(timer);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateProblems() {

    // from  user
    if (topic == "" && content == "") {
      return setError("Please enter a topic or upload a pdf");
    }
    //variable declaration
    var prompt = `
    Create two short practice problem for the following topic: ${topic},
    the question type is ${questionType}. 
 if the question type is multipleChoice, give me choices,
    and answer. if the question type is text, only give me answer.
    Do not include any explanations, only provide a  RFC8259 compliant JSON response 
    following this format without deviation.
    [{
      "question": "question here", 
    "questionType": "multipleChoice or text", 
    "choices":["choice 1","choice 2","choice 3","choice 4"], 
    "answer":"answer here"}]
    The JSON response:`;

    if (content)
      prompt = `
        You are a very experienced teacher and you can create problems after reading some content; the content section will always end with "@@##".
        You now need to create two short practice problems based on content I will give you;
        the question type is ${questionType}. 
     if the question type is multipleChoice, give me choices,
        and answer. if the question type is text, only give me answer.
        Do not include any explanations, only provide a  RFC8259 compliant JSON response 
        following this format without deviation.
        [{
          "question": "question here", 
        "questionType": "multipleChoice or text", 
        "choices":["choice 1","choice 2","choice 3","choice 4"], 
        "answer":"answer here"}]
        The content is ${content.replace("@", "").replace("#", "")}. @@##
        The JSON response:`;
    console.log(prompt);

    // handleGeneration function called. Generates problems based on prompt
    handleGeneration(prompt, setUpQuiz);
  }

  // constant variable = arrow function with responseObject
  const setUpQuiz = (responseObject: any) => {
    setProblems(JSON.parse(responseObject));
  };

  
  const handleAnswerChange = (index: any, value: any) => {
    setUserAnswers({ ...userAnswers, [index]: value });
  };

  // bug fixed
  const handleRestart = () => {
    setProblems([]);
    setUserAnswers([]);
    setSolutions("");
    setTopic("");
    setContent("");
  };

  // Function to render the spinner (will be used to show that the generation is loading)
  // eg. Generating... 
  const Spinner = () => {
    return (
      <div className={styles.spinner}></div>
    );
  };

  const handleSubmit = () => {

    // Get an array of [index, answer] pairs from the userAnswers object
    const userAnswersEntries = Object.entries(userAnswers);
    console.log("User Answers:", userAnswersEntries);
    console.log(
      "Questions:",
      problems.map((problem) => problem.question)
    );

    // formatted text string for user answers and questions
    const userAnswersText = userAnswersEntries
      .map(([index, answer]) => `Answer ${parseInt(index) + 1}: ${answer}`)
      .join(", ");
    const questionsText = problems
      .map((problem, index) => `Question ${index + 1}: ${problem.question}`)
      .join(", ");
    const prompt = `I have ${userAnswersEntries.length} answers: ${userAnswersText} 
    for these ${problems.length} questions: ${questionsText}
    check my answers and give me feedback, use one paragraph for each answer.
    `;
    console.log(prompt);
    handleGeneration(prompt, setReview);
  };

  const setReview = (responseOjbect: any) => {
    console.log(responseOjbect);
    // format text for HTML rendering 
    console.log(responseOjbect.replace("Answer", "<br />Answer"));
    setSolutions(responseOjbect.replace("Answer", "<br />Answer"));
  };

  const downloadQuestionsPDF = () => {

    // result is a string variable
    var result: string = "Questions:\n\n";
    problems.forEach((item) => {
      result = result + "\n" + printThing(item);
    });

    const doc = new jsPDF();
    const text = result; // Replace with your text

    // splits content into an array of strings, each of which fits within 180 units
    // done so content fits within the PDF page width 
    const split_text = doc.splitTextToSize(text, 180);

    // adds content to position (10, 10)
    doc.text(split_text, 10, 10);

    // Save the PDF in a Blob and open it in a new window
    const pdfBlob = doc.output("blob");
    window.open(URL.createObjectURL(pdfBlob), "_blank");
  };

  const downloadQAPDF = () => {
    var result: string = "Questions:\n\n";
    problems.forEach((item) => {
      result = result + "\n" + printThing(item);
    });
    result = result + "\n\nAnswers:\n\n";
    problems.forEach((item) => {
      result = result + "\n" + printThingAnswers(item);
    });
    const doc = new jsPDF();
    const text = result;
    const split_text = doc.splitTextToSize(text, 180);
    doc.text(split_text, 10, 10);

    // Save the PDF in a Blob and open it in a new window
    const pdfBlob = doc.output("blob");
    window.open(URL.createObjectURL(pdfBlob), "_blank");
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.mainTitleDiv}>
          <img src="FlowerLogo.png" height="80" />
          <h1 className={styles.mainTitle}>Probloom</h1>
          <p className={styles.subtitle}>Let Your Problems Blossom</p>
        </div>
        {/* if error is true, it renders p with error message */}
        {error && <p className={styles.error}>{error}</p>}
        {(!problems || problems.length == 0) && (
          <div className={styles.inputDiv}>
            <div className={styles.inputDiv}>
              <div className={styles.fileInputContainer}>
                <FileIn onReceive={setContent}></FileIn>
                <label
                  htmlFor="pdfInput"
                  className={styles.customFileInputButton}
                >
                  Choose PDF
                </label>
              </div>
            </div>

            <input
              type="text"
              id="inputGen"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic"
            />

            <select data-testid="ddlQuestionType"
              id="ddlQuestionType"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Select Question Type</option>
              <option value="multipleChoice">Multiple Choice</option>
              <option value="text">Text</option>
            </select>
          </div>
        )}
        {(!problems || problems.length == 0) && (
          <div className={styles.buttonsDiv}>
            <button onClick={handleGenerateProblems} disabled={loading}>
              <a href="#quizSection">
                {loading ? "Generating..." : "Generate Problem"}
              </a>{loading && <Spinner />}
            </button>
          </div>
        )}
        {
        }
        {!solutions && problems && problems.length > 0 && (
          <div className={styles.OutputBox}>
            <QuizSection
              problems={problems}
              userAnswers={userAnswers}
              handleAnswerChange={handleAnswerChange}
            />
            <button
              className={styles.submitAnswersButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Checking your answers..." : "Submit Answers"}{loading && <Spinner />}
            </button>
            <button
              className={styles.submitAnswersButton}
              onClick={handleRestart}
              disabled={loading}
            >
              {loading ? "..." : "Restart"}
            </button>
          </div>
        )}
      </div>
      {solutions && (
        <div className={styles.SolutionBox}>
          <div
            id="quizSolution"
            dangerouslySetInnerHTML={{
              __html: solutions.replace(/\n/g, "<br>"),
            }}
          ></div>
        </div>
      )}
      {solutions && (
        <div className={styles.downloadBox}>
          <button onClick={downloadQuestionsPDF}>Download Questions</button>
          <button onClick={downloadQAPDF}>Download Q&A</button>
          <button onClick={handleRestart} disabled={loading}>
            {loading ? "..." : "Restart"}
          </button>
        </div>
      )}
      <div className={styles.bottomContainer}>
        <p id="outputText">0</p>
      </div>
    </div>
  );
}