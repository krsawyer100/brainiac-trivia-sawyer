import { withIronSessionApiRoute } from "iron-session/next";
import sessionOptions from "../../../config/session"
import db from '../../../db'

export default withIronSessionApiRoute(
  function handler(req, res) {
    // if (req.method !== 'POST')
    //   return res.status(404).end()
    switch(req.method) {
      case "POST":
        return login(req, res)
      case "DELETE":
        return logout(req, res)
      case "PUT":
        return signup(req, res)
      case "GET":
        return signup(req, res)
      default:
        return res.status(404).end()
    }
  },
  sessionOptions
)

