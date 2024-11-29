import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { set } from 'mongoose'
import parse from 'html-react-parser'

const API_URL = `https://opentdb.com/api.php?amount=10&type=multiple`

const categoryNums = {
    general: 9,
    books: 10,
    film: 11,
    music: 12,
    musicals: 13,
    television: 14,
    videogames: 15,
    boardgames: 16,
    nature: 17,
    computers: 18,
    mathematics: 19,
    mythology: 20,
    sports: 21,
    geography: 22,
    history: 23,
    politics: 24,
    art: 25,
    celebrities: 26,
    animals: 27,
    vehicles: 28,
    comics: 29,
    gadgets: 30,
    anime: 31,
    cartoons: 32 
}

export async function getServerSideProps(req) {
    const { category } = req.params
    const categoryId = categoryNums[category]
    const props = {}

    if (!categoryId) {
        console.log('No category Id found')
        return { props }
    }

    const res = await fetch(`${API_URL}&category=${categoryId}`)
    const data = await res.json()

    if (!data.results || data.results.length === 0) {
        console.log('No questions found in API response');
        return { props };
    }
    
    props.questions = data.results.map((item) => ({
        question: item.question,
        category: item.category,
        answerChoices: [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5),
        correctAnswer: item.correct_answer
    }))

    return { props }

}

export default function Trivia(props) {
    const router = useRouter()
    const { category } = router.query
    console.log(props.questions)
    const [questions, setQuestions] = useState(props.questions)
    const [questionNum, setQuestionNum] = useState(0)
    const { question, choices } = questions[questionNum]
    const [gameRunning, setGameRunning] = useState(false)
    const [score, setScore] = useState(0)
    const [result, setResult] = useState({
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0
    })
    const [timeLeft, setTimeLeft] = useState(30)

    function handleStartGame() {
        if (!gameRunning) {
            setGameRunning(true)
            return gameRunning
        } else return
    }

    function handleAnswerSelection(choice) {
        const isCorrect = choice === questions[questionNum].correctAnswer
        if (isCorrect) {
            setScore((prev) => prev + 1)
        }

        if (questionNum < questions.length - 1) {
            setQuestionNum((prev) => prev + 1)
        } else {
            handleEndGame()
        }
    }

    function handleEndGame() {
        if (gameRunning) {
            setGameRunning(false)
            return gameRunning
        } else return
    }

    function convertScore(score) {
        const percentageScore = Math.floor((score/(questionNum + 1)) * 100)
        return percentageScore
    }

    useEffect(() => {
        console.log("game running: ", gameRunning)
    }, [gameRunning])

    return (
        <>
            <h2>Test your {category.charAt(0).toUpperCase() + category.slice(1)} Knowledge</h2>
            {!gameRunning && (
                <button onClick={handleStartGame}>Start Game</button>
            )}
            {gameRunning && (
                <>
                <h3>Question {questionNum + 1} of {questions.length}</h3>
                <h4>{parse(questions[questionNum].question)}</h4>
                <div>
                    {questions[questionNum].answerChoices.map((choice, i) => (
                        <>
                            <button key={i} onClick={() => handleAnswerSelection(choice)}>
                                {parse(choice)}
                            </button>
                        </>
                    ))}
                </div>
                </>
            )}

            {!gameRunning && questionNum > 0 && (
                <div>
                    <h3>Game Over! Your Score: {convertScore(score)}%</h3>
                </div>
            )}

            {/* <div>
                {props.questions.map((q, index) => (
                    <div key={index}>
                        <h3>{q.question}</h3>
                        <div>
                            {q.answerChoices.map((choice, i) => (
                                <button key={i}>{choice}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div> */}
        </>
    )
}