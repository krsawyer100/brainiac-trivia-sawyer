import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import styles from "../styles/Home.module.css";
import Header from "../components/header";
import useLogout from "../hooks/useLogout";
import { useState, useEffect } from 'react'
import Footer from "../components/footer";

const categories = {
  generalKnowledge: {
    mythology: {
      categoryId: 20
    },
    sports: {
      categoryId: 21
    },
    geography: {
      categoryId: 22
    },
    history: {
      categoryId: 23
    },
    politics: {
      categoryId: 24
    },
    art: {
      categoryId: 25
    },
    celebrities: {
      categoryId: 26
    },
    animals: {
      categoryId: 27
    },
    vehicles: {
      categoryId: 28
    }
  },
  entertainment: {
    books: {
      categoryId: 10
    },
    film: {
      categoryId: 11
    },
    music: {
      categoryId: 12
    },
    musicals: {
      categoryId: 13
    },
    television: {
      categoryId: 14
    },
    videogames: {
      categoryId: 15
    },
    boardgames: {
      categoryId: 16
    },
    comics: {
      categoryId: 29
    },
    anime: {
      categoryId: 31
    },
    cartoons: {
      categoryId: 32
    }
  },
  science: {
    sciences: {
      categoryId: 17
    },
    computers: {
      categoryId: 18
    },
    mathematics: {
      categoryId: 19
    },
    gadgets: {
      categoryId: 30
    }
  }
}

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const props = {};
    if (req.session.user) {
      props.user = req.session.user;
      props.isLoggedIn = true;
    } else {
      props.isLoggedIn = false;
    }
    return { props };
  },
  sessionOptions
);

export default function Home(props) {
  const router = useRouter();
  const logout = useLogout();
  const isLoggedIn = props.isLoggedIn
  const user = props.user
  const [scores, setScores] = useState([])

  useEffect(() => {
    async function fetchHighScores() {
      try {
        if (isLoggedIn && user) {
          const userId = props.user._id
          const res = await fetch(`/api/score/getAllScores?userId=${userId}`)
          if (res.status === 200) {
              const data = await res.json()
              setScores(data)
          } else {
              console.log("error getting highscores")
          }
        }
      } catch (err) {
          console.log(err.message)
      }
    }
    fetchHighScores()
  }, [isLoggedIn, user, scores])

  async function handleDeleteScore(e) {
    const category = e.target.value
    try {
        const userId = props.user._id
        const res = await fetch("/api/score/removeScore", {
            method: "DELETE",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ category, userId }),
        })
        if (res.status === 200) {
            console.log('Score deleted successfully')
        } else {
            console.error('Error deleting score')
        }
    } catch (err) {
        console.log(err.message)
    }
}

  return (
    <div className={styles.container}>
      <Head>
        <title>Brainiac Trivia</title>
        <meta name="description" content="Brainiac Trivia" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Titan+One&family=Ubuntu+Sans:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet"/>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧠</text></svg>" />
      </Head>

      <Header isLoggedIn={props.isLoggedIn} username={props?.user?.username} />

      <main className={styles.main}>
      <section className={styles.heroContainer}>
        <div className={styles.heroText}>
          <h1>Brainiac Trivia</h1>
          <h3>Test your knowledge with Brainiac Trivias games!</h3>
        </div>
      </section>
      {isLoggedIn && (
        <section className={styles.highScores}>
          <h2>{user.username}&apos;s High Scores</h2>
          <div className={styles.highScoresContainer}>
            {Array.isArray(scores) && scores.length > 0 ? (
              scores.map((score) => (
                <>
                  <div key={score.category} className={styles.highScore}>
                    <h3>{score.category.charAt(0).toUpperCase() + score.category.slice(1)}</h3>
                    <h4>High Score: {score.highScore}</h4>
                    <button onClick={handleDeleteScore} value={score.category}>Delete Score</button>
                  </div>
                </>
              ))
            ) : (
              <p>No High Scores Available</p>
            )}
          </div>
        </section>
      )}
      <section className={styles.categoriesContainer}>
      <h2>Categories</h2>
        <div className={styles.categories}>
          <h3>General Knowledge</h3>
          <div className={styles.category}>
            {Object.keys(categories.generalKnowledge).map((category) => (
              <>
                  <Link href={`/trivia/${category}`} className={styles.categoryInfo} key={category.categoryId}>
                      <img src="https://picsum.photos/200" />
                      <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
                  </Link>
              </>
            ))}
            </div>
        </div>
        <div className={styles.categories}>
          <h3>Entertainment</h3>
          <div className={styles.category}>
            {Object.keys(categories.entertainment).map((category) => (
              <>
                  <Link href={`/trivia/${category}`} className={styles.categoryInfo} key={category.categoryId}>
                      <img src="https://picsum.photos/200"/>
                      <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
                  </Link>
            </>
            ))}
            </div>
        </div>
        <div className={styles.categories}>
          <h3>Science</h3>
          <div className={styles.category}>
            {Object.keys(categories.science).map((category) => (
              <>
                  <Link href={`/trivia/${category}`} className={styles.categoryInfo} key={category.categoryId}>
                      <img src="https://picsum.photos/200"/>
                      <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
                  </Link>
            </>
            ))}
            </div>
        </div>
      </section>
      </main>

      <Footer />

    </div>
  );
}
