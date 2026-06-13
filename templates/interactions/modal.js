document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-modal-open');
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('is-open');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'lovable_popup_open', modal_id: id });
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modal = trigger.closest('.lovable-modal');
      if (modal) modal.classList.remove('is-open');
    });
  });
});
