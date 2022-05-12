import { Field, InputType } from 'type-graphql'
import { Recipe } from './recipe.type'

@InputType()
export class RecipeInput implements Partial<Recipe> {
  @Field(() => String, { nullable: true })
  description!: string

  @Field(() => [String])
  ingredients!: string[]

  @Field(() => String)
  title!: string
}
