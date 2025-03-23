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
import Image from 'next/image'

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

const categoryMetadata = {
    books: { 
        title: "Books", 
        icon: "/images/books-icon.png" 
    },
    film: { 
        title: "Film", 
        icon: "/images/film-icon.png" 
    },
    music: { 
        title: "Music", 
        icon: "/images/music-icon.png" 
    },
    musicals: { 
        title: "Musicals", 
        icon: "/images/musicals-icon.png" 
    },
    television: {
        title: "Television", 
        icon: "/images/television-icon.png" 
    },
    videogames: { 
        title: "Video Games", 
        icon: "/images/videogames-icon.png" 
    },
    boardgames: { 
        title: "Board Games", 
        icon: "/images/boardgames-icon.png" 
    },
    nature: { 
        title: "Nature", 
        icon: "/images/nature-icon.png" 
    },
    computers: { 
        title: "Computers", 
        icon: "/images/computers-icon.png" 
    },
    mathematics: { 
        title: "Mathematics", 
        icon: "/images/mathematics-icon.png" 
    },
    mythology: { 
        title: "Mythology", 
        icon: "/images/mythology-icon.png" 
    },
    sports: { 
        title: "Sports", 
        icon: "/images/sports-icon.png" 
    },
    geography: { 
        title: "Geography", 
        icon: "/images/geography-icon.png" 
    },
    history: { 
        title: "History", 
        icon: "/images/history-icon.png" 
    },
    politics: { 
        title: "Politics", 
        icon: "/images/politics-icon.png" 
    },
    art: { 
        title: "Art", 
        icon: "/images/art-icon.png" 
    },
    celebrities: { 
        title: "Celebrities", 
        icon: "/images/celebrities-icon.png" 
    },
    animals: { 
        title: "Animals", 
        icon: "/images/animals-icon.png" 
    },
    vehicles: { 
        title: "Vehicles", 
        icon: "/images/vehicles-icon.png" 
    },
    comics: { 
        title: "Comics", 
        icon: "/images/comics-icon.png" 
    },
    gadgets: { 
        title: "Gadgets", 
        icon: "/images/gadgets-icon.png" 
    },
    anime: { 
        title: "Anime", 
        icon: "/images/anime-icon.png" 
    },
    cartoons: { 
        title: "Cartoons", 
        icon: "/images/cartoons-icon.png" 
    }
  }

export const getServerSideProps = withIronSessionSsr(
async function getServerSideProps(context) {
    const { category } = context.params
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

    if (context.req.session.user) {
        props.user = context.req.session.user;
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
    const userId = props.user ? props.user._id : null
    const isLoggedIn = props.isLoggedIn
    console.log(userId)
    const [questions, setQuestions] = useState(props.questions)
    const [questionNum, setQuestionNum] = useState(0)
    const [gameRunning, setGameRunning] = useState(false)
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(null)
    const [timeLeft, setTimeLeft] = useState(30)
    const categoryInfo = categoryMetadata[category] || { title: category, icon: "❓" };

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
                const localScores = JSON.parse(localStorage.getItem("HighScores")) || {}
                const prevScore = localScores[category]
                if(!prevScore || finalScore > prevScore) {
                    localScores[category] = finalScore
                    localStorage.setItem("HighScores", JSON.stringify(localScores))
                    setHighScore(finalScore)
                }
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
        if (isLoggedIn) {
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
        } else {
            const localScores = JSON.parse(localStorage.getItem("HighScores")) || {}
            delete localScores[category]
            localStorage.setItem("HighScores", JSON.stringify(localScores))
            setHighScore("--")
        }
    }

    function handleExploreCategories() {
        router.push('/')
    }

    useEffect(() => {
        if (!gameRunning) return
        setTimeLeft(30)

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    handleAnswerSelection(null);
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer)
    }, [questionNum, gameRunning])
    useEffect(() => {
        if (isLoggedIn && userId) {
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
        } else {
            const localScores = JSON.parse(localStorage.getItem("HighScores")) || {}
            const localHighScore = localScores[category]
            if (localHighScore !== undefined) {
                setHighScore(localHighScore)
            }
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
                <div className={styles.startGame}>
                    <div className={styles.gameInfo}>
                        <Image
                            src={categoryInfo.icon}
                            alt=""
                            width={60}
                            height={60}
                        />
                        <h2>Test your {categoryInfo.title} Knowledge</h2>
                        <Image
                            src={categoryInfo.icon}
                            alt=""
                            width={60}
                            height={60}
                        />
                    </div>
                    <button onClick={handleStartGame}>Start Game</button>
                </div>
                </>
            )}
            {gameRunning && (
                <>
                <div className={styles.gameContainer}>
                    <p className={styles.timer}>Time Left: {timeLeft} secs</p>
                    <h3>{parse(questions[questionNum].question)}</h3>
                    <div className={styles.answersContainer}>
                        {questions[questionNum].answerChoices.map((choice, i) => (
                            <>
                                <button key={i} onClick={() => handleAnswerSelection(choice)}>
                                    {parse(choice)}
                                </button>
                            </>
                        ))}
                    </div>
                    <p>Question {questionNum + 1} of {questions.length}</p>
                </div>
                </>
            )}

            {!gameRunning && questionNum > 0 && (
                <>  
                    <div className={styles.endGame}>
                    <h2>Game Over! Your Score: {convertScore(score)}%</h2>
                    <div className={styles.endGameButtons}>
                        <button onClick={handleStartGame}>Play Again</button>
                        <button onClick={handleExploreCategories}>Explore Other Categories</button>
                    </div>
                    <div className={styles.endGameHighScore}>
                     <h3>Highscore: {highScore !== null ? `${highScore}%` : "--"}</h3>
                     <button onClick={handleDeleteScore}>
                        <Image
                            src="/images/trash-icon.png"
                            alt=""
                            width={20}
                            height={20}
                        />
                        <p>Delete Score</p>
                    </button>
                </div>
                </div>
                </>
            )}
            </main>
        <Footer />
        </>
    )
}