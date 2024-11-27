import DBLocal from 'db-local'
const { Schema } = new DBLocal({ path: './db' })
import bcrypt from 'bcrypt'

import { SALT_ROUNDS } from './config.js'

const User = Schema('User',{
    _id: { type:String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true }
})


export class UserRepository{
    
    static async create ({username, password}) {
        Validation.username(username)
        Validation.password(password)

        
        const user = User.findOne({username}) 
        if(user) throw new Error('Nombre de Usuario ya existe')
        
        const id = crypto.randomUUID()
        const HashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        User.create({
            _id : id,
            username,
            password: HashedPassword
        }).save()

        return id
    }
    static  async login ({username, password}) {
        Validation.username(username)
        Validation.password(password)

        const user = User.findOne({ username})
        if(!user) throw new Error('username does not exist')
        
        const isValid = await bcrypt.compareSync(password, user.password)
        if(!isValid) throw new Error('password is invalid')

        const { password : _, ...publicUser} = user 
        
        return publicUser
    };

}

class Validation {
    static username (username) {
    if(typeof username != 'string') throw new Error('Username must be a string')
    if(username.lenght < 3) throw new Error('Username must be at least 3 characters long')
    }
    static password (password) {
    if(typeof password != 'string') throw new Error('password must be a string')
    if(password.lenght < 6) throw new Error('password must be at least 6 characters long')
    }
}