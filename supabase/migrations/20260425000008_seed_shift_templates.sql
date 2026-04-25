-- 008_seed_shift_templates.sql

INSERT INTO public.shift_templates (name, slug, description, profession, pattern, cycle_days, sort_order)
VALUES
  ('3x12 Night', '3x12-night', '3 ночных по 12 часов, 4 выходных', 'nurse',
   '{"cycle":[{"type":"night","start":"19:00","end":"07:00"},{"type":"night","start":"19:00","end":"07:00"},{"type":"night","start":"19:00","end":"07:00"},{"type":"off"},{"type":"off"},{"type":"off"},{"type":"off"}]}'::jsonb,
   7, 10),
  ('3x12 Day', '3x12-day', '3 дневных по 12 часов, 4 выходных', 'nurse',
   '{"cycle":[{"type":"day","start":"07:00","end":"19:00"},{"type":"day","start":"07:00","end":"19:00"},{"type":"day","start":"07:00","end":"19:00"},{"type":"off"},{"type":"off"},{"type":"off"},{"type":"off"}]}'::jsonb,
   7, 11),
  ('3x12 Rotating', '3x12-rotating', '3 дневных, 4 выходных, 3 ночных, 4 выходных', 'nurse',
   '{"cycle":[{"type":"day","start":"07:00","end":"19:00"},{"type":"day","start":"07:00","end":"19:00"},{"type":"day","start":"07:00","end":"19:00"},{"type":"off"},{"type":"off"},{"type":"off"},{"type":"off"},{"type":"night","start":"19:00","end":"07:00"},{"type":"night","start":"19:00","end":"07:00"},{"type":"night","start":"19:00","end":"07:00"},{"type":"off"},{"type":"off"},{"type":"off"},{"type":"off"}]}'::jsonb,
   14, 12),
  ('24/48', '24-48', '24 часа на дежурстве, 48 часов выходных', 'firefighter',
   '{"cycle":[{"type":"day","start":"08:00","end":"08:00"},{"type":"off"},{"type":"off"}]}'::jsonb,
   3, 20),
  ('48/96', '48-96', '48 часов на дежурстве, 96 часов выходных', 'firefighter',
   '{"cycle":[{"type":"day","start":"08:00","end":"08:00"},{"type":"day","start":"08:00","end":"08:00"},{"type":"off"},{"type":"off"},{"type":"off"},{"type":"off"}]}'::jsonb,
   6, 21),
  ('Continental 2/2/4', 'continental-2-2-4', '2 дневных, 2 ночных, 4 выходных', 'factory',
   '{"cycle":[{"type":"day","start":"06:00","end":"18:00"},{"type":"day","start":"06:00","end":"18:00"},{"type":"night","start":"18:00","end":"06:00"},{"type":"night","start":"18:00","end":"06:00"},{"type":"off"},{"type":"off"},{"type":"off"},{"type":"off"}]}'::jsonb,
   8, 30)
ON CONFLICT (slug) DO NOTHING;

-- Auto-create profile/settings/subscription/streak rows on auth.users INSERT.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
