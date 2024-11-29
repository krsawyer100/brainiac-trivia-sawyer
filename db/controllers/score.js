import User from '../models/user'
import dbConnect from './util/connection'

export async function getAllScores(userId) {
    await dbConnect()
    const user = await User.findById(userId).lean()
    if(!user) return null
    return user.scores.map(score => score)
}

export async function addScore(userId, category, score) {
    await dbConnect()
    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { scores: { category: category, highScore: score } } },
        { new: true }
    )
    if(!user) return null
    const addedScore = user.scores.find(score => score.highScore)
    return addedScore
}

export async function removeScore(userId, category) {
    await dbConnect()
    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { scores: { category: category } } },
        { new: true }
    )
    if (!user) return null
    return true
}

export async function updateScore(userId, category, score) {
    await dbConnect()
    const user = User.findById(userId).lean()
    if(!user) return null

    const updatedScore = user.updateOne(
        { 'scores.category': category, 'scores.highScore': { $lt: score } },
        { $set: { 'scores.$.highScore': score } },
        { new: true }
    )
    if (updatedScore) return true
    return null
}

export async function getHighScore(userId, category) {
    await dbConnect()
    const user = await User.findById(userId).lean()
    if(!user) return null
    const highScore = user.scores.find(category)
    return highScore
}