/// <reference types="cypress" />

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('accessToken', response.body.accessToken)
    window.localStorage.setItem('refreshToken', response.body.refreshToken)
  })
})

Cypress.Commands.add('register', (name: string, email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: { name, email, password }
  }).then((response) => {
    window.localStorage.setItem('accessToken', response.body.accessToken)
    window.localStorage.setItem('refreshToken', response.body.refreshToken)
  })
})

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('refreshToken')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      register(name: string, email: string, password: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}

export {}
