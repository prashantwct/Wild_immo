# Wildlife Immobilization App Test Plan

## Core Functionality Tests

### Calculator Features
- [ ] Enter valid weight and select species - verify correct drug calculations
- [ ] Change weight units (kg/lbs) - verify recalculation
- [ ] Test all available species protocols
- [ ] Verify "Custom" option works correctly
- [ ] Test reversal drug calculations
- [ ] Test emergency drug calculations

### Immobilization Event Tracking
- [ ] Create new immobilization event
- [ ] Record animal details (species, sex, age, etc.)
- [ ] Record vital signs at different intervals
- [ ] Test induction phase tracking
- [ ] Test recovery phase tracking
- [ ] Edit existing event information
- [ ] Delete an event

### Drug Administration 
- [ ] Record drug administration with all fields
- [ ] Verify drug history displays correctly
- [ ] Test different drug routes (IM, IV, etc.)
- [ ] Verify timestamps are recorded correctly

### Export Functionality
- [ ] Generate report for a single event
- [ ] Verify all event data appears in report
- [ ] Verify measurement filtering works
- [ ] Verify drug administration data shows correctly

## Technical Tests

### Data Persistence
- [ ] Verify data saves to localStorage
- [ ] Test data retrieval after page refresh
- [ ] Test with large datasets

### Responsive Design
- [ ] Test on mobile devices (320px width)
- [ ] Test on tablets (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Verify UI components adapt correctly to different screen sizes

### Accessibility
- [ ] Test keyboard navigation
- [ ] Verify appropriate ARIA attributes
- [ ] Test with screen reader
- [ ] Check color contrast for readability

### Error Handling
- [ ] Test with invalid inputs
- [ ] Test with missing required fields
- [ ] Verify appropriate error messages display

## Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Performance
- [ ] Page load time under 3 seconds
- [ ] Smooth transitions between pages
- [ ] Responsive UI with no lag during interactions

## Notes for Manual Testing
Use this checklist during manual testing of the application. Document any issues found with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if possible

This test plan should be updated as new features are added to the application.
