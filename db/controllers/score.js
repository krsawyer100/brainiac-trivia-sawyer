import User from '../models/user'
import dbConnect from './util/connection'

export async function getAllScores(userId) {
    await dbConnect()
    const user = await User.findById(userId).lean()
    if(!user) return null

    return user.scores.map(score => ({
        category: score.category,
        highScore: score.highScore
    }))
}

export async function addScore(userId, category, score) {
    await dbConnect()

    const user = await User.findById(userId)

    if (!user) return null

    if (!user.scores) user.scores = []

    const existingScore = user.scores.find((s) => s.category === category)

    if (existingScore) {
        if (score > existingScore.highScore) {
            existingScore.highScore = score
            await user.save()
        }
    } else {
        console.log("Before pushing to scores:", user.scores);
        user.scores.push({ category, highScore: score })
        console.log("After pushing to scores:", user.scores);
        await user.save()
    }

    console.log(userId, user.scores)

    return user.scores.find((s) => s.category === category)
}

export async function removeScore(userId, category) {
    await dbConnect()

    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { scores: { category: category, highScore: {$exists: true} } } },
        { new: true }
    )
    if (!user) return null

    await user.save()
    console.log(userId, user.scores)
    return user.scores
}

export async function getHighScore(userId, category) {
    await dbConnect()
    const user = await User.findById(userId).lean()
    if(!user) return null
    const highScore = user.scores.find((score) => score.category === category)
    return highScore
}