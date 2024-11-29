import * as actions from './actions'

export default function reducer(state, {action, payload}) {
    switch(action) {
        case actions.FETCH_QUESTIONS:
            return {...state, triviaQuestionResults: payload}
        default:
            return state
    }
}