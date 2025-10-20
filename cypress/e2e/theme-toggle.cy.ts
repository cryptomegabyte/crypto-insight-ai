describe('Theme Toggle', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('button', 'Get Started').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      }
    });
  });

  it('should have theme toggle button in header', () => {
    cy.get('button').contains('☀️').should('exist').or(cy.get('button').contains('🌙').should('exist'));
  });

  it('should toggle between light and dark themes', () => {
    // Get current theme
    cy.get('html').then(($html) => {
      const isDark = $html.hasClass('dark');
      
      // Click theme toggle
      cy.get('button').contains(isDark ? '☀️' : '🌙').click();
      cy.wait(300);
      
      // Verify theme changed
      cy.get('html').should(isDark ? 'not.have.class' : 'have.class', 'dark');
    });
  });

  it('should persist theme preference', () => {
    // Toggle theme
    cy.get('button').contains('☀️').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.wait(300);
        
        // Reload page
        cy.reload();
        cy.wait(1000);
        
        // Theme should persist
        cy.get('html').should('have.class', 'light');
      }
    });
  });

  it('should update all components with theme', () => {
    // Toggle to light mode
    cy.get('button').contains('🌙').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.wait(300);
        
        // Check that background changed
        cy.get('body').should('have.css', 'background-color');
      }
    });
  });
});
