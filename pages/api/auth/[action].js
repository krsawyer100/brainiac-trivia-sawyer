import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "../../../config/session"
import db from '../../../db'
import { use } from "react";

export default withIronSessionApiRoute(
  function handler(req, res) {
    if (req.method !== 'POST')
      return res.status(404).end()
    switch(req.query.action) {
      case "login":
        return login(req, res)
      case "logout":
        return logout(req, res)
      case "signup":
        return signup(req, res)
      default:
        return res.status(404).end()
    }
  },
  sessionOptions
)

async function login(req, res) {
  const { username, password } = req.body
  try {
    const {
      password: _,
      ...otherFields
    } = await db.auth.login(username, password)
    req.session.user = otherFields
    await req.session.save()
    res.status(200).end()
  } catch(err) {
    res.status(400).json({error: err.message})
  }
}
async function logout(req, res) {
  await req.session.destroy()
  res.status(200).end()
}
async function signup(req, res) {
  try {
    const {username, password, localScores} = req.body
    const {
      password: _,
      ...otherFields
    } = await db.user.create(username, password)
    req.session.user = otherFields
    await req.session.save()

    if (localScores) {
      const userId = otherFields._id
      
      for (const category in localScores) {
        const score = localScores[category]
        await db.score.addScore(userId, category, score)
      }
    }
    res.redirect('/')
  } catch(err) {
    res.status(400).json({error: err.message})
  }
}