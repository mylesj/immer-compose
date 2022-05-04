import { produce } from 'immer'

import { AnyArray, ComposeTask, ComposeRecipe } from '~/types'

import { isFunction } from '~/util'

export const compose =
    <State, Args extends AnyArray = unknown[]>(
        ...tasks: ComposeTask<ComposeRecipe<State>, State, Args>[]
    ) =>
    async (state: State, ...args: Args[]): Promise<State> => {
        const recipes = tasks.map((task) => task(state, ...args))

        let newState = state
        for (const recipe of recipes) {
            const thunk = await recipe
            if (thunk === undefined || !isFunction(thunk)) {
                continue
            }

            newState = await produce(newState, thunk)
        }

        return newState
    }
