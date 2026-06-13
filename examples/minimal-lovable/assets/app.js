document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('[data-demo-button]');
  const result = document.querySelector('[data-demo-result]');
  if (!button || !result) return;

  button.addEventListener('click', () => {
    result.textContent = 'JavaScript cua landing page da hoat dong.';
  });
});
