import { produce } from 'immer'

import { AnyArray, ComposeTask } from '~/types'

import { isFunction } from '~/util'

export const compose =
    <State, Args extends AnyArray = unknown[]>(
        ...tasks: ComposeTask<State, Args>[]
    ) =>
    async (state: State, ...args: Args[]): Promise<State> => {
        const recipes = await Promise.all(
            tasks.map((task) => task(state, ...args))
        )

        let newState = state
        for (const recipe of recipes) {
            if (recipe === undefined || !isFunction(recipe)) {
                continue
            }

            newState = await produce(newState, recipe)
        }

        return newState
    }
