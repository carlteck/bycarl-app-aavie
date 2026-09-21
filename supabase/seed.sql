-- Données FICTIVES de développement, chargées uniquement par `supabase db reset` (pile locale).
-- `supabase db push` ne les envoie jamais au projet distant. Ne rien y mettre de réel : les
-- contenus publiés viennent du site (catalogues) ou sont rédigés dans Supabase (manuel).

insert into public.regulatory_news (id, title, description, tag, published_date, source_name, source_url) values
  ('11111111-1111-4111-8111-111111111111', 'Exemple : nouvelle aide (fictif)',
   E'Texte **fictif** pour vérifier l''affichage.\n\n- premier point\n- second point',
   'Guyane', '2026-09-01', 'Source fictive', 'https://www.service-public.fr')
on conflict (id) do nothing;

insert into public.resources (id, title, category, description, content, url, duration_label) values
  ('22222222-2222-4222-8222-222222222222', 'Exemple : préparer un dossier (fictif)', 'Guides',
   'Guide fictif de développement.', E'# Préparer un dossier\n\n1. Rassembler les pièces\n2. Vérifier les dates',
   'https://www.service-public.fr', '5 min')
on conflict (id) do nothing;

insert into public.directory_contacts (id, name, category, address, phone, hours, description, website) values
  ('33333333-3333-4333-8333-333333333333', 'Organisme fictif', 'Local (Guyane)', '1 rue Exemple, 97300 Cayenne',
   '0594000000', 'Lun–ven 8h–16h', 'Fiche fictive de développement.', 'https://www.service-public.fr')
on conflict (id) do nothing;

insert into public.mobile_manual_sections (id, title, summary, icon, position) values
  ('44444444-4444-4444-8444-444444444444', 'Prendre en main AAVIE', 'Les premiers pas.', 'compass-outline', 1)
on conflict (id) do nothing;

insert into public.mobile_manual_articles (id, section_id, title, summary, body, position) values
  ('55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444444',
   'Ajouter une échéance', 'Dans le planificateur.',
   E'Ouvrez **Planificateur**, puis appuyez sur « Ajouter ».\n\n- Donnez un titre\n- Choisissez la date', 1)
on conflict (id) do nothing;
