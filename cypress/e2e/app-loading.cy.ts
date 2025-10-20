describe('App Loading', () => {
  it('should load the application successfully', () => {
    cy.visit('/');
    cy.get('#root', { timeout: 10000 }).should('exist');
    cy.get('body').should('be.visible');
  });

  it('should display either landing page or dashboard', () => {
    cy.visit('/');
    
    // Check if either landing page or dashboard is visible
    cy.get('body').then(($body) => {
      const hasGetStarted = $body.text().includes('Get Started');
      const hasCryptoInsight = $body.text().includes('Crypto Insight');
      expect(hasGetStarted || hasCryptoInsight).to.be.true;
    });
  });

  it('should have working navigation', () => {
    cy.visit('/');
    
    // If landing page is shown, click Get Started
    cy.get('body').then(($body) => {
      if ($body.text().includes('Get Started')) {
        cy.contains('Get Started').click();
        cy.wait(1000);
      }
    });
    
    // Should now show the dashboard
    cy.contains('Crypto Insight').should('be.visible');
  });
});
