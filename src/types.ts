import { AwilixContainer } from 'awilix'
import { Logger } from './logger'
import { sampleRecipes } from './recipe/recipe.samples'
import { RecipeService } from './recipe/recipe.service'

export interface Context {
  container: AwilixContainer<Cradle>
}

export interface Cradle {
  logger: Logger
  recipeService: RecipeService
  requestId: number
  sampleRecipes: typeof sampleRecipes
}
