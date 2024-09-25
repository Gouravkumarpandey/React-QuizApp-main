import { useEffect, useReducer } from "react";

import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Footer from "./Footer";
import Timer from "./Timer";
import "../index.css";

const SECS_PER_QUESTION = 50; // 50 seconds for each question

// Define your IEEE-related questions directly in the code
const staticQuestions = [
  {
    question: "What year was IEEE founded?",
    options: ["1875", "1912", "1963", "1987"],
    correctOption: 2,
    points: 10,
  },
  {
    question: "Who was the first president of IEEE after the merger of AIEE and IRE?",
    options: ["Thomas Edison", "Ernst Weber", "Nikola Tesla", "Alexander Graham Bell"],
    correctOption: 1,
    points: 10,
  },
  {
    question: "What does the acronym IEEE stand for?",
    options: [
      "International Electrotechnical Engineering Establishment",
      "Institute of Electrical and Electronics Engineers",
      "International Energy and Engineering Enterprise",
      "Institution of Engineers in Electronics and Electrics",
    ],
    correctOption: 1,
    points: 10,
  },
  // Add remaining questions here...
];

// Initial state setup
const initialState = {
  questions: [],
  status: "loading", // 'loading', 'error', 'ready', 'active', 'finished'
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: SECS_PER_QUESTION, // Timer for each question
  questionAnswered: false, // Prevent answering after time is up
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: SECS_PER_QUESTION, // Set the timer for the first question
        questionAnswered: false, // Reset answer flag for the new question
      };
    case "newAnswer":
      if (state.questionAnswered || state.secondsRemaining <= 0) return state; // Prevent answering after time is up
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
        questionAnswered: true, // Mark the question as answered
      };
    case "nextQuestion":
      return {
        ...state,
        index: state.index + 1,
        answer: null,
        secondsRemaining: SECS_PER_QUESTION, // Reset the timer for the next question
        questionAnswered: false, // Reset answer flag
      };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return { ...initialState, questions: state.questions, status: "ready" };
    case "tick":
      return {
        ...state,
        secondsRemaining:
          state.secondsRemaining > 0 ? state.secondsRemaining - 1 : 0, // Prevent negative timer
      };
    default:
      throw new Error("Unknown action type");
  }
}

export default function App() {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining, questionAnswered },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  // Timer effect
  useEffect(() => {
    if (status === "active" && secondsRemaining > 0) {
      const timerId = setInterval(() => {
        dispatch({ type: "tick" });
      }, 1000);
      return () => clearInterval(timerId); // Cleanup the interval
    } else if (secondsRemaining === 0 && status === "active") {
      setTimeout(() => {
        dispatch({ type: "nextQuestion" });
      }, 2000); // Automatically move to the next question after 2 seconds
    }
  }, [status, secondsRemaining]);

  useEffect(function () {
    // Directly dispatch static questions instead of fetching from API
    dispatch({
      type: "dataReceived",
      payload: staticQuestions,
    });
  }, []);

  return (
    <div className="wrapper">
      <div className="app">
        <div className="headerWrapper">
          <Header />

          <Main>
            {status === "loading" && <Loader />}
            {status === "ready" && (
              <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
            )}
            {status === "active" && (
              <>
                <Progress
                  index={index}
                  numQuestions={numQuestions}
                  points={points}
                  maxPossiblePoints={maxPossiblePoints}
                  answer={answer}
                />
                <Question
                  question={questions[index]}
                  dispatch={dispatch}
                  answer={answer}
                  questionAnswered={questionAnswered || secondsRemaining === 0} // Disable interaction if time is up
                />
                <Footer>
                  <Timer
                    dispatch={dispatch}
                    secondsRemaining={secondsRemaining}
                  />
                  <NextButton
                    dispatch={dispatch}
                    answer={answer}
                    numQuestions={numQuestions}
                    index={index}
                  />
                </Footer>
              </>
            )}
            {status === "finished" && (
              <FinishScreen
                points={points}
                maxPossiblePoints={maxPossiblePoints}
                highscore={highscore}
                dispatch={dispatch}
              />
            )}
          </Main>
        </div>
      </div>
    </div>
  );
}
