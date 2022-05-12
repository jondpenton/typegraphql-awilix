import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import * as Awilix from 'awilix'
import { buildSchema, ResolverData } from 'type-graphql'
import { Logger } from './logger'
import { RecipeResolver } from './recipe/recipe.resolver'
import { sampleRecipes } from './recipe/recipe.samples'
import { RecipeService } from './recipe/recipe.service'
import { Context } from './types'

const container = Awilix.createContainer().register({
  logger: Awilix.asClass(Logger),
  recipeService: Awilix.asClass(RecipeService).classic(),
  sampleRecipes: Awilix.asValue(sampleRecipes),
})

async function main() {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [RecipeResolver],
    // register our custom, scoped IOC container by passing a extracting from resolver data function
    container: ({ context }: ResolverData<Context>) => ({
      get(someClass, _resolverData) {
        // Alternatively, you could register the resolvers in the container
        // (like `.register({ RecipeResolver: Awilix.asClass(RecipeResolver).classic() })`)
        // and do `context.container.resolve(someClass.name)`
        return context.container.build(someClass, {
          injectionMode: `CLASSIC`,
        })
      },
    }),
  })

  // create GraphQL server
  const server = new ApolloServer({
    schema,
    // we need to provide unique container with `requestId` for each request
    context: (): Context => {
      const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) // uuid-like
      const context = {
        container: container.createScope().register({
          requestId: Awilix.asValue(requestId),
        }),
      }

      return context
    },
    // create a plugin that will allow for disposing the scoped container created for every request
    plugins: [
      {
        requestDidStart: async () => ({
          async willSendResponse(requestContext) {
            // remember to dispose the scoped container to prevent memory leaks
            await requestContext.context.container.dispose()
          },
        }),
      },
    ] as ApolloServerPlugin<Context>[],
  })

  // start the server
  const { url } = await server.listen(4000)
  console.log(`Server is running, GraphQL Playground available at ${url}`)
}

main()
