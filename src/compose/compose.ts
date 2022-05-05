import { produce } from 'immer'

import {
    AnyArray,
    AnyObject,
    ComposeTask,
    ThunkRecipe,
    ThunkRecipeSync,
    ThunkRecipeAsync,
} from '~/types'

import { isFunction, isAsyncFunction, immutable, watchUpdates } from '~/util'

export const compose =
    <State extends AnyObject | AnyArray, Args extends AnyArray = unknown[]>(
        ...tasks: ComposeTask<ThunkRecipe<State>, State, Args>[]
    ) =>
    async (state: State, ...args: Args[]): Promise<State> => {
        const recipes = tasks.map((task) => task(immutable(state), ...args))

        let newState = state
        const deferred: ThunkRecipeAsync<State>[] = []
        for (const recipe of recipes) {
            const thunk = await recipe

            if (thunk === undefined || !isFunction(thunk)) {
                continue
            }

            if (isAsyncFunction(thunk)) {
                deferred.push(<ThunkRecipeAsync<State>>thunk)
                continue
            }

            newState = await produce(newState, <ThunkRecipeSync<State>>thunk)
        }

        for await (const next of watchUpdates(
            deferred.map((thunk) => produce(newState, thunk))
        )) {
            newState = next
        }

        return newState
    }
