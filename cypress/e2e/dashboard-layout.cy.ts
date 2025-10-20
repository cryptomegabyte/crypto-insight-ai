describe('Dashboard Layout', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000); // Wait for initial load
    
    // Skip landing page if present
    cy.get('body').then(($body) => {
      if ($body.text().includes('Get Started')) {
        cy.contains('Get Started').click();
        cy.wait(1000);
      }
    });
  });

  it('should display the main dashboard', () => {
    cy.contains('Crypto Insight AI').should('be.visible');
  });

  it('should display the header with trading pair selector', () => {
    cy.get('header').should('be.visible');
    cy.contains('BTC/USD').should('be.visible');
  });

  it('should have theme toggle button', () => {
    cy.get('button').contains('☀️').should('exist').or(cy.get('button').contains('🌙').should('exist'));
  });

  it('should display chart panel', () => {
    cy.contains('Chart').should('be.visible');
  });

  it('should display market data panel', () => {
    cy.contains('Market Data').should('be.visible');
  });

  it('should display AI Trading Feed panel', () => {
    cy.contains('AI Trading Feed').should('be.visible');
  });

  it('should display AI Assistant panel', () => {
    cy.contains('AI Assistant').should('be.visible');
  });

  it('should be responsive and allow panel resizing', () => {
    // Check that grid layout exists
    cy.get('.react-grid-layout').should('exist');
  });
});
