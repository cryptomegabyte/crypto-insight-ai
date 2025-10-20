describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the landing page with hero section', () => {
    cy.contains('Crypto Insight AI').should('be.visible');
    cy.contains('AI-Powered Trading Intelligence').should('be.visible');
  });

  it('should have a "Get Started" button', () => {
    cy.contains('button', 'Get Started').should('be.visible');
  });

  it('should navigate to dashboard when clicking Get Started', () => {
    cy.contains('button', 'Get Started').click();
    cy.url().should('not.include', '#landing');
  });

  it('should display feature cards', () => {
    cy.contains('Real-time Market Data').should('be.visible');
    cy.contains('AI Trading Assistant').should('be.visible');
    cy.contains('Technical Indicators').should('be.visible');
  });
});
