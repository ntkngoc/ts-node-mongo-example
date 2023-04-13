import express from "express";
import { createUser, getUserByEmail } from "../db/users";
import { authentication, random } from "../helpers";

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, username } = req.body
        if (!email || !password || !username)
            return res.status(400).json('Invalid data!')

        const existingUser = await getUserByEmail(email)
        if (existingUser)
            return res.status(400).json('existingUser')

        const salt = random()
        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password)
            }
        })

        return res.status(200).json(user)
    } catch (error) {
        console.log('🚀 ~ register ~ error:', error)
        return res.status(400).json(error)
    }
}

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { password, email } = req.body
        if (!password || !email)
            return res.status(400).json('Invalid data!')

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password')
        if (!user)
            return res.status(400)

        const expectedHash = authentication(user.authentication.salt, password)
        if (user.authentication.password !== expectedHash)
            return res.status(403).json("Not match!")

        const salt = random()
        user.authentication.sessionToken = authentication(salt, user._id.toString())
        await user.save()
        res.cookie('ANTONIO-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' });

        return res.status(200).json(user)
    } catch (error) {
        console.log('🚀 ~ login ~ error:', error)
        return res.status(400).json(error)
    }
}