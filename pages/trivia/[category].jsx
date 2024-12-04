import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { set } from 'mongoose'
import parse from 'html-react-parser'
import sessionOptions from "../../config/session";
import { withIronSessionSsr } from "iron-session/next";
import Header from "../../components/header";
import Footer from "../../components/footer";
import styles from "../../styles/Trivia.module.css";

const API_URL = `https://opentdb.com/api.php?amount=10&type=multiple`

const categoryNums = {
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

export const getServerSideProps = withIronSessionSsr(
async function getServerSideProps(context) {
    const { category } = context.params
    const user = context.req.session.user
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

    if (user) {
        props.user = user;
        props.isLoggedIn = true;
    } else {
        props.isLoggedIn = false;
        props.user = null
    }

    return { props }

}, sessionOptions)

export default function Trivia(props) {
    const router = useRouter()
    const { category } = router.query;
    const userId = props.user._id
    const isLoggedIn = props.isLoggedIn
    console.log(userId)
    const [questions, setQuestions] = useState(props.questions)
    const [questionNum, setQuestionNum] = useState(0)
    const [gameRunning, setGameRunning] = useState(false)
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(null)
    const [timeLeft, setTimeLeft] = useState(30)

    function handleStartGame() {
        if (!gameRunning) {
            setGameRunning(true)
            setQuestionNum(0)
            setScore(0)
            return
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
            setGameRunning(false)
            const finalScore = convertScore(score + (isCorrect ? 1 : 0))

            if (isLoggedIn) {
                addScore(category, finalScore, userId)
            } else {
                console.log("user is not logged in")
            }
        }
    }

    function convertScore(score) {
        const percentageScore = Math.floor((score/(questionNum + 1)) * 100)
        return percentageScore
    }

    async function addScore(category, score, userId) {
        if(!isLoggedIn) {
            console.log('user not logged in - cannot save score')
            return
        }

        try {
            const res = await fetch("/api/score/addScore", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ category, score, userId }),
            })
            if (res.status === 200) {
                setHighScore(score)
                return
            }
        } catch (err) {
            console.log(err.message)
        }
    }

    async function handleDeleteScore() {
        try {
            const res = await fetch("/api/score/removeScore", {
                method: "DELETE",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ category, userId }),
            })
            if (res.status === 200) {
                setHighScore("--")
                console.log('Score deleted successfully')
            } else {
                console.error('Error deleting score')
            }
        } catch (err) {
            console.log(err.message)
        }
    }

    function handleExploreCategories() {
        router.push('/')
    }

    useEffect(() => {
        if (isLoggedIn) {
            async function fetchHighScore() {
                try {
                    const res = await fetch(`/api/score/getHighScore?category=${category}&userId=${userId}`)
                    if (res.status === 200) {
                        const data = await res.json()
                        setHighScore(data?.highScore || 0)
                    } else {
                        console.log("error getting highscore")
                    }
                } catch (err) {
                    console.log(err.message)
                }
            }
            fetchHighScore()
        }
    }, [category, isLoggedIn, userId])

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score)
        }
    }, [score, highScore])

    return (
        <>
        <Header isLoggedIn={isLoggedIn} username={props?.user?.username} />
        <main className={styles.main}>
            {!gameRunning && questionNum === 0 && (
                <>
                <h2>Test your {category.charAt(0).toUpperCase() + category.slice(1)} Knowledge</h2>
                {!isLoggedIn && 
                <p>Note: High scores are not saved if you are not logged in.</p>
                }
                <button onClick={handleStartGame}>Start Game</button>
                </>
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
                <>
                    <h3>Game Over! Your Score: {convertScore(score)}%</h3>
                    {isLoggedIn &&
                    <>
                    <button onClick={handleDeleteScore}>Delete Score</button>
                     <h4>Highscore: {highScore}%</h4>
                     </>
                     }
                    
                    <div>
                        <button onClick={handleStartGame}>Play Again</button>
                        <button onClick={handleExploreCategories}>Explore Other Categories</button>
                    </div>
                </>
            )}
            </main>
        <Footer />
        </>
    )
}