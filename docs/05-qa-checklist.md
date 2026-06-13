# QA Checklist

## General

- [ ] Work was done on staging first.
- [ ] Full backup exists.
- [ ] Page does not publish automatically.
- [ ] No secrets, API keys, passwords, or production-only URLs are in code.

## Visual

- [ ] Desktop layout matches source.
- [ ] Tablet layout works.
- [ ] Mobile layout works.
- [ ] Fonts load correctly.
- [ ] Images load correctly.
- [ ] No horizontal overflow.
- [ ] Header and footer behavior is correct for selected compatibility mode.

## Interaction

- [ ] Accordion opens/closes.
- [ ] Popup opens/closes.
- [ ] Mobile menu works.
- [ ] Multi-step form works.
- [ ] Pricing/calculation state works.
- [ ] Sticky CTA works if present.

## CF7 / CFDB7

- [ ] CF7 form renders without layout break.
- [ ] Required validation works.
- [ ] Hidden fields are filled.
- [ ] Email notification receives all fields.
- [ ] HTML email is readable.
- [ ] CFDB7 stores the submission.
- [ ] Error state is visible to user.
- [ ] Success state is visible to user.

## Tracking

- [ ] `lovable_landing_view` fires.
- [ ] `lovable_popup_open` fires.
- [ ] `lovable_form_start` fires.
- [ ] `lovable_form_submit_success` fires.
- [ ] PixelYourSite/GTM catches the event.
- [ ] UTM parameters are captured if expected.

## SEO / RankMath

- [ ] SEO title is set.
- [ ] Meta description is set.
- [ ] Focus keyword is set if used.
- [ ] Canonical URL is correct.
- [ ] Open Graph title/image are correct.
- [ ] FAQ schema is added if needed.
- [ ] Page content is visible in HTML for SEO-important pages.

## Performance

- [ ] Only required landing assets load.
- [ ] Lovable app assets load only on pages with shortcode.
- [ ] Elementor assets are dequeued only when clean mode requires it.
- [ ] No console errors.
- [ ] No missing asset 404s.
- [ ] Images are compressed.

## Production

- [ ] Staging QA passed.
- [ ] Rollback plan exists.
- [ ] Production cache cleared.
- [ ] Production form tested.
- [ ] Production tracking tested.
