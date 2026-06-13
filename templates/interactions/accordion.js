document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('button[aria-controls]');
  accordions.forEach((btn) => {
    btn.addEventListener('click', function () {
      const contentId = this.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      this.setAttribute('aria-expanded', String(!isExpanded));
      this.setAttribute('data-state', isExpanded ? 'closed' : 'open');

      if (content) {
        content.setAttribute('data-state', isExpanded ? 'closed' : 'open');
        if (isExpanded) {
          content.setAttribute('hidden', '');
        } else {
          content.removeAttribute('hidden');
        }
      }
    });
  });
});
