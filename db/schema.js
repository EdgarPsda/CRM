const { gql } = require("apollo-server-core");

// Schema
const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        createdAt: String
    }

    type Token {
        token: String
    }

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        createdAt: String
    }

    type Client {
        id: ID
        name: String
        lastName: String
        company: String
        email: String
        phone: String
        vendor: ID
    }

    type Order {
        id: ID
        order: [OrderGroup]
        total: Float
        client: ID
        vendor: ID
        date: String
        status: OrderStatus
    }

    type OrderGroup {
        id: ID
        quantity: Int
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input ClientInput {
        name: String!
        lastName: String!
        company: String!
        email: String!
        phone: String
    }

    input OrderProductInput {
        id: ID
        quantity: Int
    }

    input OrderInput {
        order: [OrderProductInput]
        total: Float
        client: ID
        status: OrderStatus
    }

    enum OrderStatus {
        PENDING
        COMPLETED
        CANCELED
    }


    type Query {

        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        # Clients
        getClients: [Client]
        getClientsByVendor: [Client]
        getClient(id: ID!): Client

        # Orders
        getOrders: [Order]
        getOrdersByVendor: [Order]
        getOrder(id: ID!): Order
        getOrdersByStatus(state: String!): [Order]
    }

    type Mutation {

        # Users
        newUser(input: UserInput): User
        authenticateUser(input: AuthInput): Token

        # Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String

        # Clients
        newClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): String

        # Orders
        newOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderInput): Order
        deleteOrder(id: ID!): String
    }

`;

module.exports = typeDefs;