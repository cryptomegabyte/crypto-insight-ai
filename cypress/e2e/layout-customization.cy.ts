describe('Layout Customization', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('button', 'Get Started').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      }
    });
    cy.wait(1000);
  });

  it('should have layout control button', () => {
    cy.contains('Layout').should('be.visible');
  });

  it('should open layout control panel', () => {
    cy.contains('button', 'Layout').click();
    cy.contains('Layout Presets').should('be.visible');
  });

  it('should show panel visibility toggles', () => {
    cy.contains('button', 'Layout').click();
    cy.contains('Panel Visibility').should('be.visible');
    
    // Check for panel toggles
    cy.contains('Chart').should('exist');
    cy.contains('Market Data').should('exist');
    cy.contains('AI Feed').should('exist');
  });

  it('should toggle panel visibility', () => {
    cy.contains('button', 'Layout').click();
    
    // Find and toggle a panel (e.g., Market Data)
    cy.contains('Panel Visibility').parent().within(() => {
      cy.contains('Market Data').parent().find('input[type="checkbox"]').click();
    });
    
    // Close panel
    cy.get('body').click(0, 0);
    cy.wait(500);
  });

  it('should have preset layout options', () => {
    cy.contains('button', 'Layout').click();
    
    cy.contains('Default').should('exist').or(
      cy.contains('Compact').should('exist')
    ).or(
      cy.contains('Trading Focus').should('exist')
    );
  });

  it('should apply preset layouts', () => {
    cy.contains('button', 'Layout').click();
    
    // Click a preset
    cy.contains('Compact').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.wait(500);
      }
    });
  });

  it('should persist layout changes', () => {
    cy.contains('button', 'Layout').click();
    
    // Make a change
    cy.contains('Panel Visibility').parent().within(() => {
      cy.contains('Opportunities').parent().find('input[type="checkbox"]').then(($checkbox) => {
        const wasChecked = $checkbox.is(':checked');
        cy.wrap($checkbox).click();
        
        // Reload page
        cy.reload();
        cy.wait(1000);
        
        // Open layout panel again
        cy.contains('button', 'Layout').click();
        
        // Verify change persisted
        cy.contains('Opportunities').parent().find('input[type="checkbox"]').should(
          wasChecked ? 'not.be.checked' : 'be.checked'
        );
      });
    });
  });
});
