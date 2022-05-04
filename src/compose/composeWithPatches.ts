import { produceWithPatches, Patch } from 'immer'

import { AnyArray, ComposeTask, ComposeWithPatchesRecipe } from '~/types'
import { isFunction } from '~/util'

export const composeWithPatches =
    <State, Args extends AnyArray = unknown[]>(
        ...tasks: ComposeTask<ComposeWithPatchesRecipe<State>, State, Args>[]
    ) =>
    async (
        state: State,
        ...args: Args[]
    ): Promise<[State, Patch[], Patch[]]> => {
        const recipes = tasks.map((task) => task(state, ...args))

        let newState = state
        const patches: Patch[] = []
        const reversed: Patch[] = []
        for (const recipe of recipes) {
            const thunk = await recipe
            if (thunk === undefined || !isFunction(thunk)) {
                continue
            }

            const [next, patch, reverse] = await produceWithPatches(
                newState,
                thunk
            )
            newState = next
            patches.push(...patch)
            reversed.push(...reverse)
        }

        return [newState, patches, reversed]
    }
