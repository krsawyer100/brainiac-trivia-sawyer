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
      title: 'Mythology',
      categoryId: 20,
      img: '/images/mythology.jpg',
      description: 'Explore the ancient myths, gods, and legends from cultures around the world.',
    },
    sports: {
      title: 'Sports',
      categoryId: 21,
      img: '/images/sports.jpg',
      description: 'Test your knowledge on everything from the Olympics to your favorite team sports.',
    },
    geography: {
      title: 'Geography',
      categoryId: 22,
      img: '/images/geography.jpg',
      description: 'From capitals to continents—how well do you know the world around you?',
    },
    history: {
      title: 'History',
      categoryId: 23,
      img: '/images/history.jpg',
      description: 'Delve into the events, people, and moments that shaped our past.',
    },
    politics: {
      title: 'Politics',
      categoryId: 24,
      img: '/images/politics.jpg',
      description: 'Answer questions about political systems, leaders, and world affairs.',
    },
    art: {
      title: 'Art',
      categoryId: 25,
      img: '/images/art.jpg',
      description: 'From classic masterpieces to modern art, discover the beauty of creativity.',
    },
    celebrities: {
      title: 'Celebrities',
      categoryId: 26,
      img: '/images/celebrities.jpg',
      description: 'How well do you know the stars of music, film, and pop culture?',
    },
    animals: {
      title: 'Animals',
      categoryId: 27,
      img: '/images/animals.jpg',
      description: 'Test your knowledge of the animal kingdom—furry, feathered, or scaly!',
    },
    vehicles: {
      title: 'Vehicles',
      categoryId: 28,
      img: '/images/vehicles.jpg',
      description: 'Cars, planes, and beyond—explore the world of machines in motion.',
    }
  },
  entertainment: {
    books: {
      title: 'Books',
      categoryId: 10,
      img: '/images/books.jpg',
      description: 'From classic literature to modern bestsellers—how well-read are you?',
    },
    film: {
      title: 'Film',
      categoryId: 11,
      img: '/images/film.jpg',
      description: 'Cinematic trivia from Hollywood hits to indie gems.',
    },
    music: {
      title: 'Music',
      categoryId: 12,
      img: '/images/music.jpg',
      description: 'Genres, artists, lyrics—everything that makes music magical.',
    },
    musicals: {
      title: 'Musicals',
      categoryId: 13,
      img: '/images/musicals.jpg',
      description: 'Broadway, West End, and beyond—sing your way through musical trivia.',
    },
    television: {
      title: 'Television',
      categoryId: 14,
      img: '/images/television.jpg',
      description: 'From binge-worthy dramas to classic sitcoms, test your TV IQ.',
    },
    videogames: {
      title: 'Video Games',
      categoryId: 15,
      img: '/images/videogames.jpg',
      description: 'From retro arcades to modern consoles—how much do you know about gaming?',
    },
    boardgames: {
      title: 'Board Games',
      categoryId: 16,
      img: '/images/boardgames.jpg',
      description: 'Strategy, luck, and trivia on classic and modern tabletop games.',
    },
    comics: {
      title: 'Comics',
      categoryId: 29,
      img: '/images/comics.jpg',
      description: 'Dive into the world of superheroes, villains, and iconic comic book stories.',
    },
    anime: {
      title: 'Anime',
      categoryId: 31,
      img: '/images/anime.jpg',
      description: 'Test your knowledge of Japanese animation—from classics to the latest hits.',
    },
    cartoons: {
      title: 'Cartoons',
      categoryId: 32,
      img: '/images/cartoons.jpg',
      description: 'From Saturday mornings to streaming favorites—animated fun awaits.',
    }
  },
  science: {
    sciences: {
      title: 'Sciences',
      categoryId: 17,
      img: '/images/sciences.jpg',
      description: 'General science questions spanning biology, chemistry, physics, and more.',
    },
    computers: {
      title: 'Computers',
      categoryId: 18,
      img: '/images/computers.jpg',
      description: 'Explore the digital world—from hardware to the internet.',
    },
    mathematics: {
      title: 'Mathematics',
      categoryId: 19,
      img: '/images/mathematics.jpg',
      description: 'Equations, logic, numbers—challenge your math brain!',
    },
    gadgets: {
      title: 'Gadgets',
      categoryId: 30,
      img: '/images/gadgets.jpg',
      description: 'Test your knowledge of cool tech, tools, and everyday innovations.',
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
  const [activeCategory, setActiveCategory] = useState("generalKnowledge")

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
              <h4 className={styles.noScores}>No High Scores Available!</h4>
            )}
          </div>
        </section>
      )}
      <section className={styles.categoriesContainer}>
      <div className={styles.categoryTabs}>
        <button className={activeCategory === "generalKnowledge" ? styles.activeTab : styles.tab} onClick={() => setActiveCategory("generalKnowledge")}>
          General Knowledge
        </button>
        <button className={activeCategory === "entertainment" ? styles.activeTab : styles.tab} onClick={() => setActiveCategory("entertainment")}>
          Entertainment
        </button>
        <button className={activeCategory === "science" ? styles.activeTab : styles.tab} onClick={() => setActiveCategory("science")}>
          Science
        </button>
      </div>
      {activeCategory === "generalKnowledge" && (
        <div className={styles.categories}>
          <h3>General Knowledge</h3>
          <div className={styles.category}>
            {Object.entries(categories.generalKnowledge).map(([key, category]) => (
              <>
                  <Link href={`/trivia/${key}`} className={styles.categoryLink} key={category.categoryId}>
                      <Image
                        src={category.img}
                        alt=""
                        width={200}
                        height={150}
                        className={styles.categoryImg}
                      />
                      <div className={styles.categoryInfo}>
                        <h4>{category.title}</h4>
                        <p>{category.description}</p>
                      </div>
                  </Link>
              </>
            ))}
            </div>
        </div>
      )}
      {activeCategory === "entertainment" && (
        <div className={styles.categories}>
          <h3>Entertainment</h3>
          <div className={styles.category}>
            {Object.entries(categories.entertainment).map(([key, category]) => (
              <>
                  <Link href={`/trivia/${key}`} className={styles.categoryLink} key={category.categoryId}>
                      <Image
                        src={category.img}
                        alt=""
                        width={200}
                        height={150}
                        className={styles.categoryImg}
                      />
                      <div className={styles.categoryInfo}>
                        <h4>{category.title}</h4>
                        <p>{category.description}</p>
                      </div>
                  </Link>
            </>
            ))}
            </div>
        </div>
      )}
      {activeCategory === "science" && (
        <div className={styles.categories}>
          <h3>Science</h3>
          <div className={styles.category}>
            {Object.entries(categories.science).map(([key, category]) => (
              <>
                  <Link href={`/trivia/${key}`} className={styles.categoryLink} key={category.categoryId}>
                      <Image
                        src={category.img}
                        alt=""
                        width={200}
                        height={150}
                        className={styles.categoryImg}
                      />
                      <div className={styles.categoryInfo}>
                        <h4>{category.title}</h4>
                        <p>{category.description}</p>
                      </div>
                  </Link>
              </>
            ))}
            </div>
        </div>
      )}
      </section>
      </main>

      <Footer />

    </div>
  );
}
