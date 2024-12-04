import { withIronSessionApiRoute } from "iron-session/next"
import sessionOptions from "../../../config/session"
import {
    getAllScores,
    addScore,
    removeScore,
    getHighScore
} from "../../../db/controllers/score"

export default withIronSessionApiRoute(
    function handler(req, res) {
        if(!req.session.user) {
            console.log("no user found")
            return res.status(404).end()
        }
        switch(req.query.action) {
            case "getAllScores":
                return handleAllGetScores(req, res)
            case "addScore":
                return handleAddScore(req, res)
            case "removeScore":
                return handleRemoveScore(req, res)
            case "getHighScore":
                return handleGetHighScore(req, res)
            default:
                return res.status(404).end()
        }
    },
    sessionOptions
)

async function handleAllGetScores(req, res) {
    try {
        const userId = req.session.user._id
        const scores = await getAllScores(userId)
        res.status(200).json(scores)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function handleAddScore (req, res) {
    const { category, score } = req.body
    try {
        const userId = req.session.user._id
        const addedScore = await addScore(userId, category, score)
        res.status(200).json(addedScore)
    } catch (err) {
        console.error("Error in handleAddScore:", err.message);
        res.status(400).json({ error: err.message });
    }
}

async function handleRemoveScore(req, res) {
    const { category } = req.body
    try {
        const userId = req.session.user._id
        const remove = await removeScore(userId, category)
        res.status(remove ? 200 : 400).json({ remove })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function handleGetHighScore(req, res) {
    const { category } = req.query
    try {
        const userId = req.session.user._id
        const highScore = await getHighScore(userId, category)
        res.status(200).json(highScore)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}