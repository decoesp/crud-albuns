describe('Authentication', () => {
  beforeEach(() => {
    cy.logout()
  })

  describe('Login Page', () => {
    it('should display login form', () => {
      cy.visit('/login')

      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Entrar')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/login')

      cy.get('button[type="submit"]').click()

      cy.contains('Email é obrigatório').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')

      cy.get('input[name="email"]').type('invalid@example.com')
      cy.get('input[name="password"]').type('WrongPassword@123')
      cy.get('button[type="submit"]').click()

      cy.contains('Credenciais inválidas').should('be.visible')
    })

    it('should redirect to albums after successful login', () => {
      cy.register('Test User', 'e2e-login@example.com', 'Test@123')
      cy.logout()

      cy.visit('/login')

      cy.get('input[name="email"]').type('e2e-login@example.com')
      cy.get('input[name="password"]').type('Test@123')
      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/albums')
    })
  })

  describe('Register Page', () => {
    it('should display registration form', () => {
      cy.visit('/register')

      cy.get('input[name="name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Concluir')
    })

    it('should show password requirements', () => {
      cy.visit('/register')

      cy.get('input[name="password"]').type('weak')

      cy.contains('8 caracteres').should('be.visible')
    })

    it('should register new user and redirect to albums', () => {
      const uniqueEmail = `e2e-register-${Date.now()}@example.com`

      cy.visit('/register')

      cy.get('input[name="name"]').type('E2E Test User')
      cy.get('input[name="email"]').type(uniqueEmail)
      cy.get('input[name="password"]').type('Test@123')
      cy.get('button[type="submit"]').click()

      cy.url().should('include', '/albums')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when accessing albums without auth', () => {
      cy.visit('/albums')

      cy.url().should('include', '/login')
    })

    it('should allow access to albums when authenticated', () => {
      cy.register('Auth User', `e2e-auth-${Date.now()}@example.com`, 'Test@123')

      cy.visit('/albums')

      cy.url().should('include', '/albums')
      cy.contains('Meus Álbuns').should('be.visible')
    })
  })
})
