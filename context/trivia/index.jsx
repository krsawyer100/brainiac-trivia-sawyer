import {useContext, createContext, useReducer} from 'react'
import initialState from './state'
import reducer from './reducer'

export const questionContext = createContext()

export const useQuestionContext = () => {
    const context = useContext(questionContext)
    if (context === undefined)
        throw new Error('useQuestionContext must be used within QuestionProvider')
    return context
}

export const QuestionProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    return <questionContext.Provider {...props} value={[state, dispatch]} />
}